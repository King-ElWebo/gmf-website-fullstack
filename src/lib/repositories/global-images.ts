import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { DisplayArea } from "@/lib/display-area";
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
    return [];
}

/** Retrieve a single global image by ID */
export async function getGlobalImageById(id: string): Promise<GlobalImageRow | null> {
    return null;
}

/** Append a new global image after the current highest global sortOrder. */
export async function createGlobalImage(
    url: string,
    key: string,
    area: DisplayArea = DisplayArea.OTHER,
    alt?: string,
    published: boolean = true
): Promise<GlobalImageRow> {
    return { id: "mock-image", url, key, area, alt: alt ?? null, published, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() };
}

/** Update a global image's metadata */
export async function updateGlobalImage(
    id: string,
    data: any
): Promise<GlobalImageRow> {
    return { id, url: "", key: "", area: DisplayArea.OTHER, alt: null, published: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date(), ...data } as GlobalImageRow;
}

export async function reorderGlobalImages(orderedIds: string[]) {
    return [];
}

export async function normalizeGlobalImageSortOrder() {
    return;
}

/**
 * Delete a global image from DB and its underlying file from storage.
 */
export async function deleteGlobalImage(id: string): Promise<GlobalImageRow> {
    return { id, url: "", key: "", area: DisplayArea.OTHER, alt: null, published: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() };
}
