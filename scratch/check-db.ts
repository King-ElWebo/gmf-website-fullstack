import "dotenv/config";
import { db } from "../src/lib/db";

async function check() {
  const types = await db.catalogType.findMany();
  console.log("CatalogTypes in DB:");
  types.forEach(t => {
    console.log(`- ${t.name} (slug: ${t.slug}, isDefault: ${t.isDefault}, isActive: ${t.isActive})`);
  });
  await db.$disconnect();
}

check();
