import "dotenv/config";
import { db } from "../src/lib/db";
import { ItemPriceType } from "@prisma/client";
import { COMPANY_CONFIG } from "../src/lib/company-config";

async function main() {
  console.log("Starting comprehensive database seed...");

  // 1. Site Settings
  console.log("Seeding Site Settings...");
  const settings = await db.siteSettings.upsert({
    where: { key: "default" },
    update: {
      phone: COMPANY_CONFIG.phone,
      email: COMPANY_CONFIG.emailPrimary,
      address: COMPANY_CONFIG.address,
      openingHours: "Nach telefonischer Vereinbarung",
      heroTitle: "Unvergessliche Momente erleben",
      heroText: "Unvergessliche Momente mit Eventmodulen wie Hüpfburgen, Rutschen, Licht- und Tontechnik. Für Ihre Feier einfach anfragen, sicher verwenden und jede Menge Spaß erleben.",
      noticeText: "Bis 2 Tage vorher kostenlos stornieren | Schlechtwetter-Option nach Absprache",
      additionalInfo: "Selbstabholung ist nach Vereinbarung an unserem Standort in Bisamberg möglich. Bitte beachten Sie, dass die gemieteten Produkte selbstständig und termingerecht retourniert werden müssen. Die Lieferung erfolgt je nach Entfernung – Liefer- und Anfahrtskosten werden individuell berechnet.",
    },
    create: {
      key: "default",
      phone: COMPANY_CONFIG.phone,
      email: COMPANY_CONFIG.emailPrimary,
      address: COMPANY_CONFIG.address,
      openingHours: "Nach telefonischer Vereinbarung",
      heroTitle: "Unvergessliche Momente erleben",
      heroText: "Unvergessliche Momente mit Eventmodulen wie Hüpfburgen, Rutschen, Licht- und Tontechnik. Für Ihre Feier einfach anfragen, sicher verwenden und jede Menge Spaß erleben.",
      noticeText: "Bis 2 Tage vorher kostenlos stornieren | Schlechtwetter-Option nach Absprache",
      additionalInfo: "Selbstabholung ist nach Vereinbarung an unserem Standort in Bisamberg möglich. Bitte beachten Sie, dass die gemieteten Produkte selbstständig und termingerecht retourniert werden müssen. Die Lieferung erfolgt je nach Entfernung – Liefer- und Anfahrtskosten werden individuell berechnet.",
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
    { name: "Hindernisbahn / Parcours", slug: "hindernisbahn-parcours", catalogTypeId: eventmoduleType.id, sortOrder: 3, description: "Actiongeladene Hindernisbahnen für sportliche Events." },
    { name: "Candybar", slug: "candybar", catalogTypeId: eventmoduleType.id, sortOrder: 4, description: "Süße Highlights für jede Feier." },
    { name: "Kinderspiele", slug: "kinderspiele", catalogTypeId: eventmoduleType.id, sortOrder: 5, description: "Kreative Spielepakete für Kinder." },
    { name: "Partyspiele", slug: "partyspiele", catalogTypeId: eventmoduleType.id, sortOrder: 6, description: "Spaß für Jung und Alt." },
    { name: "Eventmodule", slug: "eventmodule-misc", catalogTypeId: eventmoduleType.id, sortOrder: 7, description: "Weitere spannende Module für Ihr Event." },
    
    // Licht & Tontechnik Categories
    { name: "Tontechnik", slug: "tontechnik", catalogTypeId: lichtTonType.id, sortOrder: 1, description: "Kristallklarer Sound für Ihre Gäste." },
    { name: "Lichttechnik", slug: "lichttechnik", catalogTypeId: lichtTonType.id, sortOrder: 2, description: "Stimmungsvolle Beleuchtung für jedes Ambiente." },
    { name: "Ambientebeleuchtung", slug: "ambientebeleuchtung", catalogTypeId: lichtTonType.id, sortOrder: 3, description: "Indirekte Beleuchtung für eine besondere Atmosphäre." },
    { name: "Spezialbeleuchtung", slug: "spezialbeleuchtung", catalogTypeId: lichtTonType.id, sortOrder: 4, description: "Effektbeleuchtung und Grusel-Effekte für Ihr Event." },
    { name: "Komplettsets", slug: "komplettsets", catalogTypeId: lichtTonType.id, sortOrder: 5, description: "Sorglos-Pakete für Ihre Party." },
    { name: "Lautsprecher", slug: "lautsprecher", catalogTypeId: lichtTonType.id, sortOrder: 6, description: "Einzelne Lautsprecher und Subwoofer." },
    { name: "Partybeleuchtung", slug: "partybeleuchtung", catalogTypeId: lichtTonType.id, sortOrder: 7, description: "Effekte, die jede Tanzfläche beleben." },
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
      depositInfo: "100 € Kaution bei Übergabe fällig.",
      cleaningFeeApplies: true,
      cleaningFeeLabel: "Reinigungskosten",
      cleaningFeeInfo: "Reinigungspauschale 120 € exkl. MwSt. (144 € inkl. MwSt.) bei grober/mutwilliger Verschmutzung.",
      dryingFeeApplies: true,
      dryingFeeLabel: "Trocknungskosten",
      dryingFeeInfo: "Trocknungspauschale 165 € netto (198 € inkl. MwSt.) pro Hüpfburg bei Nässe/Regen.",
      setupRequirements: "Ebener Untergrund, Stromanschluss 230V erforderlich. Platzbedarf mind. 6m x 5m.",
      accessRequirements: "Türbreite mindestens 1 m, gute Zufahrt empfohlen, möglichst keine Stufen.",
      deliveryAvailable: true,
      pickupAvailable: false,
      deliveryInfo: "Lieferung abhängig von Entfernung. Selbstabholung und Rückgabe nach Vereinbarung möglich.",
      imageUrl: "/uploads/b2daf481-de54-45cd-889e-3ad322874728.jpg",
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
      depositInfo: "80 € Kaution bei Übergabe fällig.",
      cleaningFeeApplies: true,
      cleaningFeeInfo: "Reinigungspauschale 120 € exkl. MwSt. (144 € inkl. MwSt.) bei grober/mutwilliger Verschmutzung.",
      dryingFeeApplies: true,
      dryingFeeInfo: "Trocknungspauschale 165 € netto (198 € inkl. MwSt.) pro Hüpfburg bei Nässe/Regen.",
      setupRequirements: "Ebener Untergrund, Stromanschluss 230V. Gebläse muss trocken und staubfrei stehen.",
      accessRequirements: "Türbreite mind. 1m erforderlich.",
      deliveryAvailable: true,
      pickupAvailable: false,
      imageUrl: "/uploads/4a098394-c0d5-4ad3-b3a1-bbf82ed996d1.jpg",
    },
    {
      title: "Hüpfburg Minion",
      slug: "huepfburg-minion",
      categorySlug: "huepfburgen",
      priceType: ItemPriceType.ON_REQUEST,
      priceLabel: "Preis auf Anfrage",
      shortDescription: "Der absolute Hit für alle Minions-Fans.",
      longDescription: "Unsere bunte Hüpfburg im beliebten Minions-Design bietet riesigen Springspaß. Ideal für Kinderfeiern, Vereinsfeste und private Veranstaltungen. Details zu Platzbedarf, Lieferung und Aufbau werden im Zuge der Anfrage abgestimmt.",
      depositRequired: true,
      depositLabel: "Kaution",
      depositInfo: "Kaution abhängig vom Produkt und wird im Angebot bekanntgegeben.",
      cleaningFeeApplies: true,
      cleaningFeeInfo: "Reinigungspauschale 120 € exkl. MwSt. (144 € inkl. MwSt.) bei grober/mutwilliger Verschmutzung.",
      dryingFeeApplies: true,
      dryingFeeInfo: "Trocknungspauschale 165 € netto (198 € inkl. MwSt.) pro Hüpfburg bei Nässe/Regen.",
      deliveryAvailable: true,
      pickupAvailable: false,
      imageUrl: "/uploads/20180428_164118_resized.jpg",
    },
    {
      title: "Dinopark Rutschen-Hüpfburg",
      slug: "dinopark-rutschen-huepfburg",
      categorySlug: "huepfburgen",
      priceType: ItemPriceType.ON_REQUEST,
      priceLabel: "Preis auf Anfrage",
      shortDescription: "Dinosaurier-Abenteuer mit einer eingebauten Rutsche.",
      longDescription: "Ein tolles Abenteuer-Erlebnis mit Dinos und einer integrierten Rutsche. Ideal für Kinderfeiern, Vereinsfeste und private Veranstaltungen. Details zu Platzbedarf, Lieferung und Aufbau werden im Zuge der Anfrage abgestimmt. Bilder dienen der Orientierung.",
      depositRequired: true,
      depositLabel: "Kaution",
      depositInfo: "Kaution abhängig vom Produkt und wird im Angebot bekanntgegeben.",
      cleaningFeeApplies: true,
      cleaningFeeInfo: "Reinigungspauschale 120 € exkl. MwSt. (144 € inkl. MwSt.) bei grober/mutwilliger Verschmutzung.",
      dryingFeeApplies: true,
      dryingFeeInfo: "Trocknungspauschale 165 € netto (198 € inkl. MwSt.) pro Hüpfburg bei Nässe/Regen.",
      deliveryAvailable: true,
      pickupAvailable: false,
      imageUrl: "/uploads/Huepfburg-Dinopark-mit-Rutsche-kaufen1.webp",
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
      cleaningFeeInfo: "Reinigungspauschale 120 € exkl. MwSt. (144 € inkl. MwSt.) bei grober/mutwilliger Verschmutzung.",
      dryingFeeApplies: true,
      dryingFeeInfo: "Trocknungspauschale 165 € netto (198 € inkl. MwSt.) pro Hüpfburg bei Nässe/Regen.",
      requiresDeliveryAddress: true,
      deliveryAvailable: true,
      pickupAvailable: false,
      deliveryInfo: "Lieferadresse erforderlich. Aufgrund der Größe wird eine Lieferung durch uns empfohlen.",
      setupRequirements: "Stabile, ebene Fläche. Platzbedarf mind. 10m x 6m. 2x 230V Anschlüsse.",
      imageUrl: "/uploads/221936ab-29f9-4c70-b5bb-91c5036e9912.jpg",
    },
    // Hindernisbahn / Parcours
    {
      title: "Abenteuer Parcours",
      slug: "abenteuer-parcours",
      categorySlug: "hindernisbahn-parcours",
      priceType: ItemPriceType.ON_REQUEST,
      priceLabel: "Preis auf Anfrage",
      shortDescription: "Riesiger Hindernis-Parcours für sportliche Action.",
      longDescription: "Eine große Hindernisbahn mit verschiedenen Kletter-, Krabbel- und Rutschelementen. Ideal für Kinderfeiern, Vereinsfeste und private Veranstaltungen. Details zu Platzbedarf, Lieferung und Aufbau werden im Zuge der Anfrage abgestimmt.",
      depositRequired: true,
      depositLabel: "Kaution",
      depositInfo: "Kaution abhängig vom Produkt und wird im Angebot bekanntgegeben.",
      cleaningFeeApplies: true,
      cleaningFeeInfo: "Reinigungspauschale 120 € exkl. MwSt. (144 € inkl. MwSt.) bei grober/mutwilliger Verschmutzung.",
      dryingFeeApplies: true,
      dryingFeeInfo: "Trocknungspauschale 165 € netto (198 € inkl. MwSt.) pro Hüpfburg bei Nässe/Regen.",
      deliveryAvailable: true,
      pickupAvailable: false,
      images: [
        { url: "/uploads/20200501_161650_resized.jpg", alt: "Abenteuer Parcours Gesamtansicht" },
        { url: "/uploads/20200501_161701_resized.jpg", alt: "Abenteuer Parcours Kletterelement" },
        { url: "/uploads/20200501_161714_resized.jpg", alt: "Abenteuer Parcours Innenbereich" },
        { url: "/uploads/20200501_161727_resized.jpg", alt: "Abenteuer Parcours Hindernis" },
        { url: "/uploads/20200501_161733_resized.jpg", alt: "Abenteuer Parcours Draufsicht" },
        { url: "/uploads/20200501_162012_resized.jpg", alt: "Abenteuer Parcours Spieledetails" },
        { url: "/uploads/20200501_162019_resized.jpg", alt: "Abenteuer Parcours Seitenansicht" },
        { url: "/uploads/20200501_165813_resized.jpg", alt: "Abenteuer Parcours Aufbauphase" },
        { url: "/uploads/20200501_165822_resized.jpg", alt: "Abenteuer Parcours Detailaufbau" },
        { url: "/uploads/20200501_165825_resized.jpg", alt: "Abenteuer Parcours Rückseite" },
        { url: "/uploads/20200501_165829_resized.jpg", alt: "Abenteuer Parcours Luftansicht" }
      ]
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
      cleaningFeeInfo: "Reinigungspauschale 120 € exkl. MwSt. (144 € inkl. MwSt.) bei grober/mutwilliger Verschmutzung.",
      dryingFeeApplies: true,
      dryingFeeInfo: "Trocknungspauschale 165 € netto (198 € inkl. MwSt.) pro Hüpfburg bei Nässe/Regen.",
      deliveryAvailable: true,
      pickupAvailable: false,
      deliveryInfo: "Kostenlose Lieferung im Umkreis von 20km ab Bisamberg.",
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
      imageUrl: "/uploads/9736ca54-1e4d-4a72-8884-e4e3ca81dd19.jpg",
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
      deliveryAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800",
    },
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
      pickupAvailable: true,
      deliveryAvailable: true,
      deliveryInfo: "Lieferung und Aufbau durch unser Fachpersonal empfohlen.",
      images: [
        { url: "/uploads/20220820_201733_resized.jpg", alt: "Tontechnik Komplettset DJ-Setup" },
        { url: "/uploads/IMG-20221014-WA0001.jpg", alt: "Tontechnik Komplettset Detail" }
      ]
    },
    // Lichttechnik
    {
      title: "Lichttechnik Ambiente Set",
      slug: "lichttechnik-ambiente-set",
      categorySlug: "ambientebeleuchtung",
      priceType: ItemPriceType.FROM_PRICE,
      basePriceCents: 7500,
      priceLabel: "ab 75 €",
      shortDescription: "Indirekte Beleuchtung für eine besondere Atmosphäre.",
      longDescription: "Set bestehend aus 6x Akku-LED-Spots. Kabellos, steuerbar per Fernbedienung oder App. Jede Farbe einstellbar. Akkulaufzeit bis zu 12 Stunden.",
      depositRequired: true,
      depositInfo: "Kaution 100 €.",
      pickupAvailable: true,
      deliveryAvailable: true,
      images: [
        { url: "/uploads/20190919_132541_resized.jpg", alt: "Lichttechnik Ambiente Set Spots" },
        { url: "/uploads/20190919_204537_resized.jpg", alt: "Lichttechnik Ambiente Set Abendstimmung" }
      ]
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
      deliveryAvailable: true,
      usageInfo: "Nebelmaschine nur in gut belüfteten Räumen verwenden.",
      images: [
        { url: "/uploads/20180908_125443_resized.jpg", alt: "Party Licht Set Scheinwerfer" },
        { url: "/uploads/20180908_125503_resized.jpg", alt: "Party Licht Set Bar" },
        { url: "/uploads/20180908_125512_resized.jpg", alt: "Party Licht Set Stativ" }
      ]
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
      pickupAvailable: true,
      deliveryAvailable: true,
      deliveryInfo: "Nur mit Lieferung und Aufbau durch uns.",
      imageUrl: "/uploads/20190920_135139_resized.jpg",
    },
    // Spezialbeleuchtung
    {
      title: "Halloween Beleuchtung",
      slug: "halloween-beleuchtung",
      categorySlug: "spezialbeleuchtung",
      priceType: ItemPriceType.ON_REQUEST,
      priceLabel: "Preis auf Anfrage",
      shortDescription: "Gruselig-schöne Lichteffekte für Ihre Halloween-Party.",
      longDescription: "Set aus UV-Schwarzlicht, farbigen Scheinwerfern und Spezialeffekten für die perfekte schaurige Atmosphäre auf Ihrer Halloween-Veranstaltung.",
      depositRequired: true,
      depositLabel: "Kaution",
      depositInfo: "Kaution abhängig vom Produkt und wird im Angebot bekanntgegeben.",
      pickupAvailable: true,
      deliveryAvailable: true,
      images: [
        { url: "/uploads/20201031_185508_resized.jpg", alt: "Halloween Beleuchtung UV-Schwarzlicht" },
        { url: "/uploads/20201031_184617_resized.jpg", alt: "Halloween Beleuchtung UV-Effekte" },
        { url: "/uploads/20201031_185512_resized.jpg", alt: "Halloween Beleuchtung Atmosphäre" }
      ]
    },
  ];

  let itemSortOrder = 1;
  for (const item of items) {
    const categoryId = categoryMap[item.categorySlug];
    if (!categoryId) {
      console.warn(`Category ${item.categorySlug} not found for item ${item.title}`);
      continue;
    }

    const { categorySlug, imageUrl, images: itemImages, ...itemData } = item as any;
    
    const createdItem = await db.item.upsert({
      where: { slug: item.slug },
      update: {
        ...itemData,
        description: itemData.longDescription ?? itemData.description ?? null,
        categoryId,
        published: true,
        sortOrder: itemSortOrder++,
      },
      create: {
        ...itemData,
        description: itemData.longDescription ?? itemData.description ?? null,
        categoryId,
        published: true,
        sortOrder: itemSortOrder++,
      },
    });

    if (itemImages && Array.isArray(itemImages) && itemImages.length > 0) {
      // First clear old images to ensure no duplicates / ordering issues
      await db.itemImage.deleteMany({
        where: { itemId: createdItem.id }
      });

      for (let i = 0; i < itemImages.length; i++) {
        const img = itemImages[i];
        const imgId = `img-${item.slug}-${i}`;
        await db.itemImage.create({
          data: {
            id: imgId,
            url: img.url,
            alt: img.alt ?? item.title,
            itemId: createdItem.id,
            sortOrder: i,
            key: `seed-${item.slug}-${i}`,
          },
        });
      }
    } else if (imageUrl) {
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
      answer: "Viele Produkte können Sie direkt bei uns in A-2102 Bisamberg abholen. Größere Eventmodule liefern wir auch gerne gegen Aufpreis und bauen diese auf Wunsch auf.",
      sortOrder: 3,
    },
    {
      question: "Wann fallen Reinigungskosten an?",
      answer: "Eine Reinigungspauschale von 120 € exkl. MwSt. (144 € inkl. MwSt.) fällt nur bei grober, fahrlässiger oder mutwilliger Verschmutzung an. Bei normaler, pfleglicher Nutzung entstehen Ihnen keine zusätzlichen Reinigungskosten.",
      sortOrder: 4,
    },
    {
      question: "Was passiert bei Schlechtwetter?",
      answer: "Bei Regen oder Sturm dürfen Hüpfburgen aus Sicherheitsgründen nicht betrieben werden. Bei Rückgabe einer komplett nassen Hüpfburg durch Regen/Nässe müssen wir eine Trocknungspauschale von 165 € netto (198 € inkl. MwSt.) pro Hüpfburg verrechnen.",
      sortOrder: 5,
    },
    {
      question: "Wie funktionieren Stornierungen?",
      answer: "Stornierungen sind bis 2 Tage vor dem Veranstaltungstag kostenlos möglich. Bei einer späteren Stornierung verrechnen wir die tatsächlich angefallenen Kosten bis zu einem Maximum von 350 € netto.",
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
    {
      question: "Was muss ich für den Aufbau und Betrieb (Strom, Helfer) beachten?",
      answer: "Zubehör wie Fallschutzmatten, Gebläse, Erdnägel und Transportwagen sind in der Miete bereits inkludiert. Für den Auf- und Abbau der Module werden vor Ort 1–2 kräftige Helfer benötigt. Der Betrieb erfordert eine normale 230V Stromversorgung durch den Veranstalter (ca. 3 kW pro Hüpfburg/Gebläse).",
      sortOrder: 10,
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

  // 6. Global Images
  console.log("Seeding Global Images...");
  const globalImages = [
    {
      id: "gi-1",
      url: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=1200&q=80",
      key: "gi-1-key",
      alt: "Hero 1",
      area: "CAROUSEL",
      published: true,
    },
    {
      id: "gi-2",
      url: "https://images.unsplash.com/photo-1549480608-f46fae85df64?w=1200&q=80",
      key: "gi-2-key",
      alt: "Hero 2",
      area: "CAROUSEL",
      published: true,
    },
  ];

  for (const img of globalImages) {
    await db.globalImage.upsert({
      where: { id: img.id },
      update: {
        url: img.url,
        key: img.key,
        alt: img.alt,
        area: img.area,
        published: img.published,
      },
      create: img,
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
