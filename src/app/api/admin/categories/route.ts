import { NextRequest, NextResponse } from "next/server";
import { createCategory, listCategories } from "@/lib/repositories/categories";
import { getCatalogTypeById } from "@/lib/repositories/catalog-types";
import storage from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const catalogTypeId = searchParams.get("catalogTypeId")?.trim() || undefined;
    const catalogTypeSlug = searchParams.get("catalogTypeSlug")?.trim() || undefined;
    const activeCatalogTypesOnly = searchParams.get("activeCatalogTypesOnly") === "true";

    const categories = await listCategories({
        catalogTypeId,
        catalogTypeSlug,
        activeCatalogTypesOnly,
    });

    return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") ?? "";

        let name = "";
        let slug = "";
        let description: string | null = null;
        let imageUrl: string | null = null;
        let imageKey: string | null = null;
        let catalogTypeId = "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            name = ((formData.get("name") as string | null) ?? "").trim();
            slug = ((formData.get("slug") as string | null) ?? "").trim();
            description = (formData.get("description") as string | null) || null;
            catalogTypeId = ((formData.get("catalogTypeId") as string | null) ?? "").trim();

            const file = formData.get("image");
            if (file instanceof File && file.size > 0) {
                const saved = await storage.save(file);
                imageUrl = saved.url;
                imageKey = saved.key;
            }
        } else {
            const body = (await req.json().catch(() => null)) as null | {
                name?: string;
                slug?: string;
                description?: string;
                catalogTypeId?: string;
            };
            name = (body?.name ?? "").trim();
            slug = (body?.slug ?? "").trim();
            description = body?.description ?? null;
            catalogTypeId = (body?.catalogTypeId ?? "").trim();
        }

        if (!name || !slug || !catalogTypeId) {
            return NextResponse.json({ error: "name, slug and catalogTypeId are required" }, { status: 400 });
        }

        const catalogType = await getCatalogTypeById(catalogTypeId);
        if (!catalogType) {
            return NextResponse.json({ error: "Catalog type not found" }, { status: 400 });
        }

        if (!catalogType.isActive) {
            return NextResponse.json({ error: "Inactive catalog types cannot be assigned" }, { status: 400 });
        }

        const created = await createCategory({ name, slug, description, imageUrl, imageKey, catalogTypeId });
        return NextResponse.json({ category: created }, { status: 201 });
    } catch (err) {
        const error = err as { code?: string };
        if (error?.code === "P2002") {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }
        console.error("[categories POST] error:", err);
        return NextResponse.json({ error: "Create failed" }, { status: 500 });
    }
}
