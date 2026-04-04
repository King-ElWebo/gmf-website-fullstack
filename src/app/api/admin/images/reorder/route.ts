import { NextResponse } from "next/server";
import { reorderGlobalImages } from "@/lib/repositories/global-images";

export async function PATCH(req: Request) {
    const body = (await req.json().catch(() => null)) as {
        orderedIds?: string[];
    } | null;

    if (!Array.isArray(body?.orderedIds)) {
        return NextResponse.json({ error: "orderedIds must be an array of strings" }, { status: 400 });
    }

    try {
        const images = await reorderGlobalImages(body.orderedIds);
        return NextResponse.json({ images });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Reorder failed";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
