import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ items: {} });
    }

    const items = await db.item.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        deliveryAvailable: true,
        pickupAvailable: true,
      },
    });

    const itemsMap: Record<string, { deliveryAvailable: boolean; pickupAvailable: boolean }> = {};
    for (const item of items) {
      itemsMap[item.id] = {
        deliveryAvailable: item.deliveryAvailable,
        pickupAvailable: item.pickupAvailable,
      };
    }

    return NextResponse.json({ items: itemsMap });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync cart items" },
      { status: 500 }
    );
  }
}
