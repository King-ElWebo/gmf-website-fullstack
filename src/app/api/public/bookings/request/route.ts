import { NextResponse } from 'next/server';
import { createPublicBookingUseCases } from '@/lib/booking-core/server';
import { getItemPriceDisplay } from '@/lib/items/price';
import { db } from '@/lib/db';
import { calculateInquiryCartItemPrice, getBookingDurationDays } from '@/lib/inquiry-cart/pricing';
import { parseInquiryBookingRequestPayload } from '@/lib/inquiry-cart/request-payload';

const publicUseCases = createPublicBookingUseCases();

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = parseInquiryBookingRequestPayload(rawBody);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const duration = getBookingDurationDays(parsed.value.startDate, parsed.value.endDate);
    if (duration.days == null) {
      return NextResponse.json({ error: 'Ungültiger Zeitraum. Das Enddatum darf nicht vor dem Startdatum liegen.' }, { status: 400 });
    }

    const resourceIds = parsed.value.items.map((item) => item.resourceId);
    const uniqueResourceIds = new Set(resourceIds);
    if (uniqueResourceIds.size !== resourceIds.length) {
      return NextResponse.json({ error: 'Ein Produkt wurde mehrfach übermittelt. Bitte Anfragekorb prüfen und erneut senden.' }, { status: 400 });
    }

    const catalogItems = await db.item.findMany({
      where: {
        id: { in: [...uniqueResourceIds] },
        published: true,
      },
      select: {
        id: true,
        title: true,
        priceType: true,
        basePriceCents: true,
        priceCents: true,
        priceLabel: true,
      },
    });

    const catalogItemById = new Map(catalogItems.map((item) => [item.id, item]));
    const missingIds = [...uniqueResourceIds].filter((id) => !catalogItemById.has(id));
    if (missingIds.length > 0) {
      return NextResponse.json({ error: 'Ein oder mehrere Produkte sind nicht mehr verfügbar. Bitte Anfragekorb aktualisieren.' }, { status: 400 });
    }

    const booking = await publicUseCases.createBookingRequest({
      customer: parsed.value.customer,
      items: parsed.value.items.map((item) => {
        const catalogItem = catalogItemById.get(item.resourceId)!;
        const basePriceCents = catalogItem.basePriceCents ?? catalogItem.priceCents ?? null;
        const displayPrice = getItemPriceDisplay({
          priceType: catalogItem.priceType,
          basePriceCents,
          priceLabel: catalogItem.priceLabel,
        });
        const serverPricing = calculateInquiryCartItemPrice(
          {
            priceType: catalogItem.priceType,
            basePriceCents,
            quantity: item.quantity,
          },
          parsed.value.startDate,
          parsed.value.endDate
        );

        return {
          resourceId: item.resourceId,
          quantity: item.quantity,
          resourceTitle: catalogItem.title,
          priceType: catalogItem.priceType,
          basePriceCents,
          priceLabel: catalogItem.priceLabel,
          displayPrice,
          pricingMode: serverPricing.isAutoCalculated ? "auto" : "individual",
          pricingReason: serverPricing.reason,
          bookingDays: serverPricing.bookingDays,
          calculatedUnitPriceCents: serverPricing.calculatedUnitPriceCents,
          calculatedTotalPriceCents: serverPricing.calculatedTotalPriceCents,
        };
      }),
      startDate: new Date(`${parsed.value.startDate}T00:00:00.000Z`),
      endDate: new Date(`${parsed.value.endDate}T00:00:00.000Z`),
      deliveryType: parsed.value.deliveryType,
      customerMessage: parsed.value.customerMessage
    });

    return NextResponse.json({ success: true, bookingId: booking.id, status: booking.status });
  } catch (error: unknown) {
    console.error("[public bookings request] failed:", error);

    if (error instanceof Error) {
      const message = error.message;
      const isUserInputError =
        message.includes("Bitte mindestens ein Produkt auswählen") ||
        message.includes("Ungültiger Zeitraum") ||
        message.includes("Enddatum") ||
        message.includes("not available") ||
        message.includes("nicht verfügbar");

      if (isUserInputError) {
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Die Anfrage konnte aktuell nicht gespeichert werden. Bitte versuchen Sie es erneut." },
      { status: 500 }
    );
  }
}
