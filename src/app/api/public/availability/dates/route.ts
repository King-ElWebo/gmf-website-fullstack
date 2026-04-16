import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Returns an array of date strings (YYYY-MM-DD) that are unavailable
 * for ALL given resource IDs within a given month range.
 *
 * Body: { resourceIds: string[], monthStart: string, monthEnd: string }
 * monthStart / monthEnd are YYYY-MM-DD (first and last day of the visible range).
 */
export async function POST(req: Request) {
  try {
    const { resourceIds, monthStart, monthEnd } = await req.json();

    if (
      !Array.isArray(resourceIds) ||
      resourceIds.length === 0 ||
      !monthStart ||
      !monthEnd
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const rangeStart = new Date(`${monthStart}T00:00:00.000Z`);
    const rangeEnd = new Date(`${monthEnd}T23:59:59.999Z`);

    // 1. Fetch all blocking bookings in range for any of these items
    const blockingBookings: any[] = [];

    // 2. Fetch all calendar blockers in range
    const calendarBlockers = await db.calendarBlocker.findMany({
      where: {
        startDate: { lte: rangeEnd },
        endDate: { gte: rangeStart },
        OR: [
          { appliesToAllItems: true },
          { items: { some: { itemId: { in: resourceIds } } } },
        ],
      },
      select: {
        startDate: true,
        endDate: true,
        appliesToAllItems: true,
        items: {
          where: { itemId: { in: resourceIds } },
          select: { itemId: true },
        },
      },
    });

    // 3. Fetch inventory for each resource
    const inventoryRows = await db.item.findMany({
      where: { id: { in: resourceIds } },
      select: { id: true, trackInventory: true, totalStock: true },
    });
    const inventoryMap = new Map(
      inventoryRows.map((row) => [
        row.id,
        { trackInventory: row.trackInventory, totalStock: row.totalStock },
      ])
    );

    // 4. For each day in the range, check if at least one resource is fully booked
    const unavailableDates: string[] = [];
    const current = new Date(rangeStart);

    while (current <= rangeEnd) {
      const dateStr = current.toISOString().slice(0, 10);
      const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

      // Check each resource
      let anyUnavailable = false;

      for (const resourceId of resourceIds) {
        const inv = inventoryMap.get(resourceId);
        if (!inv || !inv.trackInventory) continue;

        // Check calendar blockers
        const isBlocked = calendarBlockers.some((b) => {
          const overlaps =
            b.startDate <= dayEnd && b.endDate >= dayStart;
          if (!overlaps) return false;
          if (b.appliesToAllItems) return true;
          return b.items.some((bi) => bi.itemId === resourceId);
        });

        if (isBlocked) {
          anyUnavailable = true;
          break;
        }

        // Count reservations for this day
        let reservedQty = 0;
        for (const booking of blockingBookings) {
          if (booking.startDate <= dayEnd && booking.endDate >= dayStart) {
            for (const bi of booking.items) {
              if (bi.itemId === resourceId) {
                reservedQty += bi.quantity;
              }
            }
          }
        }

        if (reservedQty >= inv.totalStock) {
          anyUnavailable = true;
          break;
        }
      }

      if (anyUnavailable) {
        unavailableDates.push(dateStr);
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }

    return NextResponse.json({ unavailableDates });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch unavailable dates",
      },
      { status: 500 }
    );
  }
}
