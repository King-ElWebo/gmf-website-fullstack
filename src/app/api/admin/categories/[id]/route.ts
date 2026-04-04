import { NextRequest, NextResponse } from "next/server";
import { deleteCategory, getCategoryById, updateCategory } from "@/lib/repositories/categories";
import { getCatalogTypeById } from "@/lib/repositories/catalog-types";
import storage from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;
    const category = await getCategoryById(id);
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ category });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;

        const existing = await getCategoryById(id);
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const contentType = req.headers.get("content-type") ?? "";

        let name = "";
        let slug = "";
        let description: string | null = existing.description ?? null;
        let imageUrl: string | null = existing.imageUrl ?? null;
        let imageKey: string | null = existing.imageKey ?? null;
        let catalogTypeId = existing.catalogTypeId;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            name = ((formData.get("name") as string | null) ?? "").trim();
            slug = ((formData.get("slug") as string | null) ?? "").trim();
            catalogTypeId = ((formData.get("catalogTypeId") as string | null) ?? existing.catalogTypeId).trim();

            const descRaw = formData.get("description") as string | null;
            description = descRaw !== null ? descRaw || null : existing.description ?? null;

            // Handle image removal
            const removeImage = formData.get("removeImage") === "true";
            if (removeImage && existing.imageKey) {
                await storage.delete(existing.imageKey).catch(() => {});
                imageUrl = null;
                imageKey = null;
            }

            // Handle new image upload
            const file = formData.get("image");
            if (file instanceof File && file.size > 0) {
                // Delete old image if present
                if (existing.imageKey) {
                    await storage.delete(existing.imageKey).catch(() => {});
                }
                const saved = await storage.save(file);
                imageUrl = saved.url;
                imageKey = saved.key;
            }
        } else {
            const body = (await req.json().catch(() => null)) as null | {
                name?: string;
                slug?: string;
                description?: string | null;
                catalogTypeId?: string;
            };
            name = (body?.name ?? "").trim();
            slug = (body?.slug ?? "").trim();
            if (body && "description" in body) {
                description = body.description ?? null;
            }
            if (body?.catalogTypeId !== undefined) {
                catalogTypeId = body.catalogTypeId.trim();
            }
        }

        if (!name || !slug || !catalogTypeId) {
            return NextResponse.json({ error: "name, slug and catalogTypeId are required" }, { status: 400 });
        }

        const catalogType = await getCatalogTypeById(catalogTypeId);
        if (!catalogType) {
            return NextResponse.json({ error: "Catalog type not found" }, { status: 400 });
        }

        if (!catalogType.isActive && catalogTypeId !== existing.catalogTypeId) {
            return NextResponse.json({ error: "Inactive catalog types cannot be assigned" }, { status: 400 });
        }

        const updated = await updateCategory(id, { name, slug, description, imageUrl, imageKey, catalogTypeId });
        return NextResponse.json({ category: updated });
    } catch (err) {
        const error = err as { code?: string };
        if (error?.code === "P2002") {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }
        console.error("[categories PATCH] error:", err);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;

        // Remove associated image from storage if present
        const existing = await getCategoryById(id);
        if (existing?.imageKey) {
            await storage.delete(existing.imageKey).catch(() => {});
        }

        await deleteCategory(id);
        return NextResponse.json({ ok: true });
    } catch (error) {
        const e = error as { code?: string };
        if (e?.code === "P2003") {
            return NextResponse.json({ error: "Category has items. Delete items first." }, { status: 409 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
