import { NextRequest, NextResponse } from "next/server";
import { createCatalogType, listCatalogTypes } from "@/lib/repositories/catalog-types";

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

export async function GET(req: NextRequest) {
    const activeOnly = req.nextUrl.searchParams.get("activeOnly") === "true";
    const catalogTypes = await listCatalogTypes({ activeOnly });
    return NextResponse.json({ catalogTypes });
}

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") ?? "";

        let name = "";
        let slug = "";
        let description: string | null = null;
        let sortOrder = 0;
        let isActive = true;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            name = ((formData.get("name") as string | null) ?? "").trim();
            slug = ((formData.get("slug") as string | null) ?? "").trim();
            description = ((formData.get("description") as string | null) ?? "").trim() || null;
            sortOrder = parseSortOrder(formData.get("sortOrder") as string | null);
            isActive = parseBoolean(formData.get("isActive"), true);
        } else {
            const body = (await req.json().catch(() => null)) as null | {
                name?: string;
                slug?: string;
                description?: string | null;
                sortOrder?: number | string | null;
                isActive?: boolean;
            };
            name = (body?.name ?? "").trim();
            slug = (body?.slug ?? "").trim();
            description = (body?.description ?? "").trim() || null;
            sortOrder = parseSortOrder(body?.sortOrder);
            isActive = parseBoolean(body?.isActive, true);
        }

        if (!name || !slug) {
            return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
        }

        if (!Number.isFinite(sortOrder)) {
            return NextResponse.json({ error: "sortOrder must be a valid number" }, { status: 400 });
        }

        const catalogType = await createCatalogType({
            name,
            slug,
            description,
            sortOrder,
            isActive,
        });

        return NextResponse.json({ catalogType }, { status: 201 });
    } catch (err) {
        const error = err as { code?: string };
        if (error?.code === "P2002") {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }

        console.error("[catalog-types POST] error:", err);
        return NextResponse.json({ error: "Create failed" }, { status: 500 });
    }
}
