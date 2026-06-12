import { NextResponse } from "next/server";
import { deleteItem, getItemById, updateItem } from "@/lib/repositories/items";
import { parseAdminItemPayload } from "@/lib/items/admin-item-payload";
import { listByItemId } from "@/lib/repositories/item-images";
import storage from "@/lib/storage";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;
    const item = await getItemById(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const parsed = parseAdminItemPayload(body);
    if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }

    try {
        const { id } = await ctx.params;
        const updated = await updateItem(id, parsed.data);

        return NextResponse.json({ item: updated });
    } catch (e: unknown) {
        const error = e as { code?: string };
        if (error?.code === "P2002") {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;
    console.log(`[item DELETE] Request to delete item: ${id}`);
    
    try {
        // 1. Fetch images associated with this item first (before DB records are deleted by cascade)
        const images = await listByItemId(id).catch((err) => {
            console.warn(`[item DELETE] Failed to fetch images for item ${id}:`, err);
            return [];
        });
        
        // 2. Perform database deletion
        await deleteItem(id);
        console.log(`[item DELETE] DB deletion successful for item ${id}`);

        // 3. Clean up physical files from storage provider
        if (images && images.length > 0) {
            console.log(`[item DELETE] Starting cleanup for ${images.length} images...`);
            for (const img of images) {
                try {
                    await storage.delete(img.key);
                    console.log(`[item DELETE] Cleaned up storage file for key: ${img.key}`);
                } catch (storageErr) {
                    console.warn(`[item DELETE] Non-fatal error cleaning up image from storage (key: ${img.key}):`, storageErr);
                }
            }
        }
        
        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error(`[item DELETE] Critical error deleting item ${id}:`, error);
        
        // Check if foreign key constraint failed (e.g. Prisma code P2003)
        const isForeignKeyError = error?.code === "P2003" || 
            (error instanceof Error && error.message.includes("Foreign key constraint"));
            
        if (isForeignKeyError) {
            return NextResponse.json(
                { error: "Dieses Produkt ist bereits in Anfragen/Buchungen enthalten und kann nicht gelöscht werden. Bitte deaktivieren statt löschen." },
                { status: 409 }
            );
        }
        
        const message = error instanceof Error ? error.message : "Löschen fehlgeschlagen.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
