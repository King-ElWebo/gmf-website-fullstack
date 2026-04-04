import { BookingRepository } from '../ports';
import { AvailabilityService } from '../services/AvailabilityService';

export class AdminBookingCommands {
  constructor(
    private bookingRepo: BookingRepository,
    private availabilityService: AvailabilityService
  ) {}

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
  }

  async rejectBooking(bookingId: string, reasonDetails: string, adminId: string): Promise<void> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    await this.bookingRepo.updateStatus(bookingId, 'rejected');
    await this.bookingRepo.addNote(bookingId, `Rejected: ${reasonDetails}`, adminId);
  }

  async cancelBooking(bookingId: string, reasonDetails: string, adminId: string): Promise<void> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    await this.bookingRepo.updateStatus(bookingId, 'cancelled');
    await this.bookingRepo.addNote(bookingId, `Cancelled: ${reasonDetails}`, adminId);
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
