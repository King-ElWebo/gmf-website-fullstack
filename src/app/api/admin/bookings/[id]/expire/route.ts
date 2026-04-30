import { NextResponse } from "next/server";
import { createAdminBookingCommands } from "@/lib/booking-core/server";

const adminCommands = createAdminBookingCommands();

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await adminCommands.expireBooking(resolvedParams.id, "system-admin");
    return NextResponse.json({ success: true, message: "Booking expired successfully" });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Expiring booking failed" },
      { status: 400 }
    );
  }
}
