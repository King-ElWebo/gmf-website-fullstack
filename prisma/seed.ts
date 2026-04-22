import { db } from "../src/lib/db";

async function main() {
  console.log("Seeding database...");

  // 1. Site Settings
  await db.siteSettings.upsert({
    where: { key: "default" },
    update: {
      phone: "+49 123 4567890",
      email: "info@gmf-eventmodule.de",
      address: "Eventstraße 1, 12345 Partystadt",
      openingHours: "Mo-Fr 09:00 - 18:00 Uhr | Sa 10:00 - 14:00 Uhr",
      heroTitle: "Miete die besten Eventmodule",
      heroText: "Hüpfburgen, Partyzelte, Veranstaltungstechnik und mehr für dein unvergessliches Event.",
      noticeText: "Willkommen auf unserer neuen Website! Miete jetzt für dein nächstes Event.",
    },
    create: {
      key: "default",
      phone: "+49 123 4567890",
      email: "info@gmf-eventmodule.de",
      address: "Eventstraße 1, 12345 Partystadt",
      openingHours: "Mo-Fr 09:00 - 18:00 Uhr | Sa 10:00 - 14:00 Uhr",
      heroTitle: "Miete die besten Eventmodule",
      heroText: "Hüpfburgen, Partyzelte, Veranstaltungstechnik und mehr für dein unvergessliches Event.",
      noticeText: "Willkommen auf unserer neuen Website! Miete jetzt für dein nächstes Event.",
    },
  });

  // Social Link (if needed, otherwise skip to keep it simple, but let's add one)
  const settings = await db.siteSettings.findUnique({ where: { key: "default" } });
  if (settings) {
    // Just create social link without upsetting too much
    const existingFb = await db.siteSocialLink.findFirst({ where: { platform: "instagram" }});
    if (!existingFb) {
      await db.siteSocialLink.create({
        data: {
          settingsId: settings.id,
          platform: "instagram",
          label: "Instagram",
          url: "https://instagram.com",
          sortOrder: 1,
        }
      });
    }
  }

  // 2. CatalogType
  console.log("Seeding CatalogType...");
  const catalogType = await db.catalogType.upsert({
    where: { slug: "eventbedarf" },
    update: {
      name: "Eventbedarf & Module",
      description: "Alle unsere Mietartikel von Hüpfburgen bis zu Partyzelten.",
      isActive: true,
      sortOrder: 1,
    },
    create: {
      name: "Eventbedarf & Module",
      slug: "eventbedarf",
      description: "Alle unsere Mietartikel von Hüpfburgen bis zu Partyzelten.",
      isActive: true,
      sortOrder: 1,
    },
  });

  // 3. Categories
  console.log("Seeding Categories...");
  const categoriesData = [
    { name: "Hüpfburgen", slug: "huepfburgen" },
    { name: "Audio", slug: "audio" },
    { name: "Lichttechnik", slug: "lichttechnik" },
    { name: "Partyzelte", slug: "partyzelte" },
    { name: "Möbel", slug: "moebel" },
    { name: "Deko", slug: "deko" },
    { name: "Catering Zubehör", slug: "catering-zubehoer" },
    { name: "Transport / Anhänger", slug: "transport-anhaenger" },
  ];

  const categoryMap = new Map<string, string>();

  let catSortOrder = 1;
  for (const c of categoriesData) {
    const category = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, catalogTypeId: catalogType.id, sortOrder: catSortOrder },
      create: { ...c, catalogTypeId: catalogType.id, sortOrder: catSortOrder },
    });
    categoryMap.set(c.slug, category.id);
    catSortOrder++;
  }

  // 4. Items
  console.log("Seeding Items...");
  const itemsData = [
    // Hüpfburgen
    {
      title: "Hüpfburg Dschungel",
      slug: "huepfburg-dschungel",
      categorySlug: "huepfburgen",
      priceCents: 15000,
      basePriceCents: 15000,
      shortDescription: "Mit Rutsche und tollen Tiermotiven.",
      description: "Unsere Hüpfburg Dschungel ist ein absolutes Highlight. Inkl. kleiner Rutsche und Hindernissen. Ideal für Kindergeburtstage.",
      imageUrl: "https://images.unsplash.com/photo-1681282664539-78c6606a2333?w=800&q=80",
    },
    {
      title: "Hüpfburg Ritterburg",
      slug: "huepfburg-ritterburg",
      categorySlug: "huepfburgen",
      priceCents: 12000,
      basePriceCents: 12000,
      shortDescription: "Klassische Hüpfburg für kleine Ritter.",
      description: "Die klassische Ritterburg mit ausreichend Springfläche für bis zu 8 Kinder.",
      imageUrl: "https://images.unsplash.com/photo-1598967912204-7e71dbbc8cc4?w=800&q=80",
    },
    {
      title: "Riesen-Hüpfburg XXL",
      slug: "riesen-huepfburg-xxl",
      categorySlug: "huepfburgen",
      priceCents: 22000,
      basePriceCents: 22000,
      shortDescription: "Für große Events und viele Kinder.",
      description: "Eine XXL Hüpfburg, ideal für größere Stadtfeste oder Firmenfeiern.",
      imageUrl: "https://images.unsplash.com/photo-1549480608-f46fae85df64?w=800&q=80",
    },
    // Audio
    {
      title: "PA Anlage 1000W",
      slug: "pa-anlage-1000w",
      categorySlug: "audio",
      priceCents: 8500,
      basePriceCents: 8500,
      shortDescription: "Druckvoller Sound für Partys bis 100 Personen.",
      description: "Professionelle PA-Anlage inkl. 2 Tops, 1 Subwoofer, Stativen und Verkabelung.",
      imageUrl: "https://images.unsplash.com/photo-1520166012956-add9ba0ee37f?w=800&q=80", // speakers
    },
    {
      title: "Funkmikrofon Set",
      slug: "funkmikrofon-set",
      categorySlug: "audio",
      priceCents: 3500,
      basePriceCents: 3500,
      shortDescription: "Kabelloses Mikrofon mit Empfänger.",
      description: "Hohe Reichweite und kristallklarer Klang. Perfekt für Redner und DJs.",
      imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80", // microphone
    },
    // Lichttechnik
    {
      title: "LED Scheinwerfer Set (4 Stück)",
      slug: "led-scheinwerfer-set",
      categorySlug: "lichttechnik",
      priceCents: 4500,
      basePriceCents: 4500,
      shortDescription: "Ambientebeleuchtung in Wunschfarbe.",
      description: "4x LED Scheinwerfer zur Raumbeleuchtung oder als Party-Effektlicht (Sound2Light).",
      imageUrl: "https://images.unsplash.com/photo-1582260662235-cb0ae357ba23?w=800&q=80", // stage lights
    },
    {
      title: "Nebelmaschine 1500W",
      slug: "nebelmaschine-1500w",
      categorySlug: "lichttechnik",
      priceCents: 3000,
      basePriceCents: 3000,
      shortDescription: "Macht die Lichtstrahlen erst richtig sichtbar.",
      description: "Leistungsstarke Nebelmaschine inkl. 1 Liter Fluid für kleine bis mittlere Veranstaltungen.",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80", // fog
    },
    // Partyzelte
    {
      title: "Faltzelt 3x3m",
      slug: "faltzelt-3x3m",
      categorySlug: "partyzelte",
      priceCents: 4500,
      basePriceCents: 4500,
      shortDescription: "Schnell aufgebauter Regenschutz.",
      description: "Hochwertiges Profi-Faltzelt in schwarz. Innerhalb von 5 Minuten aufgestellt. Inklusive Gewichten.",
      imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80", // tent
    },
    {
      title: "Festzelt 5x10m",
      slug: "festzelt-5x10m",
      categorySlug: "partyzelte",
      priceCents: 25000,
      basePriceCents: 25000,
      shortDescription: "Viel Platz für Ihre Gäste (bis zu 80 Personen).",
      description: "Robustes Festzelt für die Gartenparty. Plane: PVC. Aufbauzeit zu zweit ca. 2 Stunden.",
      imageUrl: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=800&q=80", // big tent
    },
    // Möbel
    {
      title: "Stehtisch klappbar",
      slug: "stehtisch-klappbar",
      categorySlug: "moebel",
      priceCents: 850,
      basePriceCents: 850,
      shortDescription: "Standard Stehtisch (Durchmesser 80cm).",
      description: "Praktischer Klapp-Stehtisch, wetterfest. Optional können schwarze oder weiße Hussen dazu gemietet werden.",
      imageUrl: "https://images.unsplash.com/photo-1522771731478-4ea7cf1d1b32?w=800&q=80",
    },
    {
      title: "Biertischgarnitur",
      slug: "biertischgarnitur",
      categorySlug: "moebel",
      priceCents: 1500,
      basePriceCents: 1500,
      shortDescription: "1 Tisch, 2 Bänke (220x50cm).",
      description: "Die klassische Festzeltgarnitur in Brauerei-Qualität.",
      imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80", 
    },
    {
      title: "Palettenlounge Sessel",
      slug: "palettenlounge-sessel",
      categorySlug: "moebel",
      priceCents: 2500,
      basePriceCents: 2500,
      shortDescription: "Gemütliches Sitzen inkl. Polster.",
      description: "Stylischer Palettensessel inklusive dicker Polster in anthrazit.",
      imageUrl: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80",
    },
    // Deko
    {
      title: "Lichterkette 20m",
      slug: "lichterkette-20m",
      categorySlug: "deko",
      priceCents: 1500,
      basePriceCents: 1500,
      shortDescription: "Warmweiße LED Lichterkette.",
      description: "Dicke Glühbirnen-Optik für ein schönes gemütliches Ambiente. Wasserdicht (IP65).",
      imageUrl: "https://images.unsplash.com/photo-1510006277258-29367e9cd2ea?w=800&q=80",
    },
    {
      title: "Roter Teppich (5 Meter)",
      slug: "roter-teppich-5m",
      categorySlug: "deko",
      priceCents: 3500,
      basePriceCents: 3500,
      shortDescription: "Für den großen Auftritt.",
      description: "Lieferung inkl. doppelseitigem Klebeband. Eventuell kommen Reinigungskosten bei starker Verschmutzung hinzu.",
      imageUrl: "https://images.unsplash.com/photo-1587889502932-a5e2f3d6dbf0?w=800&q=80",
      cleaningFeeApplies: true,
      cleaningFeeLabel: "Reinigungsgebühr",
      cleaningFeeInfo: "Pauschal 15€ bei starken Flecken.",
    },
    // Catering Zubehör
    {
      title: "Slush-Eis Maschine",
      slug: "slush-eis-maschine",
      categorySlug: "catering-zubehoer",
      priceCents: 8500,
      basePriceCents: 8500,
      shortDescription: "2x 10 Liter Kammern.",
      description: "Der Hit im Sommer! Sirup und Becher können im Shop zugebucht werden.",
      imageUrl: "https://images.unsplash.com/photo-1557142046-c704a3adf364?w=800&q=80",
      cleaningFeeApplies: true,
      cleaningFeeInfo: "Bitte nach der Benutzung mit klarem Wasser durchspülen.",
    },
    {
      title: "Popcornmaschine XXL",
      slug: "popcornmaschine-xxl",
      categorySlug: "catering-zubehoer",
      priceCents: 6500,
      basePriceCents: 6500,
      shortDescription: "Kino-Popcorn für Ihr Event.",
      description: "Im wunderschönen Wagen. Inklusive Zutaten-Set für ca. 50 Portionen.",
      imageUrl: "https://images.unsplash.com/photo-1572177439055-6b4d3fbdcd64?w=800&q=80",
    },
    {
      title: "Chafing Dish Set",
      slug: "chafing-dish-set",
      categorySlug: "catering-zubehoer",
      priceCents: 1200,
      basePriceCents: 1200,
      shortDescription: "Warmhaltebehälter für Speisen.",
      description: "Inklusive 2 Brennpasten. Hält ihr Buffet über Stunden warm.",
      imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80", // food
    },
    {
      title: "Gläser Set (50 Stück)",
      slug: "glaeser-set-50",
      categorySlug: "catering-zubehoer",
      priceCents: 2500,
      basePriceCents: 2500,
      shortDescription: "Miet-Gläser (Wasser/Longdrink).",
      description: "Rückgabe erfolgt ungespült. Wir übernehmen den Abwasch!",
      imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80", // glasses
    },
    // Transport
    {
      title: "Kofferanhänger 2.500kg",
      slug: "kofferanhaenger-2500kg",
      categorySlug: "transport-anhaenger",
      priceCents: 4500,
      basePriceCents: 4500,
      shortDescription: "Großer, geschlossener Anhänger.",
      description: "Lademasse: L x B x H = 3m x 1.5m x 1.8m. Perfekt zum trockenen Transport von Eventmodulen.",
      imageUrl: "https://images.unsplash.com/photo-1621240361005-5db139b7a3cc?w=800&q=80", // trailer/truck
      pickupAvailable: true,
      deliveryAvailable: false,
    },
    {
      title: "Rollbrett Mover",
      slug: "rollbrett-mover",
      categorySlug: "transport-anhaenger",
      priceCents: 500,
      basePriceCents: 500,
      shortDescription: "Zum einfachen Transport.",
      description: "Extrem starkes Rollbrett bis 500kg.",
      imageUrl: "https://images.unsplash.com/photo-1463171515643-952cee54d42a?w=800&q=80", // wheels
    }
  ];

  let itemSortOrder = 1;
  for (const item of itemsData) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) {
      console.warn(`Category ${item.categorySlug} not found. Skipping ${item.title}`);
      continue;
    }

    const { categorySlug, imageUrl, cleaningFeeApplies, cleaningFeeLabel, cleaningFeeInfo, pickupAvailable, deliveryAvailable, ...itemRest } = item;

    // Use specific values or reliable defaults
    const dbItem = await db.item.upsert({
      where: { slug: item.slug },
      update: {
        ...itemRest,
        categoryId,
        published: true,
        priceType: "FIXED",
        sortOrder: itemSortOrder,
        cleaningFeeApplies: cleaningFeeApplies ?? false,
        cleaningFeeLabel: cleaningFeeLabel ?? null,
        cleaningFeeInfo: cleaningFeeInfo ?? null,
        pickupAvailable: pickupAvailable ?? true,
        deliveryAvailable: deliveryAvailable ?? true,
        trackInventory: true,
        totalStock: Math.floor(Math.random() * 5) + 1, // pseudo random stock 1-5
      },
      create: {
        ...itemRest,
        categoryId,
        published: true,
        priceType: "FIXED",
        sortOrder: itemSortOrder,
        cleaningFeeApplies: cleaningFeeApplies ?? false,
        cleaningFeeLabel: cleaningFeeLabel ?? null,
        cleaningFeeInfo: cleaningFeeInfo ?? null,
        pickupAvailable: pickupAvailable ?? true,
        deliveryAvailable: deliveryAvailable ?? true,
        trackInventory: true,
        totalStock: Math.floor(Math.random() * 5) + 1, // pseudo random stock 1-5
      },
    });

    // Check if the item already has this image
    const existingImage = await db.itemImage.findFirst({
      where: { itemId: dbItem.id, url: imageUrl }
    });

    if (!existingImage && imageUrl) {
      // Create new image
      await db.itemImage.create({
        data: {
          url: imageUrl,
          alt: item.title,
          sortOrder: 1,
          itemId: dbItem.id,
          key: `seed-${item.slug}-1`,
        }
      });
    }

    itemSortOrder++;
  }

  console.log("Database seeded successfully!");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
