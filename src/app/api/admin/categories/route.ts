import { NextResponse } from "next/server";
import { createCategory, listCategories } from "@/lib/repositories/categories";

export async function GET() {
    const categories = await listCategories();
    return NextResponse.json({ categories });
}

export async function POST(req: Request) {
    const body = (await req.json().catch(() => null)) as null | {
        name?: string;
        slug?: string;
    };

    const name = (body?.name ?? "").trim();
    const slug = (body?.slug ?? "").trim();

    if (!name || !slug) {
        return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
    }

    const created = await createCategory({ name, slug });
    return NextResponse.json({ category: created }, { status: 201 });
}