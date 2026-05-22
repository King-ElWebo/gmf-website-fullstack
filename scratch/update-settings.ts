import "dotenv/config";
import { db } from "../src/lib/db";

async function run() {
  console.log("Updating SiteSettings in database...");
  try {
    const updated = await db.siteSettings.upsert({
      where: { key: "default" },
      update: {
        email: "gmfeventmodule@gmail.com",
        phone: "+43 664 5550324",
        address: "Stranzendorf 16, 3702 Stranzendorf",
      },
      create: {
        key: "default",
        email: "gmfeventmodule@gmail.com",
        phone: "+43 664 5550324",
        address: "Stranzendorf 16, 3702 Stranzendorf",
      },
    });

    console.log("Successfully updated SiteSettings:", updated);
  } catch (error) {
    console.error("Error updating SiteSettings in database:", error);
  } finally {
    await db.$disconnect();
  }
}

run();
