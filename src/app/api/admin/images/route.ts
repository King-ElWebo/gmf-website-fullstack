import { NextRequest, NextResponse } from "next/server";
import { listGlobalImages, createGlobalImage } from "@/lib/repositories/global-images";
import { DisplayArea } from "@/lib/display-area";
import storage from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const areaParam = searchParams.get("area");
        const publishedParam = searchParams.get("published");

        let filterArea: DisplayArea | undefined;
        if (areaParam && Object.values(DisplayArea).includes(areaParam as DisplayArea)) {
            filterArea = areaParam as DisplayArea;
        }

        const filterPublished =
            publishedParam === "true" ? true : publishedParam === "false" ? false : undefined;

        const images = await listGlobalImages({
            area: filterArea,
            published: filterPublished,
        });
        return NextResponse.json({ images });
    } catch (err) {
        return new NextResponse(String(err), { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch (e) {
            console.error("[global-images POST] formData parse error:", e);
            return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
        }

        const areaRaw = formData.get("area") as string | null;
        let area: DisplayArea = DisplayArea.OTHER;
        if (areaRaw && Object.values(DisplayArea).includes(areaRaw as DisplayArea)) {
            area = areaRaw as DisplayArea;
        }

        const alt = formData.get("alt") as string | null;
        const publishedRaw = formData.get("published") as string | null;
        const published = publishedRaw !== "false";

        const entries = formData.getAll("files");
        const files = entries.filter((e): e is File => e instanceof File && e.size > 0);

        if (!files.length) {
            return NextResponse.json({ error: "No valid files provided" }, { status: 400 });
        }

        const savedImages = [];
        for (const file of files) {
            const { url, key } = await storage.save(file);
            const image = await createGlobalImage(url, key, area, alt ?? undefined, published);
            savedImages.push(image);
        }

        return NextResponse.json({ images: savedImages }, { status: 201 });
    } catch (err) {
        console.error("[global-images POST] save/db error:", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
