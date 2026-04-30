import { db } from "./src/lib/db";

async function main() {
  await db.$executeRawUnsafe(`
    INSERT INTO "GlobalImage" (id, url, key, alt, area, published, "updatedAt")
    VALUES 
    ('gi-1', 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=1200&q=80', 'gi-1-key', 'Hero 1', 'CAROUSEL', true, NOW()),
    ('gi-2', 'https://images.unsplash.com/photo-1549480608-f46fae85df64?w=1200&q=80', 'gi-2-key', 'Hero 2', 'CAROUSEL', true, NOW())
    ON CONFLICT DO NOTHING;
  `);
  console.log("Global images seeded");
}

main().catch(console.error);
