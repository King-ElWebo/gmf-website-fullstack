import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Kameras", slug: "kameras" },
    { name: "Licht", slug: "licht" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }

  const camCat = await prisma.category.findUnique({ where: { slug: "kameras" } });
  if (!camCat) throw new Error("Seed: category 'kameras' missing");

  await prisma.item.upsert({
    where: { slug: "sony-a7" },
    update: {
      title: "Sony A7",
      categoryId: camCat.id,
      published: true,
      priceCents: 3500,
    },
    create: {
      title: "Sony A7",
      slug: "sony-a7",
      description: "Beispiel-Item",
      priceCents: 3500,
      categoryId: camCat.id,
      images: {
        create: [{ url: "/uploads/demo.jpg", key: "demo.jpg", alt: "Demo", sortOrder: 0 }],
      },
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });