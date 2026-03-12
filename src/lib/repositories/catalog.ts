import { db } from "@/lib/db";

export async function listCategories() {
  return db.category.findMany({ orderBy: { name: "asc" } });
}

export async function listItemsByCategorySlug(slug: string) {
  return db.item.findMany({
    where: { category: { slug }, published: true },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getItemBySlug(slug: string) {
  return db.item.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });
}

export async function listPublishedItems() {
  return db.item.findMany({
    where: { published: true },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublishedItemById(id: string) {
  return db.item.findUnique({
    where: { id, published: true },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });
}
