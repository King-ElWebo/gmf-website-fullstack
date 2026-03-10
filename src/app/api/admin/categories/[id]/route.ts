import { NextResponse } from "next/server";
import { deleteCategory, getCategoryById, updateCategory } from "@/lib/repositories/categories";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;
    const category = await getCategoryById(id);
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ category });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    const body = (await req.json().catch(() => null)) as null | {
        name?: string;
        slug?: string;
    };

    const name = (body?.name ?? "").trim();
    const slug = (body?.slug ?? "").trim();

    if (!name || !slug) {
        return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
    }

    const { id } = await ctx.params;
    const updated = await updateCategory(id, { name, slug });
    return NextResponse.json({ category: updated });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        await deleteCategory(id);
        return NextResponse.json({ ok: true });
    } catch (error) {
        const e = error as { code?: string };
        // Foreign key constraint (Category hat Items)
        if (e?.code === "P2003") {
            return NextResponse.json({ error: "Category has items. Delete items first." }, { status: 409 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}