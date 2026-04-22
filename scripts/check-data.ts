import { db } from "../src/lib/db";
async function main() {
  const catTypes = await db.catalogType.findMany({ include: { categories: true } });
  console.log(JSON.stringify(catTypes, null, 2));
}
main().catch(console.error);
