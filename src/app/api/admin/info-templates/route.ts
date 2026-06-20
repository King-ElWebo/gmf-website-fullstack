import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const infoTemplateSchema = z.object({
    internalName: z.string().min(1, "Name ist erforderlich"),
    title: z.string().min(1, "Titel ist erforderlich"),
    isActive: z.boolean().default(true),
    blocks: z.array(
        z.object({
            id: z.string().optional(),
            highlightLabel: z.string(),
            heading: z.string(),
            body: z.string(),
            sortOrder: z.number(),
            isActive: z.boolean().default(true),
        })
    ).max(4, "Maximal 4 Blöcke erlaubt"),
});

export async function GET() {
    try {
        const templates = await db.infoTemplate.findMany({
            orderBy: { internalName: "asc" },
            include: {
                _count: {
                    select: { items: true },
                },
            },
        });
        return NextResponse.json({ templates });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const data = infoTemplateSchema.parse(json);

        const template = await db.infoTemplate.create({
            data: {
                internalName: data.internalName,
                title: data.title,
                isActive: data.isActive,
                blocks: {
                    create: data.blocks.map((block) => ({
                        highlightLabel: block.highlightLabel,
                        heading: block.heading,
                        body: block.body,
                        sortOrder: block.sortOrder,
                        isActive: block.isActive,
                    })),
                },
            },
        });

        return NextResponse.json({ template }, { status: 201 });
    } catch (e: any) {
        console.error("POST /api/admin/info-templates", e);
        return NextResponse.json(
            { error: e.errors ? e.errors[0].message : e.message },
            { status: 400 }
        );
    }
}
