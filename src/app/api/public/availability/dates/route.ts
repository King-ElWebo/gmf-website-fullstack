import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function isResourceActiveOnDate(
  blockTime: string,
  startDate: Date,
  endDate: Date,
  targetDate: Date
) {
  const s = new Date(startDate); s.setHours(0, 0, 0, 0);
  const e = new Date(endDate); e.setHours(0, 0, 0, 0);
  const t = new Date(targetDate); t.setHours(0, 0, 0, 0);
  
  if (blockTime === "START_DAY_ONLY") return t.getTime() === s.getTime();
  if (blockTime === "START_AND_END_DAYS") return t.getTime() === s.getTime() || t.getTime() === e.getTime();
  return true; // ENTIRE_DURATION
}

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
    const blockingBookings = await db.booking.findMany({
      where: {
        status: "approved",
        startDate: { lte: rangeEnd },
        endDate: { gte: rangeStart },
        items: {
          some: {
            itemId: { in: resourceIds },
          },
        },
      },
      select: {
        startDate: true,
        endDate: true,
        items: {
          where: {
            itemId: { in: resourceIds },
          },
          select: {
            itemId: true,
            quantity: true,
          },
        },
      },
    });

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

    // 3. Fetch items and their resource dependencies
    const items = await db.item.findMany({
      where: { id: { in: resourceIds } },
      select: { 
        id: true, trackInventory: true, totalStock: true,
        pickupAvailable: true, deliveryAvailable: true,
        availabilityMode: true, resourceId: true, resourceUnits: true,
        resourceAppliesTo: true, resourceBlockTime: true,
        resource: { select: { capacityPerDay: true } }
      },
    });

    const relevantResourceIds = Array.from(new Set(items.map(i => i.resourceId).filter(Boolean))) as string[];
    
    // 3.5 Fetch ALL approved bookings in the range to compute global blocked dates and resource usage
    const allApprovedBookings = await db.booking.findMany({
      where: {
        status: "approved",
        startDate: { lte: rangeEnd },
        endDate: { gte: rangeStart },
      },
      include: {
        items: {
          include: {
            item: {
              select: {
                id: true,
                resourceId: true,
                availabilityMode: true,
                resourceUnits: true,
                resourceAppliesTo: true,
                resourceBlockTime: true
              }
            }
          }
        }
      }
    });

    const globalBlockedDates = new Set<string>();
    for (const booking of allApprovedBookings) {
      const hasSetupItem = booking.items.some((bi) => bi.item?.availabilityMode && bi.item.availabilityMode !== "STOCK_ONLY");
      if (hasSetupItem) {
        globalBlockedDates.add(booking.startDate.toISOString().slice(0, 10));
        globalBlockedDates.add(booking.endDate.toISOString().slice(0, 10));
      }
    }

    // 4. For each day in the range, check if at least one resource is fully booked
    const unavailableDates: string[] = [];
    const current = new Date(rangeStart);

    while (current <= rangeEnd) {
      const dateStr = current.toISOString().slice(0, 10);
      
      // Global Tagesblocker Check
      if (globalBlockedDates.has(dateStr)) {
        unavailableDates.push(dateStr);
        current.setUTCDate(current.getUTCDate() + 1);
        continue;
      }

      const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

      // Calculate consumed capacity for each relevant resource on this day
      const resourceUsageMap = new Map<string, { units: number; isExclusive: boolean }>();
      for (const resId of relevantResourceIds) {
          resourceUsageMap.set(resId, { units: 0, isExclusive: false });
      }

      for (const booking of allApprovedBookings) {
          if (booking.startDate <= dayEnd && booking.endDate >= dayStart) {
              for (const bi of booking.items) {
                  const bItem = bi.item;
                  if (!bItem || !bItem.resourceId || !relevantResourceIds.includes(bItem.resourceId)) continue;
                  if (bItem.availabilityMode === "STOCK_ONLY") continue;

                  const appliesTo = bItem.resourceAppliesTo;
                  const isDeliveryBooking = booking.deliveryType === "delivery";
                  const isPickupBooking = booking.deliveryType === "pickup";

                  if (appliesTo === "DELIVERY_ONLY" && !isDeliveryBooking) continue;
                  if (appliesTo === "PICKUP_ONLY" && !isPickupBooking) continue;

                  const blockTime = bItem.resourceBlockTime || "ENTIRE_DURATION";
                  if (!isResourceActiveOnDate(blockTime, booking.startDate, booking.endDate, dayStart)) continue;

                  const existing = resourceUsageMap.get(bItem.resourceId)!;
                  existing.units += (bItem.resourceUnits * bi.quantity);
                  if (bItem.availabilityMode === "EXCLUSIVE_RESOURCE") {
                      existing.isExclusive = true;
                  }
              }
          }
      }

      // Check each resource
      let anyUnavailable = false;

      for (const item of items) {
        // Check calendar blockers
        const isBlocked = calendarBlockers.some((b) => {
          const overlaps =
            b.startDate <= dayEnd && b.endDate >= dayStart;
          if (!overlaps) return false;
          if (b.appliesToAllItems) return true;
          return b.items.some((bi) => bi.itemId === item.id);
        });

        if (isBlocked) {
          anyUnavailable = true;
          break;
        }

        // Count reservations for this day (stock check)
        if (item.trackInventory) {
          let reservedQty = 0;
          for (const booking of blockingBookings) {
            if (booking.startDate <= dayEnd && booking.endDate >= dayStart) {
              for (const bi of booking.items) {
                if (bi.itemId === item.id) {
                  reservedQty += bi.quantity;
                }
              }
            }
          }

          if (reservedQty >= item.totalStock) {
            anyUnavailable = true;
            break;
          }
        }

        // Resource check
        let canPickup = item.pickupAvailable;
        let canDeliver = item.deliveryAvailable;

        if (item.availabilityMode !== "STOCK_ONLY" && item.resourceId) {
            const usage = resourceUsageMap.get(item.resourceId);
            const capacity = item.resource?.capacityPerDay ?? 0;
            const isExclusive = item.availabilityMode === "EXCLUSIVE_RESOURCE";
            
            const isExceeded = (requestedUsage: number, exclusiveRequested: boolean) => {
                if (!usage) return false;
                if (usage.isExclusive) return true;
                if (exclusiveRequested && usage.units > 0) return true;
                if (usage.units + requestedUsage > capacity) return true;
                return false;
            };

            const requestedUnits = item.resourceUnits * 1; 

            if (item.resourceAppliesTo === "PICKUP_ONLY" || item.resourceAppliesTo === "BOTH") {
                if (isExceeded(requestedUnits, isExclusive)) canPickup = false;
            }
            if (item.resourceAppliesTo === "DELIVERY_ONLY" || item.resourceAppliesTo === "BOTH") {
                if (isExceeded(requestedUnits, isExclusive)) canDeliver = false;
            }
        }

        if (!canPickup && !canDeliver) {
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
