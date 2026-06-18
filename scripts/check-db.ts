import { db as prisma } from '../src/lib/db';

async function main() {
    const items = await prisma.item.findMany({
        where: {
            title: {
                contains: 'zuckerwatte',
                mode: 'insensitive'
            }
        },
        include: {
            resource: true
        }
    });
    console.log(JSON.stringify(items, null, 2));

    const allLarge = await prisma.item.findMany({
        where: {
            availabilityMode: { not: 'STOCK_ONLY' }
        },
        include: {
            resource: true
        }
    });
    console.log("Items with resources:", JSON.stringify(allLarge.map((i: any) => ({ title: i.title, res: i.resource?.name, mode: i.availabilityMode, units: i.resourceUnits, appliesTo: i.resourceAppliesTo, pickup: i.pickupAvailable, delivery: i.deliveryAvailable })), null, 2));
}

main().finally(() => prisma.$disconnect());
