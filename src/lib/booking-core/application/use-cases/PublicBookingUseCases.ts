import { BookingRepository } from '../ports';
import { AvailabilityService } from '../services/AvailabilityService';
import { Booking, BookingCustomer, BookingItem } from '../../domain/models';

export interface CreateBookingRequestDTO {
  customer: BookingCustomer;
  items: { resourceId: string; quantity: number }[];
  startDate: Date;
  endDate: Date;
  deliveryType: string;
  customerMessage?: string;
}

export class PublicBookingUseCases {
  constructor(
    private bookingRepo: BookingRepository,
    private availabilityService: AvailabilityService
  ) {}

  async createBookingRequest(dto: CreateBookingRequestDTO): Promise<Booking> {
    // 1. Availability check before creating!
    const avResult = await this.availabilityService.checkAvailability(
      dto.items,
      dto.startDate,
      dto.endDate
    );

    if (!avResult.isAvailable) {
      throw new Error('Some requested items are not available for the selected dates.');
    }

    // 2. Erzeuge Referenz Code (vereinfacht)
    const referenceCode = `REQ-${Date.now().toString().slice(-6)}`;

    // 3. Mapping von DTO zu Domain Model
    const newBooking: Booking = {
      id: '', // DB generates
      referenceCode,
      status: 'requested',
      customer: dto.customer,
      items: dto.items.map(i => ({
        id: '',
        bookingId: '',
        resourceId: i.resourceId,
        quantity: i.quantity
      })),
      startDate: dto.startDate,
      endDate: dto.endDate,
      deliveryType: dto.deliveryType as any,
      customerMessage: dto.customerMessage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 4. Save
    const saved = await this.bookingRepo.save(newBooking);

    // 5. TODO: Domain Event feuern -> sendet Mail an Kunde "Eingegangen" & an Admin "Neue Anfrage"

    return saved;
  }
}
