import { db } from "@/lib/db";

const publicItemInclude = {
  images: { orderBy: { sortOrder: "asc" } },
  category: { include: { catalogType: true } },
} as const;

export async function listCategories(catalogTypeSlug?: string) {
  return db.category.findMany({
    where: {
      ...(catalogTypeSlug ? { catalogType: { is: { slug: catalogTypeSlug, isActive: true } } } : { catalogType: { is: { isActive: true } } }),
    },
    include: { catalogType: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function listPublishedItems(options: { categorySlug?: string; catalogTypeSlug?: string } = {}) {
  return db.item.findMany({
    where: {
      published: true,
      category: {
        is: {
          ...(options.categorySlug ? { slug: options.categorySlug } : {}),
          catalogType: {
            is: {
              isActive: true,
              ...(options.catalogTypeSlug ? { slug: options.catalogTypeSlug } : {}),
            },
          },
        },
      },
    },
    include: publicItemInclude,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
}

export async function listItemsByCategorySlug(slug: string) {
  return db.item.findMany({
    where: {
      published: true,
      category: {
        is: {
          slug,
          catalogType: {
            is: {
              isActive: true,
            },
          },
        },
      },
    },
    include: publicItemInclude,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getPublishedItemById(id: string) {
  if (!id) return null;

  return db.item.findFirst({
    where: {
      id,
      published: true,
      category: {
        is: {
          catalogType: {
            is: {
              isActive: true,
            },
          },
        },
      },
    },
    include: publicItemInclude,
  });
}

export async function getPublishedItemBySlug(slug: string) {
  if (!slug) return null;

  return db.item.findFirst({
    where: {
      slug,
      published: true,
      category: {
        is: {
          catalogType: {
            is: {
              isActive: true,
            },
          },
        },
      },
    },
    include: publicItemInclude,
  });
}

export async function getItemBySlug(slug: string) {
  return db.item.findUnique({
    where: { slug },
    include: publicItemInclude,
  });
}
