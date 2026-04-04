import { NextResponse } from 'next/server';
import { PrismaBookingRepository } from '@/lib/booking-core/infrastructure/database/PrismaBookingRepository';

const bookingRepo = new PrismaBookingRepository();

export async function GET() {
  try {
    const stats = await bookingRepo.getDashboardStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
