import { NextResponse } from "next/server";
import { deleteImage } from "@/lib/repositories/item-images";
import storage from "@/lib/storage";

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string; imageId: string }> }
) {
    const { imageId } = await params;

    try {
        const row = await deleteImage(imageId);
        // Remove file from storage (non-fatal if it fails)
        await storage.delete(row.key).catch((e) =>
            console.warn("[image DELETE] storage.delete failed:", e)
        );
        return NextResponse.json({ ok: true });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Delete failed";
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
