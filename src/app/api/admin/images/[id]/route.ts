import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import storage from "@/lib/storage";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // 1. Bild aus DB holen um Dateipfad zu kennen
        const image = await db.globalImage.findUnique({ where: { id } });
        if (!image) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

        // 2. Aus der Datenbank löschen
        await db.globalImage.delete({ where: { id } });

        // 3. Von der Festplatte löschen (verhindert Datenmüll)
        await storage.delete(image.key).catch(e => console.warn("Festplatten-Löschen fehlgeschlagen:", e));

        // 4. Cache leeren
        revalidatePath("/admin/images");
        revalidatePath("/"); // Leert den Cache der Homepage, falls das Bild im Carousel war

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const contentType = req.headers.get("content-type") || "";

        // FALL 1: Ein neues Bild wurde hochgeladen (FormData)
        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File;

            let url, key;
            if (file) {
                // Altes Bild löschen, um Platz zu sparen
                const alterEintrag = await db.globalImage.findUnique({ where: { id } });
                if (alterEintrag) {
                    await storage.delete(alterEintrag.key).catch(() => { });
                }

                // Neues Bild speichern
                const saved = await storage.save(file);
                url = saved.url;
                key = saved.key;
            }

            const dataToUpdate = {
                alt: formData.get("alt") as string,
                area: formData.get("area") as any,
                published: formData.get("published") === "true",
                sortOrder: Number(formData.get("sortOrder") || 0),
                ...(url && key ? { url, key } : {}) // URL/Key nur updaten, wenn ein Bild da war
            };

            await db.globalImage.update({ where: { id }, data: dataToUpdate });

        } else {
            // FALL 2: Nur Text-Daten wurden geändert (JSON)
            const body = await req.json();
            await db.globalImage.update({
                where: { id },
                data: {
                    alt: body.alt,
                    area: body.area,
                    published: body.published,
                    sortOrder: Number(body.sortOrder),
                }
            });
        }

        // Cache überall leeren
        revalidatePath("/admin/images");
        revalidatePath("/");

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}