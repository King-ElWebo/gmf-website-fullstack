import { NextResponse } from 'next/server';
import { PrismaBookingRepository } from '@/lib/booking-core/infrastructure/database/PrismaBookingRepository';

const bookingRepo = new PrismaBookingRepository();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const booking = await bookingRepo.findById(resolvedParams.id);
    
    if (!booking) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Mapping auf AdminBookingDetail
    const detail = {
      id: booking.id,
      referenceCode: booking.referenceCode,
      status: booking.status,
      customer: booking.customer,
      items: booking.items, // Hier würde normalerweise noch der echte Name resolved (Join mit Item-Tabelle im Repo)
      startDate: booking.startDate,
      endDate: booking.endDate,
      deliveryType: booking.deliveryType,
      customerMessage: booking.customerMessage,
      notes: booking.internalNotes || [],
      emailLogs: (booking as any).emailLogs || [],
      calendarSync: (booking as any).calendarSync || null,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };

    return NextResponse.json(detail);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
