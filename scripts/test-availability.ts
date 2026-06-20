import { db } from "../src/lib/db";
import { PrismaBookingRepository } from "../src/lib/booking-core/infrastructure/database/PrismaBookingRepository";
import { AvailabilityService } from "../src/lib/booking-core/application/services/AvailabilityService";
import type { BookingModuleConfig } from "../src/lib/booking-core/domain/config";

const config: BookingModuleConfig = {
  blockingStatuses: ["approved"],
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

async function runTests() {
  const repo = new PrismaBookingRepository();
  const availabilityService = new AvailabilityService(repo, config);

  console.log("Setting up test data...");
  await db.booking.deleteMany({
    where: { referenceCode: { startsWith: "TEST-AVAILABILITY-" } }
  });
  await db.item.deleteMany({
    where: { id: { in: ["test-huepfburg", "test-zuckerwatte", "test-popcorn"] } }
  });
  await db.category.deleteMany({ where: { id: "test-cat" } });
  await db.catalogType.deleteMany({ where: { id: "test-catalog-type" } });

  const catalogType = await db.catalogType.create({
    data: {
      id: "test-catalog-type",
      name: "Test Catalog Type",
      slug: "test-catalog-type"
    }
  });

  const category = await db.category.create({
    data: {
      id: "test-cat",
      name: "Test Cat",
      slug: "test-cat",
      catalogTypeId: catalogType.id
    }
  });

  // Create test items
  const huepfburg = await db.item.create({
    data: {
      id: "test-huepfburg",
      title: "Test Hüpfburg Dschungel",
      totalStock: 3,
      trackInventory: true,
      availabilityMode: "STOCK_AND_RESOURCE", // Auf- & Abbau notwendig
      deliveryAvailable: true,
      resourceId: "betreiber-lieferteam",
      resourceUnits: 10,
      resourceAppliesTo: "DELIVERY_ONLY",
      resourceBlockTime: "START_AND_END_DAYS",
      priceType: "FIXED",
      basePriceCents: 10000,
      slug: "test-huepfburg",
      published: true,
      categoryId: category.id
    }
  });

  const zuckerwatte = await db.item.create({
    data: {
      id: "test-zuckerwatte",
      title: "Test Zuckerwattemaschine",
      totalStock: 1,
      trackInventory: true,
      availabilityMode: "STOCK_ONLY", // Abholung
      pickupAvailable: true,
      priceType: "FIXED",
      basePriceCents: 5000,
      slug: "test-zuckerwatte",
      published: true,
      categoryId: category.id
    }
  });

  const popcorn = await db.item.create({
    data: {
      id: "test-popcorn",
      title: "Test Popcornmaschine",
      totalStock: 1,
      trackInventory: true,
      availabilityMode: "STOCK_ONLY",
      deliveryAvailable: true, // Lieferung ohne Aufbau
      priceType: "FIXED",
      basePriceCents: 5000,
      slug: "test-popcorn",
      published: true,
      categoryId: category.id
    }
  });

  // Helper to create booking
  async function createBooking(itemId: string, qty: number, startStr: string, endStr: string, status: string, deliveryType: string) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    return await db.booking.create({
      data: {
        referenceCode: `TEST-AVAILABILITY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        status,
        startDate: start,
        endDate: end,
        deliveryType,
        totalPriceCents: 10000,
        customer: {
          create: {
            email: "test@example.com",
            firstName: "Test",
            lastName: "Kunde"
          }
        },
        items: {
          create: [{
            itemId: itemId,
            quantity: qty,
            pricingMode: "auto"
          }]
        }
      }
    });
  }

  // Base dates for tests (Use dates in the future to avoid timezone weirdness)
  const friday = "2026-10-02T10:00:00Z";
  const saturday = "2026-10-03T10:00:00Z";
  const sunday = "2026-10-04T10:00:00Z";

  try {
    // ---------------------------------------------------------
    console.log("\n--- Test 1: Mehrere gleiche Aufbau-Produkte in EINER Anfrage ---");
    // Hüpfburg Dschungel Bestand 3. Kunde fragt 2x Hüpfburg für Samstag an.
    let result = await availabilityService.checkAvailability(
      [{ resourceId: huepfburg.id, quantity: 2 }],
      new Date(saturday), new Date(saturday), undefined, "delivery"
    );
    console.log("Test 1 Erfolgreich?", result.isAvailable === true ? "JA" : "NEIN", result.conflicts);

    // ---------------------------------------------------------
    console.log("\n--- Test 2: Aufbau-Produkt approved blockiert danach global ---");
    const b2 = await createBooking(huepfburg.id, 1, saturday, saturday, "approved", "delivery");
    result = await availabilityService.checkAvailability(
      [{ resourceId: zuckerwatte.id, quantity: 1 }],
      new Date(saturday), new Date(saturday), undefined, "pickup"
    );
    console.log("Test 2 Erfolgreich (Zuckerwatte geblockt)?", result.isAvailable === false && result.conflicts[0]?.reason === "GLOBAL_SETUP_BLOCK" ? "JA" : "NEIN");
    await db.booking.delete({ where: { id: b2.id } }); // Cleanup

    // ---------------------------------------------------------
    console.log("\n--- Test 3: Mehrtages-Aufbau-Produkt blockiert nur Start- und Endtag global ---");
    const b3 = await createBooking(huepfburg.id, 1, friday, sunday, "approved", "delivery");
    // Freitag -> blocked
    result = await availabilityService.checkAvailability(
      [{ resourceId: zuckerwatte.id, quantity: 1 }],
      new Date(friday), new Date(friday), undefined, "pickup"
    );
    console.log("Test 3.1 Freitag blockiert?", result.isAvailable === false ? "JA" : "NEIN");
    // Samstag -> NOT blocked
    result = await availabilityService.checkAvailability(
      [{ resourceId: zuckerwatte.id, quantity: 1 }],
      new Date(saturday), new Date(saturday), undefined, "pickup"
    );
    console.log("Test 3.2 Samstag frei?", result.isAvailable === true ? "JA" : "NEIN");
    // Sonntag -> blocked
    result = await availabilityService.checkAvailability(
      [{ resourceId: zuckerwatte.id, quantity: 1 }],
      new Date(sunday), new Date(sunday), undefined, "pickup"
    );
    console.log("Test 3.3 Sonntag blockiert?", result.isAvailable === false ? "JA" : "NEIN");
    await db.booking.delete({ where: { id: b3.id } }); // Cleanup

    // ---------------------------------------------------------
    console.log("\n--- Test 4: Abholprodukt blockiert nur sich selbst ---");
    const b4 = await createBooking(zuckerwatte.id, 1, saturday, saturday, "approved", "pickup");
    result = await availabilityService.checkAvailability(
      [{ resourceId: zuckerwatte.id, quantity: 1 }],
      new Date(saturday), new Date(saturday), undefined, "pickup"
    );
    console.log("Test 4.1 Zuckerwatte (Bestand leer) geblockt?", result.isAvailable === false && result.conflicts[0]?.reason === "oversold" ? "JA" : "NEIN");
    result = await availabilityService.checkAvailability(
      [{ resourceId: huepfburg.id, quantity: 1 }],
      new Date(saturday), new Date(saturday), undefined, "delivery"
    );
    console.log("Test 4.2 Hüpfburg weiterhin frei?", result.isAvailable === true ? "JA" : "NEIN");
    await db.booking.delete({ where: { id: b4.id } }); // Cleanup

    // ---------------------------------------------------------
    console.log("\n--- Test 5: Lieferung ohne Aufbau blockiert nur sich selbst ---");
    const b5 = await createBooking(popcorn.id, 1, saturday, saturday, "approved", "delivery");
    result = await availabilityService.checkAvailability(
      [{ resourceId: popcorn.id, quantity: 1 }],
      new Date(saturday), new Date(saturday), undefined, "delivery"
    );
    console.log("Test 5.1 Popcorn (Bestand leer) geblockt?", result.isAvailable === false && result.conflicts[0]?.reason === "oversold" ? "JA" : "NEIN");
    result = await availabilityService.checkAvailability(
      [{ resourceId: huepfburg.id, quantity: 1 }],
      new Date(saturday), new Date(saturday), undefined, "delivery"
    );
    console.log("Test 5.2 Hüpfburg weiterhin frei?", result.isAvailable === true ? "JA" : "NEIN");
    await db.booking.delete({ where: { id: b5.id } }); // Cleanup

    // ---------------------------------------------------------
    console.log("\n--- Test 6: Reihenfolge Abholung zuerst, Aufbau danach ---");
    const b6 = await createBooking(zuckerwatte.id, 1, saturday, saturday, "approved", "pickup");
    // Hüpfburg anfragen -> frei
    result = await availabilityService.checkAvailability(
      [{ resourceId: huepfburg.id, quantity: 1 }],
      new Date(saturday), new Date(saturday), undefined, "delivery"
    );
    console.log("Test 6.1 Hüpfburg frei?", result.isAvailable === true ? "JA" : "NEIN");
    const b6_2 = await createBooking(huepfburg.id, 1, saturday, saturday, "approved", "delivery");
    // Popcorn anfragen -> blockiert durch Hüpfburg!
    result = await availabilityService.checkAvailability(
      [{ resourceId: popcorn.id, quantity: 1 }],
      new Date(saturday), new Date(saturday), undefined, "delivery"
    );
    console.log("Test 6.2 Nach Hüpfburg: Andere blockiert?", result.isAvailable === false && result.conflicts[0]?.reason === "GLOBAL_SETUP_BLOCK" ? "JA" : "NEIN");
    await db.booking.deleteMany({ where: { id: { in: [b6.id, b6_2.id] } } });

    // ---------------------------------------------------------
    console.log("\n--- Test 7: requested blockiert nichts ---");
    const b7 = await createBooking(huepfburg.id, 1, saturday, saturday, "requested", "delivery");
    result = await availabilityService.checkAvailability(
      [{ resourceId: popcorn.id, quantity: 1 }],
      new Date(saturday), new Date(saturday), undefined, "delivery"
    );
    console.log("Test 7 Erfolgreich (Requested blockiert nicht)?", result.isAvailable === true ? "JA" : "NEIN");
    await db.booking.delete({ where: { id: b7.id } });

    // ---------------------------------------------------------
    console.log("\n--- Test 8: cancelled/rejected blockieren nicht ---");
    const b8 = await createBooking(huepfburg.id, 1, saturday, saturday, "cancelled", "delivery");
    result = await availabilityService.checkAvailability(
      [{ resourceId: popcorn.id, quantity: 1 }],
      new Date(saturday), new Date(saturday), undefined, "delivery"
    );
    console.log("Test 8 Erfolgreich (Cancelled blockiert nicht)?", result.isAvailable === true ? "JA" : "NEIN");
    await db.booking.delete({ where: { id: b8.id } });

  } catch (e) {
    console.error("Test failed:", e);
  } finally {
    console.log("\nCleaning up test data...");
    await db.booking.deleteMany({
      where: { referenceCode: { startsWith: "TEST-AVAILABILITY-" } }
    });
    await db.item.deleteMany({
      where: { id: { in: ["test-huepfburg", "test-zuckerwatte", "test-popcorn"] } }
    });
    await db.category.deleteMany({ where: { id: "test-cat" } });
    await db.catalogType.deleteMany({ where: { id: "test-catalog-type" } });
    console.log("Done.");
  }
}

runTests();
