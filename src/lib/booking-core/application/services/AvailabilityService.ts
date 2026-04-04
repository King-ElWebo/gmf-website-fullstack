import { BookingRepository, CalendarBlockerRepository } from "../ports";
import { BookingModuleConfig } from "../../domain/config";
import { BookingConflict } from "../../domain/models";

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  conflicts: BookingConflict[];
  availableQuantity?: number;
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

      if (overlaps.length > 0) {
        conflicts.push({
          bookingId: overlaps[0].id,
          resourceIds: [item.resourceId],
          reason: "oversold",
          severity: "critical",
        });
        continue;
      }

      if (blockerOverlaps.length > 0) {
        conflicts.push({
          bookingId: blockerOverlaps[0].id,
          resourceIds: [item.resourceId],
          reason: "maintenance",
          severity: "critical",
        });
      }
    }

    return {
      isAvailable: conflicts.length === 0,
      conflicts,
    };
  }
}
