import { BookingRepository } from '../ports';
import { AvailabilityService } from '../services/AvailabilityService';
import { Booking, BookingAddress, BookingCustomer, DeliveryType } from '../../domain/models';
import type { InquiryCartPriceType } from '@/lib/inquiry-cart/pricing';
import { sendNewBookingEmails, type BookingEmailContext } from '@/lib/email';

export interface CreateBookingRequestDTO {
  customer: BookingCustomer;
  billingAddressSameAsDelivery?: boolean;
  billingAddress?: BookingAddress | null;
  totalPriceCents?: number | null;
  hasIndividualPricing?: boolean;
  items: {
    resourceId: string;
    quantity: number;
    resourceTitle?: string;
    priceType?: InquiryCartPriceType;
    basePriceCents?: number | null;
    priceLabel?: string | null;
    displayPrice?: string | null;
    pricingMode?: "auto" | "individual";
    pricingReason?: string | null;
    bookingDays?: number | null;
    calculatedUnitPriceCents?: number | null;
    calculatedTotalPriceCents?: number | null;
  }[];
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
    if (!dto.items.length) {
      throw new Error("Bitte mindestens ein Produkt auswählen.");
    }

    if (!(dto.startDate instanceof Date) || Number.isNaN(dto.startDate.getTime()) || !(dto.endDate instanceof Date) || Number.isNaN(dto.endDate.getTime())) {
      throw new Error("Ungültiger Zeitraum.");
    }

    if (dto.endDate < dto.startDate) {
      throw new Error("Das Enddatum darf nicht vor dem Startdatum liegen.");
    }

    // 1. Availability check before creating!
    const avResult = await this.availabilityService.checkAvailability(
      dto.items,
      dto.startDate,
      dto.endDate
    );

    if (!avResult.isAvailable) {
      const firstUnavailable = avResult.items.find((item) => !item.isAvailable);
      if (firstUnavailable && firstUnavailable.availableQuantity != null) {
        throw new Error(`Für mindestens ein Produkt ist die gewünschte Menge im Zeitraum nicht verfügbar. Verfügbar: ${firstUnavailable.availableQuantity}.`);
      }

      throw new Error('Ein oder mehrere Produkte sind für den ausgewählten Zeitraum nicht verfügbar.');
    }

    // 2. Erzeuge Referenz Code (vereinfacht)
    const referenceCode = `REQ-${Date.now().toString().slice(-6)}`;

    // 3. Mapping von DTO zu Domain Model
    const newBooking: Booking = {
      id: '', // DB generates
      referenceCode,
      status: 'requested',
      customer: dto.customer,
      totalPriceCents: dto.totalPriceCents ?? null,
      hasIndividualPricing: dto.hasIndividualPricing ?? false,
      items: dto.items.map(i => ({
        id: '',
        bookingId: '',
        resourceId: i.resourceId,
        quantity: i.quantity,
        resourceTitle: i.resourceTitle,
        priceType: i.priceType,
        basePriceCents: i.basePriceCents ?? null,
        priceLabel: i.priceLabel ?? null,
        displayPrice: i.displayPrice ?? null,
        pricingMode: i.pricingMode ?? "individual",
        pricingReason: i.pricingReason ?? null,
        bookingDays: i.bookingDays ?? null,
        calculatedUnitPriceCents: i.calculatedUnitPriceCents ?? null,
        calculatedTotalPriceCents: i.calculatedTotalPriceCents ?? null,
      })),
      startDate: dto.startDate,
      endDate: dto.endDate,
      deliveryType: dto.deliveryType as DeliveryType,
      billingAddressSameAsDelivery: dto.billingAddressSameAsDelivery ?? true,
      billingAddress: dto.billingAddress ?? null,
      customerMessage: dto.customerMessage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 4. Save
    const saved = await this.bookingRepo.save(newBooking);

    // 5. Fire-and-forget email notifications (never blocks the response)
    const emailCtx: BookingEmailContext = {
      referenceCode: saved.referenceCode,
      customerFirstName: dto.customer.firstName,
      customerLastName: dto.customer.lastName,
      customerEmail: dto.customer.email,
      customerPhone: dto.customer.phone,
      startDate: dto.startDate.toISOString().slice(0, 10),
      endDate: dto.endDate.toISOString().slice(0, 10),
      deliveryType: dto.deliveryType,
      itemCount: dto.items.length,
      itemNames: dto.items
        .map((i) => i.resourceTitle)
        .filter((n): n is string => !!n),
      items: dto.items.map((i) => ({
        title: i.resourceTitle || "Produkt",
        quantity: i.quantity,
        priceType: i.priceType,
        displayPrice: i.displayPrice,
        calculatedTotalPriceCents: i.calculatedTotalPriceCents,
      })),
      customerAddress: dto.customer.addressLine1
        ? {
            addressLine1: dto.customer.addressLine1,
            zip: dto.customer.zip,
            city: dto.customer.city,
          }
        : undefined,
      billingAddressSameAsDelivery: dto.billingAddressSameAsDelivery,
      billingAddress: dto.billingAddress
        ? {
            nameOrCompany: dto.billingAddress.nameOrCompany,
            addressLine1: dto.billingAddress.addressLine1,
            zip: dto.billingAddress.zip,
            city: dto.billingAddress.city,
            country: dto.billingAddress.country,
          }
        : undefined,
      customerMessage: dto.customerMessage,
      totalPriceCents: dto.totalPriceCents ?? null,
      hasIndividualPricing: dto.hasIndividualPricing ?? false,
    };

    // Don't await — email must never block the booking response
    sendNewBookingEmails(emailCtx).catch((err) => {
      console.error("[Booking] Email sending failed (non-blocking):", err);
    });

    return saved;
  }
}

