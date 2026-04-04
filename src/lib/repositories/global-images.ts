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

type ListGlobalImagesOptions = {
    area?: DisplayArea;
    published?: boolean;
};

/** Return all global images, ordered by saved sortOrder. */
export async function listGlobalImages(options: ListGlobalImagesOptions = {}): Promise<GlobalImageRow[]> {
    const where: Prisma.GlobalImageWhereInput = {
        ...(options.area ? { area: options.area } : {}),
        ...(typeof options.published === "boolean" ? { published: options.published } : {}),
    };

    return db.globalImage.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
}

/** Retrieve a single global image by ID */
export async function getGlobalImageById(id: string): Promise<GlobalImageRow | null> {
    return db.globalImage.findUnique({
        where: { id },
    });
}

/** Append a new global image after the current highest global sortOrder. */
export async function createGlobalImage(
    url: string,
    key: string,
    area: DisplayArea = DisplayArea.OTHER,
    alt?: string,
    published: boolean = true
): Promise<GlobalImageRow> {
    const last = await db.globalImage.findFirst({
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

export async function reorderGlobalImages(orderedIds: string[]) {
    const images = await db.globalImage.findMany({
        select: { id: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    if (images.length !== orderedIds.length) {
        throw new Error("orderedIds must include all images");
    }

    const existingIds = new Set(images.map((image) => image.id));
    const uniqueIds = new Set(orderedIds);

    if (uniqueIds.size !== orderedIds.length || orderedIds.some((id) => !existingIds.has(id))) {
        throw new Error("orderedIds contains invalid image IDs");
    }

    await db.$transaction(
        orderedIds.map((id, index) =>
            db.globalImage.update({
                where: { id },
                data: { sortOrder: index },
            })
        )
    );

    return listGlobalImages();
}

export async function normalizeGlobalImageSortOrder() {
    const images = await db.globalImage.findMany({
        select: { id: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    });

    await db.$transaction(
        images.map((image, index) =>
            db.globalImage.update({
                where: { id: image.id },
                data: { sortOrder: index },
            })
        )
    );
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

    await normalizeGlobalImageSortOrder();

    return row;
}
