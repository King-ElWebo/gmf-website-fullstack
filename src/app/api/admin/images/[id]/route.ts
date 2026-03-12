import { NextRequest, NextResponse } from "next/server";
import { getGlobalImageById, updateGlobalImage, deleteGlobalImage } from "@/lib/repositories/global-images";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const image = await getGlobalImageById(id);
        if (!image) return new NextResponse("Not Found", { status: 404 });

        return NextResponse.json({ image });
    } catch (err) {
        return new NextResponse(String(err), { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updated = await updateGlobalImage(id, {
            alt: body.alt,
            area: body.area,
            published: body.published,
            sortOrder: body.sortOrder,
        });

        return NextResponse.json({ image: updated });
    } catch (err) {
        return new NextResponse(String(err), { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        await deleteGlobalImage(id);
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        return new NextResponse(String(err), { status: 500 });
    }
}
