import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  console.log("=== CATALOG TYPES ===");
  const catalogTypes = await db.catalogType.findMany();
  console.log(JSON.stringify(catalogTypes, null, 2));

  console.log("=== CATEGORIES ===");
  const categories = await db.category.findMany();
  console.log(JSON.stringify(categories, null, 2));

  console.log("=== ITEMS (First 50) ===");
  const items = await db.item.findMany({
    take: 50,
    include: {
      images: true,
    }
  });
  console.log(JSON.stringify(items, null, 2));
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
