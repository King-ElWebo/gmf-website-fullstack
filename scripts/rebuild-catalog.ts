import { db } from '../src/lib/db';

async function main() {
    console.log("Starting Catalog Rebuild...");

    // 1. Ensure the default resource exists
    let betreiberTeam = await db.resource.findUnique({ where: { slug: "betreiber-lieferteam" } });
    if (!betreiberTeam) {
        betreiberTeam = await db.resource.create({
            data: {
                name: "Betreiber / Lieferteam",
                slug: "betreiber-lieferteam",
                capacityPerDay: 10,
                isActive: true
            }
        });
        console.log("Created resource: Betreiber / Lieferteam");
    }

    // 2. Archive/Delete old items
    const allItems = await db.item.findMany({
        include: { bookingItems: true }
    });

    for (const item of allItems) {
        if (item.bookingItems.length > 0) {
            // Archive
            await db.item.update({
                where: { id: item.id },
                data: {
                    published: false,
                    categoryId: item.categoryId, // Keep it linked to avoid errors, or map to a generic "Archiv" category?
                }
            });
            console.log(`Archived item (has bookings): ${item.title}`);
        } else {
            // Delete
            await db.item.delete({ where: { id: item.id } });
            console.log(`Deleted item (no bookings): ${item.title}`);
        }
    }

    // 3. Setup CatalogTypes
    const catalogTypes = [
        { name: "Eventmodule", slug: "eventmodule", description: "Hüpfburgen, Partygeräte und Ausstattung für Kinderfeste, Vereinsfeiern und private Veranstaltungen." },
        { name: "Licht & Tontechnik", slug: "licht-tontechnik", description: "Professionelle Ton- und Lichttechnik für größere Feiern, Hallen, Vereinsveranstaltungen und Events." }
    ];

    for (const ct of catalogTypes) {
        await db.catalogType.upsert({
            where: { slug: ct.slug },
            update: { name: ct.name, description: ct.description, isActive: true },
            create: { name: ct.name, slug: ct.slug, description: ct.description, isActive: true, isDefault: ct.slug === "eventmodule" }
        });
    }

    const eventModuleType = await db.catalogType.findUnique({ where: { slug: "eventmodule" } });
    const lichtTonType = await db.catalogType.findUnique({ where: { slug: "licht-tontechnik" } });

    // 4. Setup Categories
    const eventCategories = [
        { name: "Hüpfburgen & Rutschen", slug: "huepfburgen-rutschen", description: "Große Eventmodule mit Lieferung, Aufbau und Abbau durch GMF." },
        { name: "Funfood & Partygeräte", slug: "funfood-partygeraete", description: "Popcorn, Zuckerwatte und süße Highlights für Feiern und Veranstaltungen." },
        { name: "Partylicht & kleine Effekte", slug: "partylicht-effekte", description: "Einfache Licht- und Effektsets für private Feiern und kleinere Veranstaltungen." },
        { name: "Party- & Eventausstattung", slug: "party-eventausstattung", description: "Ergänzende Ausstattung für Feiern, Vereine und Veranstaltungen." }
    ];

    const lichtTonCategories = [
        { name: "Tontechnik", slug: "tontechnik", description: "Lautsprechersysteme, Mikrofone und Beschallung für Feiern, Hallen und Veranstaltungen." },
        { name: "Lichttechnik", slug: "lichttechnik", description: "Lichttechnik für Bühnen, Hallen, Partys und professionelle Veranstaltungen." },
        { name: "Komplettsets", slug: "komplettsets", description: "Abgestimmte Ton- und Lichtpakete für größere Feiern, Vereinsveranstaltungen und Events." },
        { name: "Zubehör", slug: "zubehoer-technik", description: "Zubehör und Erweiterungen für Ton- und Lichttechnik." }
    ];

    const categoryMap: Record<string, string> = {};

    for (const cat of eventCategories) {
        const created = await db.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, description: cat.description, catalogTypeId: eventModuleType!.id },
            create: { name: cat.name, slug: cat.slug, description: cat.description, catalogTypeId: eventModuleType!.id }
        });
        categoryMap[cat.slug] = created.id;
    }

    for (const cat of lichtTonCategories) {
        const created = await db.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, description: cat.description, catalogTypeId: lichtTonType!.id },
            create: { name: cat.name, slug: cat.slug, description: cat.description, catalogTypeId: lichtTonType!.id }
        });
        categoryMap[cat.slug] = created.id;
    }

    // Move archived items to a safe category if their old category was deleted, but let's just create an "Archiv" category
    let archivCat = await db.category.findUnique({ where: { slug: "archiv-legacy" } });
    if (!archivCat) {
        archivCat = await db.category.create({
            data: {
                name: "Archiv (Alt)",
                slug: "archiv-legacy",
                catalogTypeId: eventModuleType!.id
            }
        });
    }

    for (const item of allItems) {
        if (item.bookingItems.length > 0) {
            await db.item.update({
                where: { id: item.id },
                data: { categoryId: archivCat.id }
            });
        }
    }

    // Delete old categories that aren't in the new list and aren't Archiv
    const validSlugs = [...eventCategories.map(c => c.slug), ...lichtTonCategories.map(c => c.slug), "archiv-legacy"];
    const allCats = await db.category.findMany();
    for (const c of allCats) {
        if (!validSlugs.includes(c.slug)) {
            await db.category.delete({ where: { id: c.id } }).catch(() => console.log("Could not delete category: " + c.name));
        }
    }

    // 5. Products Configuration Helper
    async function upsertItem(
        title: string, catSlug: string, desc: string,
        pickupAvailable: boolean, deliveryAvailable: boolean, setupRequired: boolean
    ) {
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const mode = setupRequired ? "STOCK_AND_RESOURCE" : "STOCK_ONLY";
        const resId = setupRequired ? betreiberTeam!.id : null;
        const resUnits = setupRequired ? 10 : 0;
        const resAppliesTo = setupRequired ? "DELIVERY_ONLY" : "BOTH";
        const resBlockTime = setupRequired ? "START_AND_END_DAYS" : "ENTIRE_DURATION";

        await db.item.upsert({
            where: { slug },
            update: {
                categoryId: categoryMap[catSlug],
                shortDescription: desc,
                published: true,
                pickupAvailable,
                deliveryAvailable,
                availabilityMode: mode,
                resourceId: resId,
                resourceUnits: resUnits,
                resourceAppliesTo: resAppliesTo,
                resourceBlockTime: resBlockTime
            },
            create: {
                title,
                slug,
                categoryId: categoryMap[catSlug],
                shortDescription: desc,
                priceType: "ON_REQUEST",
                published: true,
                pickupAvailable,
                deliveryAvailable,
                availabilityMode: mode,
                resourceId: resId,
                resourceUnits: resUnits,
                resourceAppliesTo: resAppliesTo,
                resourceBlockTime: resBlockTime
            }
        });
        console.log(`Created/Updated Item: ${title}`);
    }

    // --- Hüpfburgen & Rutschen (Aufbau: Ja, Lieferung: Ja, Abholung: Nein) ---
    const hpDesc = "Große Hüpfburg für Kinderfeste, Vereinsfeiern und Veranstaltungen. Lieferung, Aufbau und Abbau erfolgen durch GMF Eventmodule.";
    await upsertItem("Hüpfburg Schloss", "huepfburgen-rutschen", hpDesc, false, true, true);
    await upsertItem("Hüpfburg Minion", "huepfburgen-rutschen", hpDesc, false, true, true);
    await upsertItem("Hüpfburg Dschungel", "huepfburgen-rutschen", hpDesc, false, true, true);
    await upsertItem("Dinopark Rutschen-Hüpfburg", "huepfburgen-rutschen", hpDesc, false, true, true);
    await upsertItem("Rutsche Pirateninsel", "huepfburgen-rutschen", hpDesc, false, true, true);

    // --- Funfood & Partygeräte (Aufbau: Nein, Lieferung: Ja, Abholung: Ja) ---
    const funDesc = "Praktisches Partygerät für Feiern, Kinderfeste und Vereinsveranstaltungen. Abholung oder Lieferung nach Absprache möglich.";
    await upsertItem("Popcornmaschine", "funfood-partygeraete", funDesc, true, true, false);
    await upsertItem("Zuckerwattemaschine", "funfood-partygeraete", funDesc, true, true, false);
    await upsertItem("Candybar Set Classic", "funfood-partygeraete", funDesc, true, true, false);

    // --- Partylicht & kleine Effekte (Aufbau: Nein, Lieferung: Ja, Abholung: Ja) ---
    const lightDesc = "Kompaktes Effekt-Set für Partys und kleinere Veranstaltungen. Ideal für stimmungsvolle Beleuchtung ohne großen Aufbau.";
    await upsertItem("Party Licht Set", "partylicht-effekte", lightDesc, true, true, false);
    await upsertItem("DJ Lichtpaket", "partylicht-effekte", lightDesc, true, true, false);
    await upsertItem("Nebelmaschine", "partylicht-effekte", lightDesc, true, true, false);

    // --- Party- & Eventausstattung (Aufbau: Nein, Lieferung: Ja, Abholung: Ja) ---
    const ausDesc = "Ergänzende Ausstattung für Feiern, Vereine und Veranstaltungen.";
    await upsertItem("Biertischgarnitur Set", "party-eventausstattung", ausDesc, true, true, false);
    await upsertItem("Stehtisch Set", "party-eventausstattung", ausDesc, true, true, false);
    await upsertItem("Pavillon / Faltzelt", "party-eventausstattung", ausDesc, true, true, false);
    await upsertItem("Verlängerungskabel & Verteiler Set", "party-eventausstattung", ausDesc, true, true, false);

    // --- Tontechnik ---
    const tonDesc = "Tontechnik für Feiern, Hallen und Veranstaltungen.";
    await upsertItem("Lautsprecher Set Basic", "tontechnik", tonDesc, true, true, false);
    await upsertItem("Großes Lautsprechersystem", "tontechnik", tonDesc, false, true, true);
    await upsertItem("Subwoofer Set", "tontechnik", tonDesc, true, true, false);
    await upsertItem("Mikrofon Set", "tontechnik", tonDesc, true, true, false);
    await upsertItem("Funkmikrofon Set", "tontechnik", tonDesc, true, true, false);

    // --- Lichttechnik ---
    const buehnenDesc = "Lichttechnik für Bühnen, Hallen, Partys und professionelle Veranstaltungen.";
    await upsertItem("LED Scheinwerfer Set", "lichttechnik", buehnenDesc, true, true, false);
    await upsertItem("Moving Head Set", "lichttechnik", buehnenDesc, true, true, false);
    await upsertItem("Hallen-Lichtpaket", "lichttechnik", buehnenDesc, false, true, true);
    await upsertItem("Bühnenlicht Set", "lichttechnik", buehnenDesc, false, true, true);

    // --- Komplettsets ---
    const compDesc = "Komplettset für Veranstaltungen mit Lieferung und Aufbau durch GMF. Geeignet für größere Feiern, Vereinsfeste und Events.";
    await upsertItem("Ton & Licht Set für Feiern", "komplettsets", compDesc, false, true, true);
    await upsertItem("Technikpaket für Hallen", "komplettsets", compDesc, false, true, true);
    await upsertItem("DJ-/Event-Komplettset", "komplettsets", compDesc, false, true, true);

    // --- Zubehör ---
    const zubDesc = "Zubehör und Erweiterungen für Ton- und Lichttechnik.";
    await upsertItem("Stativ Set", "zubehoer-technik", zubDesc, true, true, false);
    await upsertItem("Kabel Set", "zubehoer-technik", zubDesc, true, true, false);
    await upsertItem("Adapter & Verteiler Set", "zubehoer-technik", zubDesc, true, true, false);
    await upsertItem("Mischpult klein", "zubehoer-technik", zubDesc, true, true, false);

    console.log("Migration finished.");
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(() => {
    db.$disconnect();
});
