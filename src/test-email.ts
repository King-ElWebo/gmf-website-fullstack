import "dotenv/config";
import { sendNewBookingEmails } from "./lib/email/email-service";
import type { BookingEmailContext } from "./lib/email/types";

// Force EMAIL_ADMIN to be the verified developer email for testing sandbox constraints
process.env.EMAIL_ADMIN = "wilkbenjamin757@gmail.com";

async function main() {
  const ctx: BookingEmailContext = {
    bookingId: "test-booking-id",
    referenceCode: "REQ-TEST-123",
    customerFirstName: "Max",
    customerLastName: "Mustermann",
    customerEmail: "wilkbenjamin757@gmail.com",
    customerPhone: "123456",
    startDate: "2026-07-15",
    endDate: "2026-07-16",
    deliveryType: "pickup",
    itemCount: 1,
    itemNames: ["Hüpfburg Schloss"],
    items: [
      {
        title: "Hüpfburg Schloss",
        quantity: 1,
        priceType: "FIXED",
        displayPrice: "129 €",
        calculatedTotalPriceCents: 12900,
      }
    ],
    customerAddress: {
      addressLine1: "Teststrasse 1",
      zip: "1234",
      city: "Testcity",
    },
    billingAddressSameAsDelivery: true,
    customerMessage: "Test Nachricht",
    totalPriceCents: 12900,
    hasIndividualPricing: false,
  };

  console.log("Testing email sending with verified sandbox email...");
  try {
    await sendNewBookingEmails(ctx);
    console.log("Done calling sendNewBookingEmails. Check logs above.");
  } catch (err) {
    console.error("Caught error in test script:", err);
  }
}

main().catch(console.error);
