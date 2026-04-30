import { NextResponse } from "next/server";
import { renderEmailTemplate } from "@/lib/email/templates";
import type { BookingEmailContext, EmailType } from "@/lib/email/types";

/**
 * DEV-ONLY: Preview rendered HTML email templates in the browser.
 *
 * Usage:
 *   /api/admin/emails/preview?type=booking_confirmation
 *   /api/admin/emails/preview?type=booking_new_admin
 *   /api/admin/emails/preview?type=booking_approved
 *   /api/admin/emails/preview?type=booking_rejected
 *   /api/admin/emails/preview?type=booking_cancelled
 *   /api/admin/emails/preview?type=booking_status_changed
 */
export async function GET(req: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const url = new URL(req.url);
  const type = (url.searchParams.get("type") || "booking_confirmation") as EmailType;

  // Sample context with all fields populated for preview
  const sampleCtx: BookingEmailContext = {
    referenceCode: "REQ-847291",
    customerFirstName: "Maria",
    customerLastName: "Mustermann",
    customerEmail: "maria@example.com",
    customerPhone: "+49 171 1234567",
    startDate: "2026-05-15",
    endDate: "2026-05-17",
    deliveryType: "delivery",
    itemCount: 3,
    itemNames: ["Hüpfburg Deluxe", "Popcornmaschine", "LED-Lichterketten Set"],
    items: [
      {
        title: "Hüpfburg Deluxe",
        quantity: 1,
        priceType: "FIXED",
        displayPrice: "250,00 €",
        calculatedTotalPriceCents: 50000,
      },
      {
        title: "Popcornmaschine",
        quantity: 1,
        priceType: "FIXED",
        displayPrice: "85,00 €",
        calculatedTotalPriceCents: 17000,
      },
      {
        title: "LED-Lichterketten Set",
        quantity: 2,
        priceType: "ON_REQUEST",
        displayPrice: null,
        calculatedTotalPriceCents: null,
      },
    ],
    customerAddress: {
      addressLine1: "Musterstraße 42",
      zip: "80331",
      city: "München",
    },
    billingAddressSameAsDelivery: false,
    billingAddress: {
      nameOrCompany: "Mustermann GmbH",
      addressLine1: "Firmenweg 7",
      zip: "80333",
      city: "München",
      country: "Deutschland",
    },
    customerMessage: "Bitte die Hüpfburg am Freitag bis 14 Uhr liefern. Aufstellort ist der Garten hinter dem Haus, Zufahrt über die Seitenstraße.",
    reason: "Leider ist die Hüpfburg für den gewünschten Zeitraum bereits reserviert.",
    newStatus: type === "booking_approved" ? "approved"
      : type === "booking_rejected" ? "rejected"
      : type === "booking_cancelled" ? "cancelled"
      : type === "booking_status_changed" ? "approved"
      : undefined,
  };

  const rendered = renderEmailTemplate(type, sampleCtx);

  // Return raw HTML so the browser renders it
  return new Response(rendered.html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
