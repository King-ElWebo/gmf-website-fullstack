import { NextResponse } from "next/server";
import { reorderFaqs } from "@/lib/repositories/faqs";

export async function PATCH(req: Request) {
    const body = (await req.json().catch(() => null)) as {
        orderedIds?: string[];
    } | null;

    if (!Array.isArray(body?.orderedIds)) {
        return NextResponse.json({ error: "orderedIds must be an array of strings" }, { status: 400 });
    }

    try {
        const faqs = await reorderFaqs(body.orderedIds);
        return NextResponse.json({ faqs });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Reorder failed";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
