import { NextResponse } from "next/server";
import { resyncBooking } from "@/lib/calendar/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await resyncBooking(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[API Sync] Failed for ${error}`);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
