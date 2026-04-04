import { NextResponse } from 'next/server';
import { PrismaBookingRepository } from '@/lib/booking-core/infrastructure/database/PrismaBookingRepository';

const bookingRepo = new PrismaBookingRepository();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { status } = await req.json();
    if (!status) return NextResponse.json({ error: 'Status required' }, { status: 400 });
    
    // Manuelles Status Update (Fallback)
    await bookingRepo.updateStatus(resolvedParams.id, status as any);
    await bookingRepo.addNote(resolvedParams.id, `Manual status override to ${status}`, 'system-admin');
    
    return NextResponse.json({ success: true, message: `Status updated to ${status}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
