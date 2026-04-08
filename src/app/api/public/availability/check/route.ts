import { NextResponse } from 'next/server';
import { createAvailabilityService } from '@/lib/booking-core/server';

const availabilityService = createAvailabilityService();

export async function POST(req: Request) {
  try {
    const { items, startDate, endDate } = await req.json();
    
    if (!Array.isArray(items) || items.length === 0 || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedItems = items
      .filter((item) => item && typeof item.resourceId === "string")
      .map((item) => ({
        resourceId: item.resourceId,
        quantity: Number.isFinite(Number(item.quantity)) ? Math.max(1, Math.floor(Number(item.quantity))) : 1,
      }));

    if (!normalizedItems.length) {
      return NextResponse.json({ error: 'No valid items provided' }, { status: 400 });
    }

    const result = await availabilityService.checkAvailability(
      normalizedItems,
      new Date(`${startDate}T00:00:00.000Z`),
      new Date(`${endDate}T00:00:00.000Z`)
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Availability check failed' }, { status: 500 });
  }
}
