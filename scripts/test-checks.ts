import { db } from "../src/lib/db";

async function main() {
    const i = await db.item.findFirst({
        where: {category: {slug: 'huepfburgen-rutschen'}}, 
        include: {infoTemplate: true}
    });
    console.log("TEMPLATES FOR HUEPFBURG:");
    console.log(JSON.stringify(i?.infoTemplate, null, 2));

    const techItems = await db.item.findMany({
        where: {
            title: {
                in: [
                    'TW Audio Sys One',
                    'Akkuscheinwerfer',
                    'Bodennebel Theater'
                ]
            }
        },
        select: {
            title: true,
            published: true,
            categoryId: true,
            basePriceCents: true,
            trackInventory: true,
            totalStock: true,
            deliveryAvailable: true,
            pickupAvailable: true
        }
    });
    console.log("TECH ITEMS PROPS:");
    console.log(JSON.stringify(techItems, null, 2));
}
main().catch(console.error);
