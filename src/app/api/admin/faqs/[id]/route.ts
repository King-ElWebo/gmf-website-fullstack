import { NextRequest, NextResponse } from "next/server";
import { getFaqById, updateFaq, deleteFaq } from "@/lib/repositories/faqs";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const faq = await getFaqById(id);
        if (!faq) return new NextResponse("Not Found", { status: 404 });

        return NextResponse.json({ faq });
    } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
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

        const updated = await updateFaq(id, {
            question: body.question,
            answer: body.answer,
            published: body.published,
        });

        return NextResponse.json({ faq: updated });
    } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        return new NextResponse(String(err), { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        await deleteFaq(id);
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        return new NextResponse(String(err), { status: 500 });
    }
}
