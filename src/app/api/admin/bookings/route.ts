import { NextResponse, NextRequest } from 'next/server';
import { PrismaBookingRepository } from '@/lib/booking-core/infrastructure/database/PrismaBookingRepository';

const bookingRepo = new PrismaBookingRepository();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');

    const filters = {
      statuses: status ? status.split(',') : undefined,
      keyword: keyword || undefined
    };

    const paginatedResult = await bookingRepo.findForAdminView(filters as any, page, limit);

    // Mappen zum AdminBookingListItem
    const responseData = paginatedResult.data.map((b: any) => ({
      id: b.id,
      referenceCode: b.referenceCode,
      status: b.status,
      customerName: `${b.customer?.firstName} ${b.customer?.lastName}`,
      customerEmail: b.customer?.email,
      startDate: b.startDate,
      endDate: b.endDate,
      deliveryType: b.deliveryType,
      itemCount: b.items?.length || 0,
      createdAt: b.createdAt
    }));

    return NextResponse.json({
      data: responseData,
      total: paginatedResult.total,
      page,
      limit,
      totalPages: Math.ceil(paginatedResult.total / limit)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
