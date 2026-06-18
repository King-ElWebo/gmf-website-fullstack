import { db as prisma } from './src/lib/db';

async function main() {
  const resources = await prisma.resource.findMany();
  console.log("Existing Resources:", JSON.stringify(resources, null, 2));

  const items = await prisma.item.findMany({
    select: {
      id: true,
      title: true,
      category: {
        select: { name: true }
      },
      availabilityMode: true,
      resourceId: true,
      resourceUnits: true,
      resourceAppliesTo: true,
      resourceBlockTime: true,
      deliveryAvailable: true,
      pickupAvailable: true
    }
  });

  console.log("Total Items:", items.length);
  for (const item of items) {
    console.log(`- ${item.category.name}: ${item.title}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
