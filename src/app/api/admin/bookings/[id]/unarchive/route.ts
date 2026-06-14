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
    const adminId = 'system-admin';

    await adminCommands.unarchiveBooking(id, adminId);

    return NextResponse.json({ success: true, message: 'Booking unarchived successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unarchiving failed' }, { status: 400 });
  }
}
