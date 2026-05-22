import "dotenv/config";
import { db } from "../src/lib/db";

async function run() {
  console.log("Checking database bookings...");
  try {
    const bookings = await db.booking.findMany({
      include: {
        items: true,
      },
    });
    console.log(`Found ${bookings.length} bookings in total.`);
    for (const b of bookings) {
      console.log(`- ID: ${b.id}, Code: ${b.referenceCode}, Status: ${b.status}, Start: ${b.startDate.toISOString()}, End: ${b.endDate.toISOString()}`);
      for (const item of b.items) {
        console.log(`  * Item ID: ${item.itemId}, Qty: ${item.quantity}`);
      }
    }
  } catch (error) {
    console.error("Error connecting to database or querying bookings:", error);
  }
}

run();
