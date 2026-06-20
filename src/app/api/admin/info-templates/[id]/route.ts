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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const template = await db.infoTemplate.findUnique({
            where: { id },
            include: { blocks: { orderBy: { sortOrder: "asc" } } },
        });

        if (!template) {
            return NextResponse.json({ error: "Template nicht gefunden" }, { status: 404 });
        }

        return NextResponse.json({ template });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const json = await req.json();
        const data = infoTemplateSchema.parse(json);

        // We delete all existing blocks and recreate them to handle updates cleanly
        await db.infoTemplateBlock.deleteMany({
            where: { infoTemplateId: id },
        });

        const template = await db.infoTemplate.update({
            where: { id },
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
            include: { blocks: { orderBy: { sortOrder: "asc" } } },
        });

        return NextResponse.json({ template });
    } catch (e: any) {
        console.error("PATCH /api/admin/info-templates/[id]", e);
        return NextResponse.json(
            { error: e.errors ? e.errors[0].message : e.message },
            { status: 400 }
        );
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.infoTemplate.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (e: any) {
        console.error("DELETE /api/admin/info-templates/[id]", e);
        return NextResponse.json(
            { error: "Löschen fehlgeschlagen. Wird die Vorlage noch verwendet?" },
            { status: 400 }
        );
    }
}
