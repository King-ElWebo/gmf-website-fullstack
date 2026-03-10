import { NextResponse } from "next/server";
import { createItem, listItems } from "@/lib/repositories/items";

export async function GET() {
    const items = await listItems();
    return NextResponse.json({ items });
}

export async function POST(req: Request) {
    const body = (await req.json().catch(() => null)) as any;

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
        const created = await createItem({
            title,
            slug,
            description,
            priceCents: priceCents === null ? null : Math.round(priceCents),
            published,
            categoryId,
        });

        return NextResponse.json({ item: created }, { status: 201 });
    } catch (e: any) {
        // Prisma unique constraint
        if (e?.code === "P2002") {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Create failed" }, { status: 500 });
    }
}