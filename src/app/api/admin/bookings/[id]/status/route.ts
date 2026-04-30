import { NextResponse } from "next/server";
import { createAdminBookingCommands } from "@/lib/booking-core/server";

const adminCommands = createAdminBookingCommands();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = (await req.json().catch(() => ({}))) as {
      status?: string;
      reasonDetails?: string;
    };

    if (!body.status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }

    if (body.status === "approved") {
      await adminCommands.approveBooking(resolvedParams.id, "system-admin");
    } else if (body.status === "rejected") {
      await adminCommands.rejectBooking(resolvedParams.id, body.reasonDetails || "No reason provided", "system-admin");
    } else if (body.status === "cancelled") {
      await adminCommands.cancelBooking(resolvedParams.id, body.reasonDetails || "No reason provided", "system-admin");
    } else if (body.status === "expired") {
      await adminCommands.expireBooking(resolvedParams.id, "system-admin");
    } else {
      return NextResponse.json(
        { error: `Unsupported status transition: ${body.status}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: `Status updated to ${body.status}` });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Status update failed" },
      { status: 400 }
    );
  }
}
