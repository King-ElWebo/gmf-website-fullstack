import { NextRequest, NextResponse } from "next/server";
import { addImages, listByItemId } from "@/lib/repositories/item-images";
import storage from "@/lib/storage";
import { ITEM_UPLOAD_MAX_BATCH_BYTES, validateItemUploadFiles } from "@/lib/uploads/item-upload-limits";

// Required for fs writes (local storage) and proper multipart/form-data handling
export const runtime = "nodejs";

// Raise the body size limit so large video files can be uploaded (default is 4.5 MB)
export const maxDuration = 60; // seconds, for Vercel – ignored locally

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const images = await listByItemId(id);
    return NextResponse.json({ images });
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const contentLength = req.headers.get("content-length");
    if (contentLength && Number.isFinite(Number(contentLength))) {
        const requestSize = Number(contentLength);
        if (requestSize > ITEM_UPLOAD_MAX_BATCH_BYTES + 1024 * 1024) {
            return NextResponse.json(
                {
                    error: `Upload ist zu groß. Bitte maximal ${Math.round(ITEM_UPLOAD_MAX_BATCH_BYTES / (1024 * 1024))} MB pro Upload senden.`,
                },
                { status: 413 }
            );
        }
    }

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch (e) {
        console.error("[images POST] formData parse error:", e);
        return NextResponse.json(
            {
                error: "Upload konnte nicht verarbeitet werden. Bitte Dateigröße reduzieren und erneut versuchen.",
            },
            { status: 400 }
        );
    }

    const entries = formData.getAll("files");
    const files = entries.filter((e): e is File => e instanceof File && e.size > 0);

    if (!files.length) {
        console.error("[images POST] No valid files in formData. Keys:", [...formData.keys()]);
        return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const validation = validateItemUploadFiles(files.map((file) => ({ name: file.name, size: file.size })));
    if (!validation.ok) {
        return NextResponse.json({ error: validation.message, code: validation.code }, { status: validation.status });
    }

    try {
        const saved = await Promise.all(
            files.map(async (file) => {
                const { url, key } = await storage.save(file);
                const type = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
                return { url, key, type: type as "VIDEO" | "IMAGE" };
            })
        );

        const images = await addImages(id, saved);
        return NextResponse.json({ images }, { status: 201 });
    } catch (e) {
        console.error("[images POST] save/db error:", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

