import { NextResponse } from "next/server";
import { reorder } from "@/lib/repositories/item-images";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const body = (await req.json().catch(() => null)) as {
        orderedIds?: string[];
    } | null;

    if (!Array.isArray(body?.orderedIds)) {
        return NextResponse.json(
            { error: "orderedIds must be an array of strings" },
            { status: 400 }
        );
    }

    try {
        const images = await reorder(id, body!.orderedIds);
        return NextResponse.json({ images });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Reorder failed";
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
