import "dotenv/config";
import { db } from './lib/db';

async function main() {
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      customer: true,
      items: true,
    }
  });

  console.log("RECENT BOOKINGS:");
  console.log(JSON.stringify(bookings, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => db.$disconnect());
