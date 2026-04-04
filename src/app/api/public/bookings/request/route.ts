import { NextResponse } from 'next/server';
import { createPublicBookingUseCases } from '@/lib/booking-core/server';

const publicUseCases = createPublicBookingUseCases();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Einfache Validierung (in echt mit zod/yup)
    if (!body.items || !body.startDate || !body.endDate || !body.customer) {
      return NextResponse.json({ error: 'Missing required payload fields' }, { status: 400 });
    }

    const booking = await publicUseCases.createBookingRequest({
      customer: body.customer,
      items: body.items,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      deliveryType: body.deliveryType || 'pickup',
      customerMessage: body.customerMessage
    });

    return NextResponse.json({ success: true, bookingId: booking.id, status: booking.status });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Booking request failed' }, { status: 400 });
  }
}
