import { BookingRepository } from '../ports';
import { AvailabilityService } from '../services/AvailabilityService';
import { sendStatusChangeEmail, type BookingEmailContext } from '@/lib/email';

export class AdminBookingCommands {
  constructor(
    private bookingRepo: BookingRepository,
    private availabilityService: AvailabilityService
  ) {}

  /**
   * Builds a BookingEmailContext from a loaded booking entity.
   */
  private buildEmailContext(booking: any, extra?: Partial<BookingEmailContext>): BookingEmailContext {
    return {
      referenceCode: booking.referenceCode,
      customerFirstName: booking.customer?.firstName ?? "",
      customerLastName: booking.customer?.lastName ?? "",
      customerEmail: booking.customer?.email ?? "",
      customerPhone: booking.customer?.phone,
      startDate: booking.startDate instanceof Date
        ? booking.startDate.toISOString().slice(0, 10)
        : String(booking.startDate),
      endDate: booking.endDate instanceof Date
        ? booking.endDate.toISOString().slice(0, 10)
        : String(booking.endDate),
      deliveryType: booking.deliveryType ?? "",
      itemCount: booking.items?.length ?? 0,
      items: (booking.items ?? []).map((i: any) => ({
        title: i.resourceTitle || i.title || "Produkt",
        quantity: i.quantity ?? 1,
        priceType: i.priceType,
        displayPrice: i.displayPrice,
        calculatedTotalPriceCents: i.calculatedTotalPriceCents,
      })),
      customerAddress: booking.customer?.addressLine1
        ? {
            addressLine1: booking.customer.addressLine1,
            zip: booking.customer.zip,
            city: booking.customer.city,
          }
        : undefined,
      billingAddressSameAsDelivery: booking.billingAddressSameAsDelivery,
      billingAddress: booking.billingAddress ?? undefined,
      customerMessage: booking.customerMessage,
      totalPriceCents: booking.totalPriceCents ?? null,
      hasIndividualPricing: booking.hasIndividualPricing ?? false,
      ...extra,
    };
  }

  async approveBooking(bookingId: string, adminId: string): Promise<void> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'requested') throw new Error('Only requested bookings can be approved');

    const itemsToCheck = booking.items.map((i: any) => ({ resourceId: i.resourceId || i.itemId, quantity: i.quantity }));
    const avResult = await this.availabilityService.checkAvailability(
      itemsToCheck,
      booking.startDate,
      booking.endDate,
      bookingId
    );

    if (!avResult.isAvailable) {
      throw new Error(`Cannot approve: Conflict detected: ${avResult.conflicts[0].reason}`);
    }

    await this.bookingRepo.updateStatus(bookingId, 'approved');
    await this.bookingRepo.addNote(bookingId, 'Status changed to Approved', adminId);

    // Fire-and-forget: email notification
    sendStatusChangeEmail("approved", this.buildEmailContext(booking)).catch((err) => {
      console.error("[AdminBooking] Email for approval failed (non-blocking):", err);
    });
  }

  async rejectBooking(bookingId: string, reasonDetails: string, adminId: string): Promise<void> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    await this.bookingRepo.updateStatus(bookingId, 'rejected');
    await this.bookingRepo.addNote(bookingId, `Rejected: ${reasonDetails}`, adminId);

    // Fire-and-forget: email notification
    sendStatusChangeEmail("rejected", this.buildEmailContext(booking, { reason: reasonDetails })).catch((err) => {
      console.error("[AdminBooking] Email for rejection failed (non-blocking):", err);
    });
  }

  async cancelBooking(bookingId: string, reasonDetails: string, adminId: string): Promise<void> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    await this.bookingRepo.updateStatus(bookingId, 'cancelled');
    await this.bookingRepo.addNote(bookingId, `Cancelled: ${reasonDetails}`, adminId);

    // Fire-and-forget: email notification
    sendStatusChangeEmail("cancelled", this.buildEmailContext(booking, { reason: reasonDetails })).catch((err) => {
      console.error("[AdminBooking] Email for cancellation failed (non-blocking):", err);
    });
  }

  async expireBooking(bookingId: string, adminId: string): Promise<void> {
    await this.bookingRepo.updateStatus(bookingId, 'expired');
    await this.bookingRepo.addNote(bookingId, 'Automatically expired', adminId);
  }

  async addInternalNote(bookingId: string, content: string, adminId: string): Promise<void> {
    await this.bookingRepo.addNote(bookingId, content, adminId);
  }

  async detectConflicts(bookingId: string): Promise<any> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    const itemsToCheck = booking.items.map((i: any) => ({ resourceId: i.resourceId || i.itemId, quantity: i.quantity }));
    return await this.availabilityService.checkAvailability(
      itemsToCheck,
      booking.startDate,
      booking.endDate,
      bookingId
    );
  }
}

