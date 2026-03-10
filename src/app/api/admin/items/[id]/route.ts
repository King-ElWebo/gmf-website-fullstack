import { NextResponse } from "next/server";
import { deleteItem, getItemById, updateItem } from "@/lib/repositories/items";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;
    const item = await getItemById(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    const body = (await req.json().catch(() => null)) as {
        title?: string;
        slug?: string;
        description?: string;
        categoryId?: string;
        published?: boolean;
        priceCents?: number | string | null;
    } | null;

    const title = (body?.title ?? "").trim();
    const slug = (body?.slug ?? "").trim();
    const description = (body?.description ?? "").trim() || null;

    const categoryId = (body?.categoryId ?? "").trim();
    const published = Boolean(body?.published);

    const priceCentsRaw = body?.priceCents;
    const priceCents =
        priceCentsRaw === "" || priceCentsRaw === null || priceCentsRaw === undefined
            ? null
            : Number(priceCentsRaw);

    if (!title || !slug || !categoryId) {
        return NextResponse.json({ error: "title, slug, categoryId are required" }, { status: 400 });
    }

    if (priceCents !== null && (!Number.isFinite(priceCents) || priceCents < 0)) {
        return NextResponse.json({ error: "priceCents must be a positive number" }, { status: 400 });
    }

    try {
        const { id } = await ctx.params;
        const updated = await updateItem(id, {
            title,
            slug,
            description,
            priceCents: priceCents === null ? null : Math.round(priceCents),
            published,
            categoryId,
        });

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