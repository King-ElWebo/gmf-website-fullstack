import { NextResponse } from "next/server";
import { reorderCategories } from "@/lib/repositories/categories";

export async function PATCH(req: Request) {
    const body = (await req.json().catch(() => null)) as {
        orderedIds?: string[];
    } | null;

    if (!Array.isArray(body?.orderedIds)) {
        return NextResponse.json({ error: "orderedIds must be an array of strings" }, { status: 400 });
    }

    try {
        const categories = await reorderCategories(body.orderedIds);
        return NextResponse.json({ categories });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Reorder failed";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
