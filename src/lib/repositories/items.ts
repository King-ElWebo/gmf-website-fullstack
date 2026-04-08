import { db } from "@/lib/db";

export type ItemInput = {
    title: string;
    slug: string;
    description?: string | null;
    shortDescription?: string | null;
    longDescription?: string | null;
    videoUrl?: string | null;
    priceCents?: number | null;
    priceType: "FIXED" | "ON_REQUEST" | "FROM_PRICE";
    basePriceCents?: number | null;
    priceLabel?: string | null;
    depositRequired: boolean;
    depositLabel?: string | null;
    depositInfo?: string | null;
    cleaningFeeApplies: boolean;
    cleaningFeeLabel?: string | null;
    cleaningFeeInfo?: string | null;
    dryingFeeApplies: boolean;
    dryingFeeLabel?: string | null;
    dryingFeeInfo?: string | null;
    additionalCostsInfo?: string | null;
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
    requiresDeliveryAddress: boolean;
    deliveryInfo?: string | null;
    usageInfo?: string | null;
    rentalNotes?: string | null;
    setupRequirements?: string | null;
    accessRequirements?: string | null;
    trackInventory: boolean;
    totalStock: number;
    published: boolean;
    categoryId: string;
};

function buildItemPersistenceData(data: ItemInput) {
    const syncedPriceCents =
        data.priceType === "ON_REQUEST" ? null : data.basePriceCents ?? data.priceCents ?? null;
    const syncedLongDescription = data.longDescription ?? data.description ?? null;

    return {
        ...data,
        description: syncedLongDescription,
        longDescription: syncedLongDescription,
        priceCents: syncedPriceCents,
        basePriceCents: syncedPriceCents,
        totalStock: Math.max(0, Math.floor(data.totalStock)),
    };
}

export async function listItems() {
    return db.item.findMany({
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        include: { category: { include: { catalogType: true } } },
    });
}

export async function getItemById(id: string) {
    if (!id) return null;
    return db.item.findUnique({
        where: { id },
        include: { category: { include: { catalogType: true } } },
    });
}

export async function createItem(data: ItemInput) {
    const last = await db.item.findFirst({
        orderBy: [{ sortOrder: "desc" }],
        select: { sortOrder: true },
    });

    return db.item.create({
        data: {
            ...buildItemPersistenceData(data),
            sortOrder: (last?.sortOrder ?? -1) + 1,
        },
    });
}

export async function updateItem(id: string, data: ItemInput) {
    return db.item.update({
        where: { id },
        data: buildItemPersistenceData(data),
    });
}

export async function deleteItem(id: string) {
    const deleted = await db.item.delete({ where: { id } });
    await normalizeItemSortOrder();
    return deleted;
}

export async function reorderItems(orderedIds: string[]) {
    const items = await db.item.findMany({
        select: { id: true },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    if (items.length !== orderedIds.length) {
        throw new Error("orderedIds must include all items");
    }

    const existingIds = new Set(items.map((item) => item.id));
    const uniqueIds = new Set(orderedIds);

    if (uniqueIds.size !== orderedIds.length || orderedIds.some((id) => !existingIds.has(id))) {
        throw new Error("orderedIds contains invalid item IDs");
    }

    await db.$transaction(
        orderedIds.map((id, index) =>
            db.item.update({
                where: { id },
                data: { sortOrder: index },
            })
        )
    );

    return listItems();
}

export async function normalizeItemSortOrder() {
    const items = await db.item.findMany({
        select: { id: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    });

    await db.$transaction(
        items.map((item, index) =>
            db.item.update({
                where: { id: item.id },
                data: { sortOrder: index },
            })
        )
    );
}
