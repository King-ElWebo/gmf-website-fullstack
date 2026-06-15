import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, capacityPerDay, isActive } = body;

        const updateData: any = {};
        if (name && typeof name === "string") updateData.name = name.trim();
        if (typeof capacityPerDay === "number" && capacityPerDay >= 1) updateData.capacityPerDay = capacityPerDay;
        if (typeof isActive === "boolean") updateData.isActive = isActive;

        const resource = await db.resource.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ resource });
    } catch (e: any) {
        console.error("Failed to update resource", e);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.resource.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Failed to delete resource", e);
        // Prisma foreign key constraint check
        if (e.code === 'P2003') {
            return NextResponse.json({ error: "Cannot delete resource because it is being used by an item." }, { status: 400 });
        }
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
