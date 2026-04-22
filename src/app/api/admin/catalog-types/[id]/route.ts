import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteCatalogType, getCatalogTypeById, updateCatalogType } from "@/lib/repositories/catalog-types";

function parseSortOrder(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === "") return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : Number.NaN;
}

function parseBoolean(value: FormDataEntryValue | boolean | null | undefined, fallback = true) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        if (value === "true") return true;
        if (value === "false") return false;
    }
    return fallback;
}

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;
    const catalogType = await getCatalogTypeById(id);

    if (!catalogType) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ catalogType });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        const existing = await getCatalogTypeById(id);

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const contentType = req.headers.get("content-type") ?? "";

        let name = existing.name;
        let slug = existing.slug;
        let description: string | null = existing.description ?? null;
        let navLabel: string | null = existing.navLabel ?? null;
        let showInNav = existing.showInNav;
        let isDefault = existing.isDefault;
        let sortOrder = existing.sortOrder;
        let isActive = existing.isActive;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            name = ((formData.get("name") as string | null) ?? existing.name).trim();
            slug = ((formData.get("slug") as string | null) ?? existing.slug).trim();
            description = ((formData.get("description") as string | null) ?? "").trim() || null;
            navLabel = ((formData.get("navLabel") as string | null) ?? "").trim() || null;
            showInNav = parseBoolean(formData.get("showInNav"), existing.showInNav);
            isDefault = parseBoolean(formData.get("isDefault"), existing.isDefault);
            sortOrder = parseSortOrder((formData.get("sortOrder") as string | null) ?? existing.sortOrder);
            isActive = parseBoolean(formData.get("isActive"), existing.isActive);
        } else {
            const body = (await req.json().catch(() => null)) as null | {
                name?: string;
                slug?: string;
                description?: string | null;
                navLabel?: string | null;
                showInNav?: boolean;
                isDefault?: boolean;
                sortOrder?: number | string | null;
                isActive?: boolean;
            };

            name = (body?.name ?? existing.name).trim();
            slug = (body?.slug ?? existing.slug).trim();
            if (body && "description" in body) {
                description = (body.description ?? "").trim() || null;
            }
            if (body && "navLabel" in body) {
                navLabel = (body.navLabel ?? "").trim() || null;
            }
            if (body && "showInNav" in body) {
                showInNav = parseBoolean(body.showInNav, existing.showInNav);
            }
            if (body && "isDefault" in body) {
                isDefault = parseBoolean(body.isDefault, existing.isDefault);
            }
            if (body && "sortOrder" in body) {
                sortOrder = parseSortOrder(body.sortOrder);
            }
            if (body && "isActive" in body) {
                isActive = parseBoolean(body.isActive, existing.isActive);
            }
        }

        if (!name || !slug) {
            return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
        }

        if (!Number.isFinite(sortOrder)) {
            return NextResponse.json({ error: "sortOrder must be a valid number" }, { status: 400 });
        }

        const catalogType = await updateCatalogType(id, {
            name,
            slug,
            description,
            navLabel,
            showInNav,
            isDefault,
            sortOrder,
            isActive,
        });

        revalidatePath("/", "layout");

        return NextResponse.json({ catalogType });
    } catch (err) {
        const error = err as { code?: string };
        if (error?.code === "P2002") {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }

        console.error("[catalog-types PATCH] error:", err);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        await deleteCatalogType(id);
        revalidatePath("/", "layout");
        return NextResponse.json({ ok: true });
    } catch (err) {
        const error = err as { code?: string };
        if (error?.code === "P2003") {
            return NextResponse.json(
                { error: "Catalog type is still assigned to categories. Reassign or deactivate it first." },
                { status: 409 }
            );
        }

        console.error("[catalog-types DELETE] error:", err);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
