import { db as prisma } from "../src/lib/db";

async function main() {
  await prisma.siteSettings.upsert({
    where: { key: "default" },
    update: {},
    create: {
      key: "default",
    },
  });

  const defaultCatalogType = await prisma.catalogType.upsert({
    where: { slug: "standard" },
    update: {
      name: "Standard",
      description: "Generischer Standardtyp fuer Kategorien.",
      sortOrder: 0,
      isActive: true,
    },
    create: {
      name: "Standard",
      slug: "standard",
      description: "Generischer Standardtyp fuer Kategorien.",
      sortOrder: 0,
      isActive: true,
    },
  });

  const categories = [
    { name: "Kameras", slug: "kameras", sortOrder: 0 },
    { name: "Licht", slug: "licht", sortOrder: 1 },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, catalogTypeId: defaultCatalogType.id, sortOrder: c.sortOrder },
      create: { ...c, catalogTypeId: defaultCatalogType.id },
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
      priceType: "FIXED",
      basePriceCents: 3500,
      priceLabel: null,
      priceCents: 3500,
      sortOrder: 0,
    },
    create: {
      title: "Sony A7",
      slug: "sony-a7",
      description: "Beispiel-Item",
      priceType: "FIXED",
      basePriceCents: 3500,
      priceLabel: null,
      priceCents: 3500,
      categoryId: camCat.id,
      sortOrder: 0,
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
