import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const resources = await db.resource.findMany({ orderBy: { name: 'asc' } });
        return NextResponse.json(resources);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, capacityPerDay, isActive } = body;

        if (!name || typeof name !== "string") {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        if (typeof capacityPerDay !== "number" || capacityPerDay < 1) {
            return NextResponse.json({ error: "Capacity per day must be at least 1" }, { status: 400 });
        }

        const resource = await db.resource.create({
            data: {
                name: name.trim(),
                capacityPerDay,
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json({ resource }, { status: 201 });
    } catch (e: any) {
        console.error("Failed to create resource", e);
        return NextResponse.json({ error: "Create failed" }, { status: 500 });
    }
}
