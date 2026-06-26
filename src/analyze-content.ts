import { db } from './lib/db';

async function main() {
  const categories = await db.category.findMany({
    include: { items: true }
  });
  
  const items = await db.item.findMany({
    include: { images: true, category: true, infoTemplate: true }
  });

  console.log("--- CATEGORIES WITHOUT ITEMS ---");
  categories.filter(c => c.items.length === 0).forEach(c => console.log(c.name));

  console.log("\n--- ITEMS WITHOUT IMAGES ---");
  items.filter(i => i.images.length === 0).forEach(i => console.log(`${i.title} (Category: ${i.category.name})`));

  console.log("\n--- ITEMS WITHOUT INFO TEMPLATE ---");
  items.filter(i => !i.infoTemplateId).forEach(i => console.log(`${i.title} (Category: ${i.category.name})`));

  console.log("\n--- ITEMS WITH DUMMY TEXT (Lorem) ---");
  items.filter(i => (i.description && i.description.includes('Lorem')) || (i.longDescription && i.longDescription.includes('Lorem')) || (i.title.includes('Test'))).forEach(i => console.log(i.title));

  console.log("\n--- ALL ITEMS STATUS ---");
  items.forEach(i => {
    console.log(`${i.title} | Price: ${i.priceType} | Stock: ${i.totalStock} | Pickup: ${i.pickupAvailable} | Delivery: ${i.deliveryAvailable}`);
  });
}

main().catch(console.error).finally(() => db.$disconnect());
