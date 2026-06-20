import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const templatesData = [
    {
        internalName: "Hüpfburg & Rutsche",
        title: "Wichtige Infos & Inklusivleistungen",
        categories: ["Hüpfburgen/Rutschen", "Hüpfburgen & Rutschen"], // Checking both just in case
        blocks: [
            {
                highlightLabel: "OK",
                heading: "Zubehör inklusive",
                body: "Fallschutzmatten, Gebläse, Erdnägel, Transportwagen und weiteres notwendiges Zubehör sind inklusive.",
                sortOrder: 1,
            },
            {
                highlightLabel: "230V",
                heading: "Strombedarf",
                body: "Normale 230V Steckdose, ca. 3 kW Leistung pro Hüpfburg/Gebläse erforderlich.",
                sortOrder: 2,
            },
            {
                highlightLabel: "OK",
                heading: "Aufbau-Hilfe",
                body: "Seitens des Mieters werden 1–2 kräftige Helfer für den Auf- & Abbau benötigt.",
                sortOrder: 3,
            },
            {
                highlightLabel: "!",
                heading: "Sicherheit",
                body: "Ständige Betreuung durch einen Erwachsenen ist verpflichtend.",
                sortOrder: 4,
            },
        ],
    },
    {
        internalName: "Funfood & Partygeräte",
        title: "Wichtige Hinweise",
        categories: ["Funfood/Candybar", "Funfood & Partygeräte"],
        blocks: [
            {
                highlightLabel: "OK",
                heading: "Übergabe",
                body: "Abholung oder Lieferung nach Absprache möglich.",
                sortOrder: 1,
            },
            {
                highlightLabel: "230V",
                heading: "Stromanschluss",
                body: "Für den Betrieb wird in der Regel ein normaler 230V Anschluss benötigt.",
                sortOrder: 2,
            },
            {
                highlightLabel: "OK",
                heading: "Reinigung",
                body: "Bitte das Gerät sauber und im vereinbarten Zustand zurückgeben.",
                sortOrder: 3,
            },
            {
                highlightLabel: "!",
                heading: "Verbrauchsmaterial",
                body: "Verbrauchsmaterial und Zubehör werden je nach Anfrage individuell abgestimmt.",
                sortOrder: 4,
            },
        ],
    },
    {
        internalName: "Licht & Tontechnik",
        title: "Wichtige Hinweise zur Technikmiete",
        categories: ["Licht & Ton", "Licht & Tontechnik", "Licht", "Ton", "Technik"],
        blocks: [
            {
                highlightLabel: "OK",
                heading: "Einsatzplanung",
                body: "Für größere Veranstaltungen empfehlen wir eine kurze Abstimmung zum passenden Setup.",
                sortOrder: 1,
            },
            {
                highlightLabel: "OK",
                heading: "Lieferung & Aufbau",
                body: "Lieferung und Aufbau sind je nach Paket und Vereinbarung möglich.",
                sortOrder: 2,
            },
            {
                highlightLabel: "230V",
                heading: "Stromversorgung",
                body: "Stromversorgung und Einsatzbereich bitte vorab abstimmen.",
                sortOrder: 3,
            },
            {
                highlightLabel: "!",
                heading: "Technikhinweis",
                body: "Eine sorgfältige Nutzung und ein sicherer Aufbau vor Ort sind Voraussetzung.",
                sortOrder: 4,
            },
        ],
    },
    {
        internalName: "Zubehör & Abholung",
        title: "Hinweise zur Übergabe",
        categories: ["Zubehör", "Zubehör & Abholung", "Sonstiges"],
        blocks: [
            {
                highlightLabel: "OK",
                heading: "Abholung",
                body: "Abholung und Rückgabe erfolgen nach Vereinbarung.",
                sortOrder: 1,
            },
            {
                highlightLabel: "OK",
                heading: "Vollständigkeit",
                body: "Bitte Zubehör vollständig und im vereinbarten Zustand zurückgeben.",
                sortOrder: 2,
            },
            {
                highlightLabel: "OK",
                heading: "Lieferung",
                body: "Lieferung ist je nach Anfrage und Verfügbarkeit ebenfalls möglich.",
                sortOrder: 3,
            },
            {
                highlightLabel: "!",
                heading: "Rückgabe",
                body: "Fehlendes oder beschädigtes Zubehör muss bei der Rückgabe angegeben werden.",
                sortOrder: 4,
            },
        ],
    },
];

async function main() {
    console.log("Starting info templates migration...");

    for (const tData of templatesData) {
        let template = await prisma.infoTemplate.findFirst({
            where: { internalName: tData.internalName },
        });

        if (!template) {
            console.log(`Creating template: ${tData.internalName}`);
            template = await prisma.infoTemplate.create({
                data: {
                    internalName: tData.internalName,
                    title: tData.title,
                    blocks: {
                        create: tData.blocks,
                    },
                },
            });
        } else {
            console.log(`Template already exists: ${tData.internalName}, updating blocks...`);
            await prisma.infoTemplateBlock.deleteMany({
                where: { infoTemplateId: template.id },
            });
            await prisma.infoTemplate.update({
                where: { id: template.id },
                data: {
                    title: tData.title,
                    blocks: {
                        create: tData.blocks,
                    },
                },
            });
        }

        const categories = await prisma.category.findMany({
            where: {
                name: {
                    in: tData.categories,
                },
            },
            select: { id: true, name: true },
        });

        if (categories.length > 0) {
            const categoryIds = categories.map((c) => c.id);
            const updateResult = await prisma.item.updateMany({
                where: {
                    categoryId: { in: categoryIds },
                },
                data: {
                    infoTemplateId: template.id,
                },
            });
            console.log(`Linked template '${tData.internalName}' to ${updateResult.count} items in categories: ${categories.map((c) => c.name).join(", ")}`);
        } else {
            console.log(`No categories found matching: ${tData.categories.join(", ")}`);
        }
    }

    console.log("Migration complete!");
}

main()
    .catch((e) => {
        console.error("Migration failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
