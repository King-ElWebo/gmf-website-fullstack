import "dotenv/config";
import { db } from "../src/lib/db";
import { ItemPriceType } from "@prisma/client";

async function main() {
  console.log("Starting comprehensive database seed...");

  // 1. Site Settings
  console.log("Seeding Site Settings...");
  const settings = await db.siteSettings.upsert({
    where: { key: "default" },
    update: {
      phone: "+43 123 456789", // Realistic placeholder
      email: "office@gmf-eventmodule.at",
      address: "3702 Stranzendorf",
      openingHours: "Nach telefonischer Vereinbarung",
      heroTitle: "Unvergessliche Momente erleben",
      heroText: "Unvergessliche Momente mit Eventmodulen wie Hüpfburgen, Rutschen, Licht- und Tontechnik. Für Ihre Feier einfach anfragen, sicher verwenden und jede Menge Spaß erleben.",
      noticeText: "48h vorher kostenlos stornieren | Schlechtwetter-Option nach Absprache",
      additionalInfo: "Betreiber ist Vermieter, keine Versicherung über Anbieter. Stornobedingungen: 48h vorher kostenlos, 24h vorher 25%, Vor-Ort-Storno 50% plus Zeit- und Anfahrtskosten.",
    },
    create: {
      key: "default",
      phone: "+43 123 456789",
      email: "office@gmf-eventmodule.at",
      address: "3702 Stranzendorf",
      openingHours: "Nach telefonischer Vereinbarung",
      heroTitle: "Unvergessliche Momente erleben",
      heroText: "Unvergessliche Momente mit Eventmodulen wie Hüpfburgen, Rutschen, Licht- und Tontechnik. Für Ihre Feier einfach anfragen, sicher verwenden und jede Menge Spaß erleben.",
      noticeText: "48h vorher kostenlos stornieren | Schlechtwetter-Option nach Absprache",
      additionalInfo: "Betreiber ist Vermieter, keine Versicherung über Anbieter. Stornobedingungen: 48h vorher kostenlos, 24h vorher 25%, Vor-Ort-Storno 50% plus Zeit- und Anfahrtskosten.",
    },
  });

  // Social Links
  await db.siteSocialLink.upsert({
    where: { id: "social-fb" },
    update: {
      settingsId: settings.id,
      platform: "facebook",
      label: "Facebook",
      url: "https://facebook.com/gmf-eventmodule",
      isActive: true,
    },
    create: {
      id: "social-fb",
      settingsId: settings.id,
      platform: "facebook",
      label: "Facebook",
      url: "https://facebook.com/gmf-eventmodule",
      isActive: true,
    },
  });

  await db.siteSocialLink.upsert({
    where: { id: "social-insta" },
    update: {
      settingsId: settings.id,
      platform: "instagram",
      label: "Instagram",
      url: "https://instagram.com/gmf-eventmodule",
      isActive: true,
    },
    create: {
      id: "social-insta",
      settingsId: settings.id,
      platform: "instagram",
      label: "Instagram",
      url: "https://instagram.com/gmf-eventmodule",
      isActive: true,
    },
  });

  // 2. CatalogTypes
  console.log("Seeding CatalogTypes...");
  const eventmoduleType = await db.catalogType.upsert({
    where: { slug: "eventmodule" },
    update: {
      name: "Eventmodule",
      navLabel: "Eventmodule",
      description: "Alles für den ultimativen Spaß: Hüpfburgen, Rutschen, Candybars und Kinderspiele für Ihr nächstes Event.",
      isActive: true,
      sortOrder: 1,
      showInNav: true,
      isDefault: true,
    },
    create: {
      name: "Eventmodule",
      slug: "eventmodule",
      navLabel: "Eventmodule",
      description: "Alles für den ultimativen Spaß: Hüpfburgen, Rutschen, Candybars und Kinderspiele für Ihr nächstes Event.",
      isActive: true,
      sortOrder: 1,
      showInNav: true,
      isDefault: true,
    },
  });

  const lichtTonType = await db.catalogType.upsert({
    where: { slug: "licht-tontechnik" },
    update: {
      name: "Licht & Tontechnik",
      navLabel: "Licht & Tontechnik",
      description: "Professionelle Audio-, Licht- und Beschallungstechnik für Feiern, Hochzeiten und Firmen-Events.",
      isActive: true,
      sortOrder: 2,
      showInNav: true,
      isDefault: false,
    },
    create: {
      name: "Licht & Tontechnik",
      slug: "licht-tontechnik",
      navLabel: "Licht & Tontechnik",
      description: "Professionelle Audio-, Licht- und Beschallungstechnik für Feiern, Hochzeiten und Firmen-Events.",
      isActive: true,
      sortOrder: 2,
      showInNav: true,
      isDefault: false,
    },
  });

  // 3. Categories
  console.log("Seeding Categories...");
  const categories = [
    // Eventmodule Categories
    { name: "Hüpfburgen", slug: "huepfburgen", catalogTypeId: eventmoduleType.id, sortOrder: 1, description: "Action und Spaß für die Kleinen." },
    { name: "Rutschen", slug: "rutschen", catalogTypeId: eventmoduleType.id, sortOrder: 2, description: "Riesige Rutschen für leuchtende Kinderaugen." },
    { name: "Candybar", slug: "candybar", catalogTypeId: eventmoduleType.id, sortOrder: 3, description: "Süße Highlights für jede Feier." },
    { name: "Kinderspiele", slug: "kinderspiele", catalogTypeId: eventmoduleType.id, sortOrder: 4, description: "Kreative Spielepakete für Kinder." },
    { name: "Partyspiele", slug: "partyspiele", catalogTypeId: eventmoduleType.id, sortOrder: 5, description: "Spaß für Jung und Alt." },
    { name: "Eventmodule", slug: "eventmodule-misc", catalogTypeId: eventmoduleType.id, sortOrder: 6, description: "Weitere spannende Module für Ihr Event." },
    
    // Licht & Tontechnik Categories
    { name: "Tontechnik", slug: "tontechnik", catalogTypeId: lichtTonType.id, sortOrder: 1, description: "Kristallklarer Sound für Ihre Gäste." },
    { name: "Lichttechnik", slug: "lichttechnik", catalogTypeId: lichtTonType.id, sortOrder: 2, description: "Stimmungsvolle Beleuchtung für jedes Ambiente." },
    { name: "Komplettsets", slug: "komplettsets", catalogTypeId: lichtTonType.id, sortOrder: 3, description: "Sorglos-Pakete für Ihre Party." },
    { name: "Lautsprecher", slug: "lautsprecher", catalogTypeId: lichtTonType.id, sortOrder: 4, description: "Einzelne Lautsprecher und Subwoofer." },
    { name: "Partybeleuchtung", slug: "partybeleuchtung", catalogTypeId: lichtTonType.id, sortOrder: 5, description: "Effekte, die jede Tanzfläche beleben." },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await db.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        catalogTypeId: cat.catalogTypeId,
        sortOrder: cat.sortOrder,
        description: cat.description,
      },
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }

  // 4. Items (Products)
  console.log("Seeding Items...");
  
  const items = [
    // Hüpfburgen
    {
      title: "Hüpfburg Dschungel",
      slug: "huepfburg-dschungel",
      categorySlug: "huepfburgen",
      priceType: ItemPriceType.FIXED,
      basePriceCents: 14900,
      priceLabel: "ab 149 €",
      shortDescription: "Abenteuer pur im Dschungel-Design.",
      longDescription: "Unsere Hüpfburg Dschungel bietet jede Menge Platz zum Springen und Entdecken. Mit integrierten Hindernissen und einer kleinen Rutsche ist sie der Hit auf jedem Kindergeburtstag. Maße: 5m x 4m. Geeignet für bis zu 8 Kinder gleichzeitig.",
      depositRequired: true,
      depositLabel: "Kaution",
      depositInfo: "100 € Kaution bei Abholung fällig.",
      cleaningFeeApplies: true,
      cleaningFeeLabel: "Reinigungskosten",
      cleaningFeeInfo: "Reinigungspauschale 120 €, falls Reinigung notwendig.",
      dryingFeeApplies: true,
      dryingFeeLabel: "Trocknungskosten",
      dryingFeeInfo: "Trocknungspauschale 190 €, nur bei Nässe.",
      setupRequirements: "Ebener Untergrund, Stromanschluss 230V erforderlich. Platzbedarf mind. 6m x 5m.",
      accessRequirements: "Türbreite mindestens 1 m, gute Zufahrt empfohlen, möglichst keine Stufen.",
      deliveryAvailable: true,
      pickupAvailable: true,
      deliveryInfo: "Lieferung abhängig von Entfernung. Selbstabholung und Rückgabe nach Vereinbarung möglich.",
      imageUrl: "https://images.unsplash.com/photo-1598967912204-7e71dbbc8cc4?q=80&w=800",
    },
    {
      title: "Hüpfburg Schloss",
      slug: "huepfburg-schloss",
      categorySlug: "huepfburgen",
      priceType: ItemPriceType.FIXED,
      basePriceCents: 12900,
      priceLabel: "ab 129 €",
      shortDescription: "Der Klassiker für kleine Prinzessinnen und Prinzen.",
      longDescription: "Ein wunderschönes Hüpfburg-Schloss in leuchtenden Farben. Ideal für Gartenpartys und Vereinsfeste. Maße: 4m x 4m. Inklusive Gebläse und Unterlegplane.",
      depositRequired: true,
      depositLabel: "Kaution",
      depositInfo: "80 € Kaution bei Abholung fällig.",
      cleaningFeeApplies: true,
      cleaningFeeInfo: "Reinigungspauschale 120 €, falls Reinigung notwendig.",
      dryingFeeApplies: true,
      dryingFeeInfo: "Trocknungspauschale 190 €, nur bei Nässe.",
      setupRequirements: "Ebener Untergrund, Stromanschluss 230V. Gebläse muss trocken und staubfrei stehen.",
      accessRequirements: "Türbreite mind. 1m erforderlich.",
      deliveryAvailable: true,
      pickupAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1549480608-f46fae85df64?q=80&w=800",
    },
    // Rutschen
    {
      title: "Rutsche Pirateninsel",
      slug: "rutsche-pirateninsel",
      categorySlug: "rutschen",
      priceType: ItemPriceType.FROM_PRICE,
      basePriceCents: 24900,
      priceLabel: "ab 249 €",
      shortDescription: "Riesiger Rutschspaß auf der Pirateninsel.",
      longDescription: "Diese gigantische Rutsche ist der Blickfang auf Ihrem Event. Mit einer Höhe von fast 6 Metern bietet sie Nervenkitzel und Spaß für Kinder ab 4 Jahren.",
      depositRequired: true,
      depositInfo: "150 € Kaution erforderlich.",
      cleaningFeeApplies: true,
      cleaningFeeInfo: "Reinigungspauschale 120 €, falls Reinigung notwendig.",
      dryingFeeApplies: true,
      dryingFeeInfo: "Trocknungspauschale 190 €, nur bei Nässe.",
      requiresDeliveryAddress: true,
      deliveryInfo: "Lieferadresse erforderlich. Aufgrund der Größe wird eine Lieferung durch uns empfohlen.",
      setupRequirements: "Stabile, ebene Fläche. Platzbedarf mind. 10m x 6m. 2x 230V Anschlüsse.",
      imageUrl: "https://images.unsplash.com/photo-1596435327244-1506505779c1?q=80&w=800",
    },
    // Candybar
    {
      title: "Candybar Set Classic",
      slug: "candybar-set-classic",
      categorySlug: "candybar",
      priceType: ItemPriceType.FIXED,
      basePriceCents: 8900,
      priceLabel: "89 €",
      shortDescription: "Stilvolle Candybar für Hochzeiten und Geburtstage.",
      longDescription: "Unser Set Classic beinhaltet den dekorativen Leiterwagen, diverse Glasgefäße in verschiedenen Größen, Zangen und Schaufeln. (Ohne Süßigkeiten - diese können optional dazu gebucht werden).",
      depositRequired: true,
      depositInfo: "50 € Kaution für Glasgefäße.",
      pickupAvailable: true,
      deliveryAvailable: true,
      usageInfo: "Gläser müssen in sauberem Zustand zurückgegeben werden.",
      imageUrl: "https://images.unsplash.com/photo-1557142046-c704a3adf364?q=80&w=800",
    },
    // Kinderspiele
    {
      title: "Kinderspiel Paket Mini",
      slug: "kinderspiel-paket-mini",
      categorySlug: "kinderspiele",
      priceType: ItemPriceType.FIXED,
      basePriceCents: 4500,
      priceLabel: "45 €",
      shortDescription: "Spiele-Klassiker für den Garten.",
      longDescription: "Enthält Sackhüpfen-Set, Eierlaufen, Dosenwerfen und Tauziehen. Kompakt verpackt in einer praktischen Transportbox.",
      depositRequired: false,
      pickupAvailable: true,
      deliveryAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800",
    },
    // Eventmodule
    {
      title: "Eventmodule Paket Familie",
      slug: "eventmodule-paket-familie",
      categorySlug: "eventmodule-misc",
      priceType: ItemPriceType.FROM_PRICE,
      basePriceCents: 39900,
      priceLabel: "ab 399 €",
      shortDescription: "Rundum-Sorglos-Paket für Ihr Familienfest.",
      longDescription: "Beinhaltet eine Hüpfburg nach Wahl (Standard), das Kinderspiel Paket Mini und eine Popcornmaschine inkl. Zutaten für 50 Portionen.",
      depositRequired: true,
      depositInfo: "200 € Kaution für das gesamte Paket.",
      cleaningFeeApplies: true,
      cleaningFeeInfo: "Reinigungspauschale 120 €, falls Reinigung notwendig (hauptsächlich Hüpfburg).",
      deliveryInfo: "Kostenlose Lieferung im Umkreis von 20km ab Stranzendorf.",
      imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800",
    },

    // Tontechnik
    {
      title: "Lautsprecher Set Basic",
      slug: "lautsprecher-set-basic",
      categorySlug: "lautsprecher",
      priceType: ItemPriceType.ON_REQUEST,
      priceLabel: "Preis auf Anfrage",
      shortDescription: "Kraftvoller Sound für bis zu 80 Personen.",
      longDescription: "Bestehend aus 2x Aktiv-Lautsprechern inkl. Stativen und allen notwendigen Anschlusskabeln (XLR/Klinke). Einfache Bedienung, auch für Laien geeignet.",
      depositRequired: true,
      depositInfo: "Kaution 150 €.",
      pickupAvailable: true,
      deliveryAvailable: true,
      usageInfo: "Technik muss staubfrei und trocken aufgestellt werden.",
      imageUrl: "https://images.unsplash.com/photo-1520166012956-add9ba0ee37f?q=80&w=800",
    },
    // Lichttechnik
    {
      title: "Lichttechnik Ambiente Set",
      slug: "lichttechnik-ambiente-set",
      categorySlug: "lichttechnik",
      priceType: ItemPriceType.FROM_PRICE,
      basePriceCents: 7500,
      priceLabel: "ab 75 €",
      shortDescription: "Indirekte Beleuchtung für eine besondere Atmosphäre.",
      longDescription: "Set bestehend aus 6x Akku-LED-Spots. Kabellos, steuerbar per Fernbedienung oder App. Jede Farbe einstellbar. Akkulaufzeit bis zu 12 Stunden.",
      depositRequired: true,
      depositInfo: "Kaution 100 €.",
      pickupAvailable: true,
      deliveryAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800",
    },
    // Komplettsets
    {
      title: "Tontechnik Komplettset",
      slug: "tontechnik-komplettset",
      categorySlug: "komplettsets",
      priceType: ItemPriceType.ON_REQUEST,
      priceLabel: "Preis auf Anfrage",
      shortDescription: "Alles was Sie für eine gelungene Beschallung brauchen.",
      longDescription: "Enthält Lautsprecher, Subwoofer, Mischpult und Funkmikrofon. Ideal für Hochzeiten und Firmenevents bis 150 Personen.",
      depositRequired: true,
      depositInfo: "Kaution nach Vereinbarung.",
      deliveryInfo: "Lieferung und Aufbau durch unser Fachpersonal empfohlen.",
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800",
    },
    {
      title: "Party Licht Set",
      slug: "party-licht-set",
      categorySlug: "partybeleuchtung",
      priceType: ItemPriceType.FIXED,
      basePriceCents: 9500,
      priceLabel: "95 €",
      shortDescription: "Die Tanzfläche zum Beben bringen.",
      longDescription: "Kombination aus Lichtstativ mit 4x LED-Spots, einem Derby-Effekt und einer kleinen Nebelmaschine inkl. Fluid.",
      depositRequired: true,
      depositInfo: "Kaution 100 €.",
      pickupAvailable: true,
      usageInfo: "Nebelmaschine nur in gut belüfteten Räumen verwenden.",
      imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800",
    },
    {
      title: "Mikrofon Set",
      slug: "mikrofon-set",
      categorySlug: "tontechnik",
      priceType: ItemPriceType.FIXED,
      basePriceCents: 3500,
      priceLabel: "35 €",
      shortDescription: "Hochwertiges Funkmikrofon für Reden.",
      longDescription: "Set bestehend aus 1x Funkmikrofon (Handheld) und Empfänger. Reichweite bis zu 50m.",
      depositRequired: false,
      pickupAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800",
    },
    {
      title: "DJ Lichtpaket",
      slug: "dj-lichtpaket",
      categorySlug: "partybeleuchtung",
      priceType: ItemPriceType.ON_REQUEST,
      priceLabel: "Preis auf Anfrage",
      shortDescription: "Professionelles Licht-Setup für DJs.",
      longDescription: "Inklusive Moving Heads, Lasereffekten und DMX-Steuerung für eine synchrone Lichtshow.",
      depositRequired: true,
      deliveryAvailable: true,
      pickupAvailable: false,
      deliveryInfo: "Nur mit Lieferung und Aufbau durch uns.",
      imageUrl: "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=800",
    },
  ];

  let itemSortOrder = 1;
  for (const item of items) {
    const categoryId = categoryMap[item.categorySlug];
    if (!categoryId) {
      console.warn(`Category ${item.categorySlug} not found for item ${item.title}`);
      continue;
    }

    const { categorySlug, imageUrl, ...itemData } = item;
    
    const createdItem = await db.item.upsert({
      where: { slug: item.slug },
      update: {
        ...itemData,
        categoryId,
        published: true,
        sortOrder: itemSortOrder++,
      },
      create: {
        ...itemData,
        categoryId,
        published: true,
        sortOrder: itemSortOrder++,
      },
    });

    if (imageUrl) {
      await db.itemImage.upsert({
        where: { id: `img-${item.slug}` },
        update: {
          url: imageUrl,
          alt: item.title,
          itemId: createdItem.id,
          sortOrder: 1,
        },
        create: {
          id: `img-${item.slug}`,
          url: imageUrl,
          alt: item.title,
          itemId: createdItem.id,
          sortOrder: 1,
          key: `seed-${item.slug}`,
        },
      });
    }
  }

  // 5. FAQs
  console.log("Seeding FAQs...");
  const faqs = [
    {
      question: "Wie funktioniert die Anfrage?",
      answer: "Sie können alle gewünschten Artikel in den Warenkorb legen und eine unverbindliche Anfrage senden. Wir prüfen die Verfügbarkeit zum Wunschtermin und senden Ihnen ein Angebot.",
      sortOrder: 1,
    },
    {
      question: "Kann ich mehrere Produkte gleichzeitig anfragen?",
      answer: "Ja, Sie können beliebig viele Produkte sammeln und gemeinsam in einer Anfrage absenden.",
      sortOrder: 2,
    },
    {
      question: "Wie funktioniert Lieferung und Abholung?",
      answer: "Viele Produkte können Sie direkt bei uns in 3702 Stranzendorf abholen. Größere Eventmodule liefern wir auch gerne gegen Aufpreis und bauen diese auf Wunsch auf.",
      sortOrder: 3,
    },
    {
      question: "Wann fallen Reinigungskosten an?",
      answer: "Reinigungskosten fallen nur an, wenn die Artikel stark verschmutzt zurückgegeben werden. Bei normaler Nutzung ist die Endreinigung oft inklusive oder entfällt.",
      sortOrder: 4,
    },
    {
      question: "Was passiert bei Schlechtwetter?",
      answer: "Bei Regen oder Sturm können Hüpfburgen aus Sicherheitsgründen nicht betrieben werden. Wir bieten in solchen Fällen oft kulante Stornierungs- oder Umbuchungsmöglichkeiten nach Absprache.",
      sortOrder: 5,
    },
    {
      question: "Wie funktionieren Stornierungen?",
      answer: "Stornierungen sind bis 48h vor Mietbeginn kostenlos möglich. Danach fallen gestaffelte Gebühren an (25% bis 24h vorher, danach 50% plus eventuelle Anfahrtskosten).",
      sortOrder: 6,
    },
    {
      question: "Gibt es eine Kaution?",
      answer: "Ja, für die meisten technischen Geräte und Eventmodule erheben wir eine Kaution, die bei ordnungsgemäßer Rückgabe sofort erstattet wird.",
      sortOrder: 7,
    },
    {
      question: "Kann ich Licht- und Tontechnik mieten?",
      answer: "Selbstverständlich! Wir bieten alles von kleinen Party-Lautsprechern bis hin zu kompletten Bühnen-Setups.",
      sortOrder: 8,
    },
    {
      question: "Wie lange kann ich Produkte mieten?",
      answer: "Die Standard-Mietdauer beträgt einen Tag (24h). Mehrtagesmieten sind nach Absprache zu vergünstigten Konditionen möglich.",
      sortOrder: 9,
    },
  ];

  for (const faq of faqs) {
    await db.faq.upsert({
      where: { id: `faq-${faq.sortOrder}` },
      update: {
        ...faq,
        published: true,
      },
      create: {
        id: `faq-${faq.sortOrder}`,
        ...faq,
        published: true,
      },
    });
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
