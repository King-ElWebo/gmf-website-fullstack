import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  console.log("=== GlobalImages ===");
  const globals = await db.$queryRawUnsafe(`SELECT * FROM "GlobalImage"`);
  console.log(globals);

  console.log("\n=== Categories ===");
  const categories = await db.category.findMany();
  console.log(categories.map((c: any) => ({ id: c.id, name: c.name, imageUrl: c.imageUrl, imageKey: c.imageKey })));

  console.log("\n=== ItemImages ===");
  const itemImages = await db.itemImage.findMany();
  console.log(itemImages.map((i: any) => ({ id: i.id, url: i.url, key: i.key })));
}

main().catch(console.error).finally(() => db.$disconnect());
