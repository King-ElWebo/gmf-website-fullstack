import { NextResponse } from "next/server";
import { setCover } from "@/lib/repositories/item-images";

export async function PATCH(
    _req: Request,
    { params }: { params: Promise<{ id: string; imageId: string }> }
) {
    const { id, imageId } = await params;

    try {
        const images = await setCover(id, imageId);
        return NextResponse.json({ images });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Set cover failed";
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
