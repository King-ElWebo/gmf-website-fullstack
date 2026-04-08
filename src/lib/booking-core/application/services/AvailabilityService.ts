import { BookingRepository, CalendarBlockerRepository } from "../ports";
import { BookingModuleConfig } from "../../domain/config";
import { BookingConflict } from "../../domain/models";

export interface ItemAvailabilityDetail {
  resourceId: string;
  requestedQuantity: number;
  availableQuantity: number | null;
  totalStock: number | null;
  trackInventory: boolean;
  isAvailable: boolean;
}

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  conflicts: BookingConflict[];
  availableQuantity?: number;
  items: ItemAvailabilityDetail[];
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
    excludeBookingId?: string
  ): Promise<AvailabilityCheckResult> {
    const conflicts: BookingConflict[] = [];
    const inventoryRows = await this.bookingRepo.getResourceInventories(
      Array.from(new Set(items.map((item) => item.resourceId)))
    );
    const inventoryByResourceId = new Map(
      inventoryRows.map((entry) => [entry.resourceId, entry])
    );
    const itemDetails: ItemAvailabilityDetail[] = [];

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

    return {
      isAvailable: conflicts.length === 0,
      conflicts,
      items: itemDetails,
    };
  }
}
