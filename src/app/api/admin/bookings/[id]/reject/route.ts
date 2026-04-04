import { NextResponse } from 'next/server';
import { createAdminBookingCommands } from '@/lib/booking-core/server';

const adminCommands = createAdminBookingCommands();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json().catch(() => ({}));
    const reasonDetails = body.reasonDetails || 'No reason provided';
    
    await adminCommands.rejectBooking(resolvedParams.id, reasonDetails, 'system-admin');
    return NextResponse.json({ success: true, message: 'Booking rejected successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Rejection failed' }, { status: 400 });
  }
}
