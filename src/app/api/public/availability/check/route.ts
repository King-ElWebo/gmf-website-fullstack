import { NextResponse } from 'next/server';
import { createAvailabilityService } from '@/lib/booking-core/server';

const availabilityService = createAvailabilityService();

export async function POST(req: Request) {
  try {
    const { items, startDate, endDate } = await req.json();
    
    if (!items || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await availabilityService.checkAvailability(
      items,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Availability check failed' }, { status: 500 });
  }
}
