import { db } from "@/lib/db";
import { DisplayArea, Prisma } from "@prisma/client";
import storage from "@/lib/storage";

export type GlobalImageRow = {
    id: string;
    url: string;
    key: string;
    alt: string | null;
    area: DisplayArea;
    published: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
};

/** Return all global images, ordered by sortOrder ascending. Optionally filter by area. */
export async function listGlobalImages(area?: DisplayArea): Promise<GlobalImageRow[]> {
    const where = area ? { area } : {};
    return (db as any).globalImage?.findMany({
        where,
        orderBy: { sortOrder: "asc" },
    }) ?? [];
}

/** Retrieve a single global image by ID */
export async function getGlobalImageById(id: string): Promise<GlobalImageRow | null> {
    return (db as any).globalImage?.findUnique({
        where: { id },
    }) ?? null;
}

/** Append a new global image after the current highest sortOrder in its area. */
export async function createGlobalImage(
    url: string,
    key: string,
    area: DisplayArea = DisplayArea.OTHER,
    alt?: string,
    published: boolean = true
): Promise<GlobalImageRow> {
    // Find current max sortOrder for this area
    const last = await db.globalImage.findFirst({
        where: { area },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
    });

    const sortOrder = (last?.sortOrder ?? -1) + 1;

    return db.globalImage.create({
        data: {
            url,
            key,
            area,
            alt: alt ?? null,
            published,
            sortOrder,
        },
    });
}

/** Update a global image's metadata */
export async function updateGlobalImage(
    id: string,
    data: Prisma.GlobalImageUpdateInput
): Promise<GlobalImageRow> {
    const row = await db.globalImage.findUnique({ where: { id } });
    if (!row) throw new Error("Image not found");

    return db.globalImage.update({
        where: { id },
        data,
    });
}

/**
 * Delete a global image from DB and its underlying file from storage.
 */
export async function deleteGlobalImage(id: string): Promise<GlobalImageRow> {
    const row = await db.globalImage.findUnique({ where: { id } });
    if (!row) throw new Error("Image not found");

    // Remove from DB
    await db.globalImage.delete({ where: { id } });

    // Remove from storage system
    await storage.delete(row.key);

    return row;
}
