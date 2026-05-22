import "dotenv/config";
import { db } from "../src/lib/db";

async function run() {
  console.log("Checking database items...");
  try {
    const items = await db.item.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        deliveryAvailable: true,
        pickupAvailable: true,
      }
    });
    console.log(`Found ${items.length} items.`);
    for (const item of items) {
      console.log(`- [${item.id}] ${item.title} (${item.slug}):`);
      console.log(`  * Delivery Available: ${item.deliveryAvailable}`);
      console.log(`  * Pickup Available: ${item.pickupAvailable}`);
    }
  } catch (error) {
    console.error("Error querying items:", error);
  }
}

run();
