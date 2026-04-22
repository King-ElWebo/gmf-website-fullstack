import { db } from "../src/lib/db";

async function main() {
  // Update ALL catalog types to show in the navbar
  await db.catalogType.updateMany({
    data: { showInNav: true }
  });

  console.log("Updated all CatalogTypes to showInNav: true");

  // Fetch all to see them
  const all = await db.catalogType.findMany();
  for (const ct of all) {
     if (ct.slug === "standard") {
       await db.catalogType.update({
         where: { id: ct.id },
         data: { isDefault: true, navLabel: "Standard" }
       });
       console.log("Set Standard to isDefault: true");
     } else {
       await db.catalogType.update({
         where: { id: ct.id },
         data: { isDefault: false }
       });
       console.log(`Set ${ct.name} to isDefault: false`);
     }
  }
}

main().catch(console.error);
