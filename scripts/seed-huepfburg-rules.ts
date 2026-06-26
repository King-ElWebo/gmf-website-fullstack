import { db as prisma } from "../src/lib/db";

const bouncyCastleTemplate = {
    internalName: "Hüpfburg Regeln",
    title: "Wichtige Verleihbedingungen für Hüpfburgen",
    categories: ["Hüpfburgen/Rutschen", "Hüpfburgen & Rutschen"],
    blocks: [
        {
            highlightLabel: "!",
            heading: "Sicherheit & Nutzung",
            body: "Die Luftburg darf nur ohne Schuhe betreten werden. Speisen, Getränke und spitze Gegenstände sind strengstens verboten. Zulässige Kindermenge nicht überschreiten. Keine Erwachsenen in der Hüpfburg!",
            sortOrder: 1,
        },
        {
            highlightLabel: "!",
            heading: "Umgang & Verhalten",
            body: "Das Hinaufklettern an den Wänden sowie das Springen in die Sicherheitsnetze ist untersagt. Das Hinunterziehen der Netze oder Wände führt zu Schäden, für die der Mieter haftet.",
            sortOrder: 2,
        },
        {
            highlightLabel: "!",
            heading: "Aufsicht & Gebläse",
            body: "Eltern haben die Aufsichtspflicht und haften für ihre Kinder. Das Gebläse ist regelmäßig auf Standfestigkeit zu prüfen und der Lärmschutz freizuhalten.",
            sortOrder: 3,
        },
        {
            highlightLabel: "OK",
            heading: "Rückgabe & Reinigung",
            body: "Das Eventmodul muss sauber (ausgesaugt/ausgewischt) und in bestem Zustand zurückgebracht werden. Bei nasser oder stark verschmutzter Rückgabe fallen gemäß unseren Bedingungen Trocknungs- bzw. Reinigungspauschalen an.",
            sortOrder: 4,
        },
    ],
};

async function main() {
    console.log("Seeding Bouncy Castle Rules Info-Template...");

    let template = await prisma.infoTemplate.findFirst({
        where: { internalName: bouncyCastleTemplate.internalName },
    });

    if (!template) {
        template = await prisma.infoTemplate.create({
            data: {
                internalName: bouncyCastleTemplate.internalName,
                title: bouncyCastleTemplate.title,
                blocks: {
                    create: bouncyCastleTemplate.blocks,
                },
            },
        });
    } else {
        await prisma.infoTemplateBlock.deleteMany({
            where: { infoTemplateId: template.id },
        });
        await prisma.infoTemplate.update({
            where: { id: template.id },
            data: {
                title: bouncyCastleTemplate.title,
                blocks: {
                    create: bouncyCastleTemplate.blocks,
                },
            },
        });
    }

    const categories = await prisma.category.findMany({
        where: { name: { in: bouncyCastleTemplate.categories } },
        select: { id: true },
    });

    if (categories.length > 0) {
        const categoryIds = categories.map((c) => c.id);
        await prisma.item.updateMany({
            where: { categoryId: { in: categoryIds } },
            data: { infoTemplateId: template.id },
        });
        console.log(`Linked template to items in Hüpfburg categories.`);
    }

    console.log("Done seeding Info-Template.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
