import { NextResponse } from 'next/server';
import { createAdminBookingCommands } from '@/lib/booking-core/server';

const adminCommands = createAdminBookingCommands();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = (await req.json().catch(() => ({}))) as { reasonDetails?: string };
    const adminId = 'system-admin';

    await adminCommands.archiveBooking(id, body.reasonDetails || "Kein Grund angegeben", adminId);

    return NextResponse.json({ success: true, message: 'Booking archived successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Archiving failed' }, { status: 400 });
  }
}
