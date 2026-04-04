import { NextResponse } from "next/server";
import { createItem, listItems } from "@/lib/repositories/items";
import { parseAdminItemPayload } from "@/lib/items/admin-item-payload";

export async function GET() {
    const items = await listItems();
    return NextResponse.json({ items });
}

export async function POST(req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await req.json().catch(() => null)) as Record<string, any> | null;
    const parsed = parseAdminItemPayload(body);
    if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }

    try {
        const created = await createItem(parsed.data);

        return NextResponse.json({ item: created }, { status: 201 });
    } catch (e: unknown) {
        const error = e as { code?: string };
        // Prisma unique constraint
        if (error?.code === "P2002") {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Create failed" }, { status: 500 });
    }
}
