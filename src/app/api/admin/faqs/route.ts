import { NextRequest, NextResponse } from "next/server";
import { listFaqs, createFaq } from "@/lib/repositories/faqs";

export async function GET() {
    try {
        const faqs = await listFaqs();
        return NextResponse.json({ faqs });
    } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        return new NextResponse(String(err), { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.question || !body.answer) {
            return new NextResponse("Question and answer required", { status: 400 });
        }

        const newFaq = await createFaq({
            question: body.question,
            answer: body.answer,
            published: body.published,
        });

        return NextResponse.json({ faq: newFaq });
    } catch (err) {
        if (err instanceof Error && err.message === "Unauthorized") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        return new NextResponse(String(err), { status: 500 });
    }
}
