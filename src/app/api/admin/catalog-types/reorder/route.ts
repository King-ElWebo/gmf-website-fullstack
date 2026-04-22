import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { reorderCatalogTypes } from "@/lib/repositories/catalog-types";

export async function PATCH(req: NextRequest) {
    try {
        const body = (await req.json().catch(() => null)) as null | {
            orderedIds?: string[];
        };

        if (!body?.orderedIds || !Array.isArray(body.orderedIds)) {
            return NextResponse.json({ error: "Invalid orderedIds" }, { status: 400 });
        }

        const catalogTypes = await reorderCatalogTypes(body.orderedIds);

        revalidatePath("/", "layout");

        return NextResponse.json({ catalogTypes });
    } catch (err) {
        console.error("[catalog-types reorder PATCH] error:", err);
        return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
    }
}
