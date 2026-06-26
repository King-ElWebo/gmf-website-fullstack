import { db as prisma } from './lib/db';

async function main() {
  console.log("=== CATALOG TYPES ===");
  const catalogTypes = await prisma.catalogType.findMany();
  console.log(JSON.stringify(catalogTypes, null, 2));

  console.log("=== CATEGORIES ===");
  const categories = await prisma.category.findMany({
    include: { catalogType: true, items: true }
  });
  console.log(JSON.stringify(categories, null, 2));

  console.log("\n=== ITEMS ===");
  const items = await prisma.item.findMany({
    include: { images: true, category: true, infoTemplate: true }
  });
  console.log(JSON.stringify(items, null, 2));

  console.log("\n=== INFO TEMPLATES ===");
  const infoTemplates = await prisma.infoTemplate.findMany();
  console.log(JSON.stringify(infoTemplates, null, 2));

  console.log("\n=== GLOBAL IMAGES (CAROUSEL/SOCIAL) ===");
  const globalImages = await prisma.globalImage.findMany();
  console.log(JSON.stringify(globalImages, null, 2));

  console.log("\n=== FAQS ===");
  const faqs = await prisma.faq.findMany();
  console.log(JSON.stringify(faqs, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
