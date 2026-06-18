import { BookingRepository, CalendarBlockerRepository } from "../ports";
import { BookingModuleConfig } from "../../domain/config";
import { BookingConflict } from "../../domain/models";
import { db } from "@/lib/db";

export interface ItemAvailabilityDetail {
  resourceId: string;
  requestedQuantity: number;
  availableQuantity: number | null;
  totalStock: number | null;
  trackInventory: boolean;
  isAvailable: boolean;
  resourceLimitReached?: boolean;
}

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  conflicts: BookingConflict[];
  availableQuantity?: number;
  items: ItemAvailabilityDetail[];
}

function getDatesInRange(startDate: Date, endDate: Date) {
  const dates = [];
  let current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

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

export class AvailabilityService {
  constructor(
    private bookingRepo: BookingRepository,
    private config: BookingModuleConfig,
    private calendarBlockerRepo?: CalendarBlockerRepository
  ) {}

  async checkAvailability(
    items: { resourceId: string; quantity: number }[],
    start: Date,
    end: Date,
    excludeBookingId?: string,
    deliveryType?: string
  ): Promise<AvailabilityCheckResult> {
    const conflicts: BookingConflict[] = [];
    const inventoryRows = await this.bookingRepo.getResourceInventories(
      Array.from(new Set(items.map((item) => item.resourceId)))
    );
    const inventoryByResourceId = new Map(
      inventoryRows.map((entry) => [entry.resourceId, entry])
    );
    const itemDetails: ItemAvailabilityDetail[] = [];

    // --- PHASE 1: Item Stock Check ---
    for (const item of items) {
      let overlaps = await this.bookingRepo.findOverlapping(
        item.resourceId,
        start,
        end,
        this.config.blockingStatuses
      );

      if (excludeBookingId) {
        overlaps = overlaps.filter((overlap) => overlap.id !== excludeBookingId);
      }

      const blockerOverlaps = this.calendarBlockerRepo
        ? await this.calendarBlockerRepo.findOverlapping(item.resourceId, start, end)
        : [];

      if (blockerOverlaps.length > 0) {
        conflicts.push({
          bookingId: blockerOverlaps[0].id,
          resourceIds: [item.resourceId],
          reason: "maintenance",
          severity: "critical",
        });

        itemDetails.push({
          resourceId: item.resourceId,
          requestedQuantity: item.quantity,
          availableQuantity: 0,
          totalStock: 0,
          trackInventory: true,
          isAvailable: false,
        });
        continue;
      }

      const inventory = inventoryByResourceId.get(item.resourceId);
      if (!inventory) {
        conflicts.push({
          bookingId: "unknown-item",
          resourceIds: [item.resourceId],
          reason: "status_collision",
          severity: "critical",
        });
        itemDetails.push({
          resourceId: item.resourceId,
          requestedQuantity: item.quantity,
          availableQuantity: 0,
          totalStock: 0,
          trackInventory: true,
          isAvailable: false,
        });
        continue;
      }

      if (!inventory.trackInventory) {
        itemDetails.push({
          resourceId: item.resourceId,
          requestedQuantity: item.quantity,
          availableQuantity: null,
          totalStock: null,
          trackInventory: false,
          isAvailable: true,
        });
        continue;
      }

      const reservedQuantity = overlaps.reduce((sum, overlap) => {
        const matchingItems = (overlap.items as Array<{ resourceId?: string; itemId?: string; quantity?: number }> | undefined) ?? [];
        const overlapItemQuantity = matchingItems
          .filter((overlapItem) => (overlapItem.resourceId || overlapItem.itemId) === item.resourceId)
          .reduce((itemSum, overlapItem) => itemSum + (Number(overlapItem.quantity) || 0), 0);
        return sum + overlapItemQuantity;
      }, 0);

      const availableQuantity = Math.max(0, inventory.totalStock - reservedQuantity);
      const isAvailable = item.quantity <= availableQuantity;

      itemDetails.push({
        resourceId: item.resourceId,
        requestedQuantity: item.quantity,
        availableQuantity,
        totalStock: inventory.totalStock,
        trackInventory: true,
        isAvailable,
      });

      if (!isAvailable) {
        const bookingId = overlaps[0]?.id ?? "oversold";
        conflicts.push({
          bookingId,
          resourceIds: [item.resourceId],
          reason: "oversold",
          severity: "critical",
        });
      }
    }

    // --- PHASE 1.5: Global Setup/Teardown Block Check ---
    const allOverlappingApprovedBookings = await db.booking.findMany({
      where: {
        status: "approved",
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } },
        ]
      },
      include: {
        items: {
          include: { item: { select: { availabilityMode: true } } }
        }
      }
    });

    const globalBlockedDates = new Set<string>();
    for (const booking of allOverlappingApprovedBookings) {
      const hasSetupItem = booking.items.some(bi => bi.item?.availabilityMode && bi.item.availabilityMode !== "STOCK_ONLY");
      if (hasSetupItem) {
        globalBlockedDates.add(booking.startDate.toISOString().slice(0, 10));
        globalBlockedDates.add(booking.endDate.toISOString().slice(0, 10));
      }
    }

    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    
    if (globalBlockedDates.has(startStr) || globalBlockedDates.has(endStr)) {
      conflicts.push({
        bookingId: "global-setup-block",
        resourceIds: items.map(i => i.resourceId),
        reason: "GLOBAL_SETUP_BLOCK",
        severity: "critical"
      });
      
      for (const detail of itemDetails) {
        detail.isAvailable = false;
        (detail as any).globalBlockReached = true; 
      }
      
      return {
        isAvailable: false,
        conflicts,
        items: itemDetails
      };
    }

    // --- PHASE 2: Operational Resource Check ---
    const isPhase1Available = conflicts.length === 0;

    if (isPhase1Available && deliveryType) {
      const dbItems = await db.item.findMany({
        where: { id: { in: items.map(i => i.resourceId) } },
        include: { resource: true }
      });

      const targetDates = getDatesInRange(start, end);

      const overlappingBookings = await db.booking.findMany({
        where: {
          status: { in: this.config.blockingStatuses },
          ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
          AND: [
            { startDate: { lte: end } },
            { endDate: { gte: start } },
          ]
        },
        include: {
          items: {
            include: {
              item: {
                include: { resource: true }
              }
            }
          }
        }
      });

      for (const targetDate of targetDates) {
        const resourceUsageMap = new Map<string, { resourceId: string; units: number; isExclusive: boolean }>();

        for (const item of items) {
          const dbItem = dbItems.find(i => i.id === item.resourceId);
          if (!dbItem || !dbItem.resourceId) continue;
          if (dbItem.availabilityMode === "STOCK_ONLY") continue;

          const appliesTo = dbItem.resourceAppliesTo;
          const isDelivery = deliveryType === "delivery";
          const isPickup = deliveryType === "pickup";
          
          if (appliesTo === "DELIVERY_ONLY" && !isDelivery) continue;
          if (appliesTo === "PICKUP_ONLY" && !isPickup) continue;

          const blockTime = (dbItem as any).resourceBlockTime || "ENTIRE_DURATION";
          if (!isResourceActiveOnDate(blockTime, start, end, targetDate)) continue;

          const isExclusive = dbItem.availabilityMode === "EXCLUSIVE_RESOURCE";
          
          const existing = resourceUsageMap.get(dbItem.resourceId) || { resourceId: dbItem.resourceId, units: 0, isExclusive: false };
          existing.units += (dbItem.resourceUnits * item.quantity);
          if (isExclusive) existing.isExclusive = true;
          
          resourceUsageMap.set(dbItem.resourceId, existing);
        }

        if (resourceUsageMap.size === 0) continue;

        for (const [resId, requestedUsage] of Array.from(resourceUsageMap.entries())) {
          const resourceObj = dbItems.find(i => i.resourceId === resId)?.resource;
          if (!resourceObj) continue;

          let existingUnits = 0;
          let existingHasExclusive = false;

          for (const booking of overlappingBookings) {
            const bStart = new Date(booking.startDate); bStart.setHours(0,0,0,0);
            const bEnd = new Date(booking.endDate); bEnd.setHours(0,0,0,0);
            const tDate = new Date(targetDate); tDate.setHours(0,0,0,0);
            
            if (tDate < bStart || tDate > bEnd) continue;

            for (const bookingItem of booking.items) {
              const bItem = bookingItem.item;
              if (!bItem || bItem.resourceId !== resId) continue;
              if (bItem.availabilityMode === "STOCK_ONLY") continue;
              
              const appliesTo = bItem.resourceAppliesTo;
              const isDeliveryBooking = booking.deliveryType === "delivery";
              const isPickupBooking = booking.deliveryType === "pickup";
              
              if (appliesTo === "DELIVERY_ONLY" && !isDeliveryBooking) continue;
              if (appliesTo === "PICKUP_ONLY" && !isPickupBooking) continue;

              const blockTime = (bItem as any).resourceBlockTime || "ENTIRE_DURATION";
              if (!isResourceActiveOnDate(blockTime, booking.startDate, booking.endDate, targetDate)) continue;

              existingUnits += (bItem.resourceUnits * bookingItem.quantity);
              if (bItem.availabilityMode === "EXCLUSIVE_RESOURCE") {
                existingHasExclusive = true;
              }
            }
          }

          let conflictReason = null;
          
          if (existingHasExclusive) {
            conflictReason = "RESOURCE_CAPACITY_EXCEEDED";
          } else if (requestedUsage.isExclusive && existingUnits > 0) {
            conflictReason = "RESOURCE_CAPACITY_EXCEEDED";
          } else if (existingUnits + requestedUsage.units > resourceObj.capacityPerDay) {
            conflictReason = "RESOURCE_CAPACITY_EXCEEDED";
          }

          if (conflictReason) {
            const alreadyAdded = conflicts.find(c => c.bookingId === "resource-limit" && c.resourceIds?.includes(resId));
            if (!alreadyAdded) {
              conflicts.push({
                bookingId: "resource-limit",
                resourceIds: [resId],
                reason: "RESOURCE_CAPACITY_EXCEEDED",
                severity: "critical"
              });
            }
            
            for (const detail of itemDetails) {
              const dbItem = dbItems.find(i => i.id === detail.resourceId);
              if (dbItem?.resourceId === resId) {
                detail.isAvailable = false;
                detail.resourceLimitReached = true;
              }
            }
          }
        }
      }
    }

    return {
      isAvailable: conflicts.length === 0,
      conflicts,
      items: itemDetails,
    };
  }
}
