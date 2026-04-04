import { NextResponse } from "next/server";
import { deleteItem, getItemById, updateItem } from "@/lib/repositories/items";
import { parseAdminItemPayload } from "@/lib/items/admin-item-payload";

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
    try {
        const { id } = await ctx.params;
        await deleteItem(id);
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
