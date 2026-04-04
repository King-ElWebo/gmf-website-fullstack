import { db } from "@/lib/db";

export type CatalogTypeInput = {
    name: string;
    slug: string;
    description?: string | null;
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
            sortOrder: data.sortOrder ?? 0,
            isActive: data.isActive ?? true,
        },
        include: catalogTypeInclude,
    });
}

export async function deleteCatalogType(id: string) {
    return db.catalogType.delete({ where: { id } });
}
