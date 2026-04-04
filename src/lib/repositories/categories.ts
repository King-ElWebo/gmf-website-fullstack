import { db } from "@/lib/db";

export type CategoryInput = {
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    imageKey?: string | null;
    catalogTypeId: string;
};

type ListCategoriesOptions = {
    catalogTypeId?: string;
    catalogTypeSlug?: string;
    activeCatalogTypesOnly?: boolean;
};

const categoryInclude = {
    catalogType: true,
} as const;

export async function listCategories(options: ListCategoriesOptions = {}) {
    const catalogTypeWhere =
        options.catalogTypeSlug || options.activeCatalogTypesOnly
            ? {
                  ...(options.catalogTypeSlug ? { slug: options.catalogTypeSlug } : {}),
                  ...(options.activeCatalogTypesOnly ? { isActive: true } : {}),
              }
            : undefined;

    return db.category.findMany({
        where: {
            ...(options.catalogTypeId ? { catalogTypeId: options.catalogTypeId } : {}),
            ...(catalogTypeWhere ? { catalogType: { is: catalogTypeWhere } } : {}),
        },
        include: categoryInclude,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
}

export async function getCategoryById(id: string) {
    return db.category.findUnique({ where: { id }, include: categoryInclude });
}

export async function createCategory(data: CategoryInput) {
    const last = await db.category.findFirst({
        orderBy: [{ sortOrder: "desc" }],
        select: { sortOrder: true },
    });

    return db.category.create({
        data: {
            ...data,
            sortOrder: (last?.sortOrder ?? -1) + 1,
        },
        include: categoryInclude,
    });
}

export async function updateCategory(id: string, data: CategoryInput) {
    return db.category.update({ where: { id }, data, include: categoryInclude });
}

export async function deleteCategory(id: string) {
    const deleted = await db.category.delete({ where: { id } });
    await normalizeCategorySortOrder();
    return deleted;
}

export async function reorderCategories(orderedIds: string[]) {
    const categories = await db.category.findMany({
        select: { id: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    if (categories.length !== orderedIds.length) {
        throw new Error("orderedIds must include all categories");
    }

    const existingIds = new Set(categories.map((category) => category.id));
    const uniqueIds = new Set(orderedIds);

    if (uniqueIds.size !== orderedIds.length || orderedIds.some((id) => !existingIds.has(id))) {
        throw new Error("orderedIds contains invalid category IDs");
    }

    await db.$transaction(
        orderedIds.map((id, index) =>
            db.category.update({
                where: { id },
                data: { sortOrder: index },
            })
        )
    );

    return listCategories();
}

export async function normalizeCategorySortOrder() {
    const categories = await db.category.findMany({
        select: { id: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    });

    await db.$transaction(
        categories.map((category, index) =>
            db.category.update({
                where: { id: category.id },
                data: { sortOrder: index },
            })
        )
    );
}
