import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { DisplayArea } from "@/lib/display-area";
import storage from "@/lib/storage";
import { randomUUID } from "crypto";

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

let ensureTablePromise: Promise<void> | null = null;

async function ensureGlobalImageTable() {
    if (!ensureTablePromise) {
        ensureTablePromise = (async () => {
            await db.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "GlobalImage" (
                    "id" TEXT PRIMARY KEY,
                    "url" TEXT NOT NULL,
                    "key" TEXT NOT NULL,
                    "alt" TEXT,
                    "area" TEXT NOT NULL DEFAULT 'OTHER',
                    "published" BOOLEAN NOT NULL DEFAULT true,
                    "sortOrder" INTEGER NOT NULL DEFAULT 0,
                    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);
            await db.$executeRawUnsafe(
                `CREATE INDEX IF NOT EXISTS "GlobalImage_sortOrder_idx" ON "GlobalImage"("sortOrder");`
            );
            await db.$executeRawUnsafe(
                `CREATE INDEX IF NOT EXISTS "GlobalImage_area_published_idx" ON "GlobalImage"("area", "published");`
            );
        })().catch((error) => {
            ensureTablePromise = null;
            throw error;
        });
    }

    await ensureTablePromise;
}

/** Return all global images, ordered by saved sortOrder. */
export async function listGlobalImages(options: ListGlobalImagesOptions = {}): Promise<GlobalImageRow[]> {
    await ensureGlobalImageTable();

    const filters: Prisma.Sql[] = [];
    if (options.area) {
        filters.push(Prisma.sql`"area" = ${options.area}`);
    }
    if (typeof options.published === "boolean") {
        filters.push(Prisma.sql`"published" = ${options.published}`);
    }

    const whereSql =
        filters.length > 0
            ? Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`
            : Prisma.empty;

    return db.$queryRaw<GlobalImageRow[]>(Prisma.sql`
        SELECT
            "id",
            "url",
            "key",
            "alt",
            "area",
            "published",
            "sortOrder",
            "createdAt",
            "updatedAt"
        FROM "GlobalImage"
        ${whereSql}
        ORDER BY "sortOrder" ASC, "createdAt" ASC, "id" ASC
    `);
}

/** Retrieve a single global image by ID */
export async function getGlobalImageById(id: string): Promise<GlobalImageRow | null> {
    await ensureGlobalImageTable();

    const rows = await db.$queryRaw<GlobalImageRow[]>(Prisma.sql`
        SELECT
            "id",
            "url",
            "key",
            "alt",
            "area",
            "published",
            "sortOrder",
            "createdAt",
            "updatedAt"
        FROM "GlobalImage"
        WHERE "id" = ${id}
        LIMIT 1
    `);

    return rows[0] ?? null;
}

/** Append a new global image after the current highest global sortOrder. */
export async function createGlobalImage(
    url: string,
    key: string,
    area: DisplayArea = DisplayArea.OTHER,
    alt?: string,
    published: boolean = true
): Promise<GlobalImageRow> {
    await ensureGlobalImageTable();

    const maxRows = await db.$queryRaw<Array<{ maxSort: number | null }>>(Prisma.sql`
        SELECT COALESCE(MAX("sortOrder"), -1)::int AS "maxSort"
        FROM "GlobalImage"
    `);
    const nextSortOrder = (maxRows[0]?.maxSort ?? -1) + 1;

    const id = randomUUID();
    const rows = await db.$queryRaw<GlobalImageRow[]>(Prisma.sql`
        INSERT INTO "GlobalImage" (
            "id",
            "url",
            "key",
            "alt",
            "area",
            "published",
            "sortOrder"
        )
        VALUES (
            ${id},
            ${url},
            ${key},
            ${alt ?? null},
            ${area},
            ${published},
            ${nextSortOrder}
        )
        RETURNING
            "id",
            "url",
            "key",
            "alt",
            "area",
            "published",
            "sortOrder",
            "createdAt",
            "updatedAt"
    `);

    return rows[0];
}

/** Update a global image's metadata */
export async function updateGlobalImage(
    id: string,
    data: Partial<Pick<GlobalImageRow, "url" | "key" | "alt" | "area" | "published">>
): Promise<GlobalImageRow> {
    await ensureGlobalImageTable();

    const updates: Prisma.Sql[] = [];
    if (typeof data.url === "string") updates.push(Prisma.sql`"url" = ${data.url}`);
    if (typeof data.key === "string") updates.push(Prisma.sql`"key" = ${data.key}`);
    if (typeof data.alt !== "undefined") updates.push(Prisma.sql`"alt" = ${data.alt ?? null}`);
    if (typeof data.area === "string") updates.push(Prisma.sql`"area" = ${data.area}`);
    if (typeof data.published === "boolean") updates.push(Prisma.sql`"published" = ${data.published}`);
    updates.push(Prisma.sql`"updatedAt" = NOW()`);

    const rows = await db.$queryRaw<GlobalImageRow[]>(Prisma.sql`
        UPDATE "GlobalImage"
        SET ${Prisma.join(updates, ", ")}
        WHERE "id" = ${id}
        RETURNING
            "id",
            "url",
            "key",
            "alt",
            "area",
            "published",
            "sortOrder",
            "createdAt",
            "updatedAt"
    `);

    const updated = rows[0];
    if (!updated) {
        throw new Error("Image not found");
    }

    return updated;
}

export async function reorderGlobalImages(orderedIds: string[]) {
    await ensureGlobalImageTable();

    await db.$transaction(
        orderedIds.map((id, index) =>
            db.$executeRaw(Prisma.sql`
                UPDATE "GlobalImage"
                SET "sortOrder" = ${index},
                    "updatedAt" = NOW()
                WHERE "id" = ${id}
            `)
        )
    );

    return listGlobalImages();
}

export async function normalizeGlobalImageSortOrder() {
    await ensureGlobalImageTable();

    const rows = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT "id"
        FROM "GlobalImage"
        ORDER BY "sortOrder" ASC, "createdAt" ASC, "id" ASC
    `);

    if (rows.length === 0) return;

    await db.$transaction(
        rows.map((row, index) =>
            db.$executeRaw(Prisma.sql`
                UPDATE "GlobalImage"
                SET "sortOrder" = ${index},
                    "updatedAt" = NOW()
                WHERE "id" = ${row.id}
            `)
        )
    );
}

/**
 * Delete a global image from DB and its underlying file from storage.
 */
export async function deleteGlobalImage(id: string): Promise<GlobalImageRow> {
    await ensureGlobalImageTable();

    const rows = await db.$queryRaw<GlobalImageRow[]>(Prisma.sql`
        DELETE FROM "GlobalImage"
        WHERE "id" = ${id}
        RETURNING
            "id",
            "url",
            "key",
            "alt",
            "area",
            "published",
            "sortOrder",
            "createdAt",
            "updatedAt"
    `);

    const removed = rows[0];
    if (!removed) {
        throw new Error("Image not found");
    }

    await storage.delete(removed.key).catch(() => undefined);
    await normalizeGlobalImageSortOrder();

    return removed;
}
