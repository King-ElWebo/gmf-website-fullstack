import { NextRequest, NextResponse } from "next/server";
import { addImages, listByItemId } from "@/lib/repositories/item-images";
import storage from "@/lib/storage";

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

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch (e) {
        console.error("[images POST] formData parse error:", e);
        return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const entries = formData.getAll("files");
    const files = entries.filter((e): e is File => e instanceof File && e.size > 0);

    if (!files.length) {
        console.error("[images POST] No valid files in formData. Keys:", [...formData.keys()]);
        return NextResponse.json({ error: "No files provided" }, { status: 400 });
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

