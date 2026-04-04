import { AvailabilityService } from "./application/services/AvailabilityService";
import { AdminBookingCommands } from "./application/use-cases/AdminBookingCommands";
import { PublicBookingUseCases } from "./application/use-cases/PublicBookingUseCases";
import type { BookingModuleConfig } from "./domain/config";
import { PrismaBookingRepository } from "./infrastructure/database/PrismaBookingRepository";
import { PrismaCalendarBlockerRepository } from "@/lib/calendar/blocker-repository";

const bookingModuleConfig: BookingModuleConfig = {
  blockingStatuses: ["approved", "requested"],
  requiresApproval: true,
  trackInventoryGlobally: true,
  useTimeSlots: false,
  allowMultipleItemsPerBooking: true,
  features: {
    calendarSync: false,
    emailNotifications: false,
    deliveryManagement: false,
  },
};

export function createAvailabilityService() {
  return new AvailabilityService(
    new PrismaBookingRepository(),
    bookingModuleConfig,
    new PrismaCalendarBlockerRepository()
  );
}

export function createPublicBookingUseCases() {
  const bookingRepo = new PrismaBookingRepository();
  return new PublicBookingUseCases(bookingRepo, createAvailabilityService());
}

export function createAdminBookingCommands() {
  const bookingRepo = new PrismaBookingRepository();
  return new AdminBookingCommands(bookingRepo, createAvailabilityService());
}
