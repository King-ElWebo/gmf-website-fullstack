import { db } from "@/lib/db";

export type ImageRow = {
    id: string;
    itemId: string;
    url: string;
    key: string;
    alt: string | null;
    sortOrder: number;
    createdAt: Date;
};

/** Return all images for an item, ordered by sortOrder ascending. */
export async function listByItemId(itemId: string): Promise<ImageRow[]> {
    return db.itemImage.findMany({
        where: { itemId },
        orderBy: { sortOrder: "asc" },
    });
}

/** Append new images after the current highest sortOrder. */
export async function addImages(
    itemId: string,
    images: { url: string; key: string; alt?: string }[]
): Promise<ImageRow[]> {
    // Find current max sortOrder
    const last = await db.itemImage.findFirst({
        where: { itemId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
    });

    const baseOrder = (last?.sortOrder ?? -1) + 1;

    await db.itemImage.createMany({
        data: images.map((img, i) => ({
            itemId,
            url: img.url,
            key: img.key,
            alt: img.alt ?? null,
            sortOrder: baseOrder + i,
        })),
    });

    return listByItemId(itemId);
}

/**
 * Reorder images by providing orderedIds (all must belong to itemId).
 * Sets sortOrder = index for each id inside a transaction.
 */
export async function reorder(
    itemId: string,
    orderedIds: string[]
): Promise<ImageRow[]> {
    // Validate ownership
    const existing = await db.itemImage.findMany({
        where: { itemId },
        select: { id: true },
    });
    const existingIds = new Set(existing.map((r) => r.id));
    const allValid = orderedIds.every((id) => existingIds.has(id));
    if (!allValid) {
        throw new Error("Some image IDs do not belong to this item");
    }

    await db.$transaction(
        orderedIds.map((id, index) =>
            db.itemImage.update({ where: { id }, data: { sortOrder: index } })
        )
    );

    return listByItemId(itemId);
}

/**
 * Move imageId to sortOrder 0 and shift all other images' sortOrder up by 1.
 */
export async function setCover(
    itemId: string,
    imageId: string
): Promise<ImageRow[]> {
    const all = await listByItemId(itemId);
    const target = all.find((img) => img.id === imageId);
    if (!target) throw new Error("Image not found");

    // Build new order: target first, then the rest in their existing order
    const others = all.filter((img) => img.id !== imageId);
    const newOrder = [target, ...others];

    await db.$transaction(
        newOrder.map((img, index) =>
            db.itemImage.update({
                where: { id: img.id },
                data: { sortOrder: index },
            })
        )
    );

    return listByItemId(itemId);
}

/**
 * Delete an image row from the DB. Returns the row (caller uses `key` to
 * delete from storage).
 */
export async function deleteImage(imageId: string): Promise<ImageRow> {
    const row = await db.itemImage.findUnique({ where: { id: imageId } });
    if (!row) throw new Error("Image not found");
    await db.itemImage.delete({ where: { id: imageId } });
    return row;
}
