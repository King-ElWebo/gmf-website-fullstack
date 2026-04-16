import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { DisplayArea } from "@/lib/display-area";
import { getGlobalImageById, listGlobalImages, updateGlobalImage, deleteGlobalImage } from "@/lib/repositories/global-images";
import storage from "@/lib/storage";

export const runtime = "nodejs";

function parseArea(value: string | null | undefined) {
    if (value && Object.values(DisplayArea).includes(value as DisplayArea)) {
        return value as DisplayArea;
    }

    return undefined;
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        await deleteGlobalImage(id);

        revalidatePath("/admin/images");
        revalidatePath("/");

        const images = await listGlobalImages();
        return NextResponse.json({ ok: true, images });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Delete failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const existing = await getGlobalImageById(id);
        if (!existing) {
            return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
        }

        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file");
            const alt = (formData.get("alt") as string | null) ?? "";
            const area = parseArea(formData.get("area") as string | null) ?? existing.area;
            const published = formData.get("published") === "true";

            let nextUrl = existing.url;
            let nextKey = existing.key;

            if (file instanceof File && file.size > 0) {
                await storage.delete(existing.key).catch(() => undefined);
                const saved = await storage.save(file);
                nextUrl = saved.url;
                nextKey = saved.key;
            }

            await updateGlobalImage(id, {
                alt,
                area,
                published,
                url: nextUrl,
                key: nextKey,
            });
        } else {
            const body = (await req.json().catch(() => null)) as null | {
                alt?: string;
                area?: string;
                published?: boolean;
            };

            await updateGlobalImage(id, {
                alt: body?.alt ?? existing.alt ?? "",
                area: parseArea(body?.area) ?? existing.area,
                published: typeof body?.published === "boolean" ? body.published : existing.published,
            });
        }

        revalidatePath("/admin/images");
        revalidatePath("/");

        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Update failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
