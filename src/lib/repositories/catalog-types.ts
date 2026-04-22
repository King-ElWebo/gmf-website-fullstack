import { db } from "@/lib/db";

export type CatalogTypeInput = {
    name: string;
    slug: string;
    description?: string | null;
    navLabel?: string | null;
    showInNav?: boolean;
    isDefault?: boolean;
    sortOrder?: number;
    isActive?: boolean;
};

type ListCatalogTypesOptions = {
    activeOnly?: boolean;
};

const catalogTypeInclude = {
    _count: {
        select: {
            categories: true,
        },
    },
} as const;

export async function listCatalogTypes(options: ListCatalogTypesOptions = {}) {
    return db.catalogType.findMany({
        where: options.activeOnly ? { isActive: true } : undefined,
        include: catalogTypeInclude,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
}

export async function listCatalogTypesForSelect() {
    return db.catalogType.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
}

/** Returns active catalog types that should appear in the navbar, sorted by sortOrder. */
export async function listNavCatalogTypes() {
    return db.catalogType.findMany({
        where: { isActive: true, showInNav: true },
        select: {
            id: true,
            name: true,
            slug: true,
            navLabel: true,
            sortOrder: true,
            isDefault: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
}

/** Returns the default catalog type (isDefault === true), or null if none is set. */
export async function getDefaultCatalogType() {
    return db.catalogType.findFirst({
        where: { isDefault: true, isActive: true },
        select: { id: true, slug: true, name: true },
    });
}

/** Returns a catalog type by slug if it's active, or null. */
export async function getActiveCatalogTypeBySlug(slug: string) {
    return db.catalogType.findFirst({
        where: { slug, isActive: true },
        include: catalogTypeInclude,
    });
}

export async function getCatalogTypeById(id: string) {
    return db.catalogType.findUnique({
        where: { id },
        include: catalogTypeInclude,
    });
}

export async function createCatalogType(data: CatalogTypeInput) {
    return db.catalogType.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description ?? null,
            navLabel: data.navLabel ?? null,
            showInNav: data.showInNav ?? false,
            isDefault: data.isDefault ?? false,
            sortOrder: data.sortOrder ?? 0,
            isActive: data.isActive ?? true,
        },
        include: catalogTypeInclude,
    });
}

export async function updateCatalogType(id: string, data: CatalogTypeInput) {
    return db.catalogType.update({
        where: { id },
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description ?? null,
            navLabel: data.navLabel ?? null,
            showInNav: data.showInNav ?? false,
            isDefault: data.isDefault ?? false,
            sortOrder: data.sortOrder ?? 0,
            isActive: data.isActive ?? true,
        },
        include: catalogTypeInclude,
    });
}

export async function deleteCatalogType(id: string) {
    return db.catalogType.delete({ where: { id } });
}

export async function reorderCatalogTypes(orderedIds: string[]) {
    // Execute updates in a transaction to ensure valid sortOrders
    const queries = orderedIds.map((id, index) =>
        db.catalogType.update({
            where: { id },
            data: { sortOrder: index + 1 },
        })
    );

    await db.$transaction(queries);
    return listCatalogTypes();
}
