import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { BookingRepository, BookingFilters, Paginated } from "../../application/ports";
import { Booking, BookingStatus, AdminDashboardStats, InternalNote } from "../../domain/models";

export class PrismaBookingRepository implements BookingRepository {
  async findById(id: string): Promise<Booking | null> {
    const data = await db.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            item: {
              include: {
                category: true,
              },
            },
          },
        },
        notes: { orderBy: { createdAt: "desc" } },
        emailLogs: true,
        calendarSync: true,
      },
    });

    if (!data) return null;
    return data as unknown as Booking; 
  }

  async findOverlapping(resourceId: string, start: Date, end: Date, blockingStatuses: BookingStatus[]): Promise<Booking[]> {
    const data = await db.booking.findMany({
      where: {
        status: { in: blockingStatuses as string[] },
        items: {
          some: { itemId: resourceId }
        },
        startDate: { lt: end },
        endDate: { gt: start }
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
        customer: true
      }
    });

    return data as unknown as Booking[];
  }

  async save(booking: Booking): Promise<Booking> {
    const data = await db.booking.create({
      data: {
        referenceCode: booking.referenceCode,
        status: booking.status,
        startDate: booking.startDate,
        endDate: booking.endDate,
        deliveryType: booking.deliveryType,
        customerMessage: booking.customerMessage,
        customer: {
          create: {
            firstName: booking.customer.firstName,
            lastName: booking.customer.lastName,
            email: booking.customer.email,
            phone: booking.customer.phone,
            addressLine1: booking.customer.addressLine1,
            zip: booking.customer.zip,
            city: booking.customer.city
          }
        },
        items: {
          create: booking.items.map(i => ({
            itemId: i.resourceId,
            quantity: i.quantity
          }))
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
      }
    });

    return data as unknown as Booking;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const updated = await db.booking.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
      }
    });
    return updated as unknown as Booking;
  }

  async findForAdminView(filters: BookingFilters, page: number = 1, limit: number = 50): Promise<Paginated<unknown>> {
    const whereClause: Prisma.BookingWhereInput = {};
    if (filters.statuses && filters.statuses.length > 0) {
      whereClause.status = { in: filters.statuses as string[] };
    }
    if (filters.keyword) {
      whereClause.OR = [
        { referenceCode: { contains: filters.keyword, mode: 'insensitive' } },
        { customer: { email: { contains: filters.keyword, mode: 'insensitive' } } },
        { customer: { lastName: { contains: filters.keyword, mode: 'insensitive' } } },
        { customer: { firstName: { contains: filters.keyword, mode: 'insensitive' } } },
        { items: { some: { item: { title: { contains: filters.keyword, mode: 'insensitive' } } } } },
      ];
    }
    
    const [data, total] = await Promise.all([
      db.booking.findMany({
        where: whereClause,
        include: {
          customer: true,
          items: {
            include: {
              item: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { startDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.booking.count({ where: whereClause })
    ]);

    return { data, total };
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [
      openRequestsCount,
      upcomingApprovedBookingsCount,
      failedEmailsCount,
      failedCalendarSyncsCount
    ] = await Promise.all([
      db.booking.count({ where: { status: 'requested' } }),
      db.booking.count({ 
        where: { 
          status: 'approved',
          startDate: { gt: new Date() }
        } 
      }),
      db.emailLog.count({ where: { status: 'failed' } }),
      db.calendarSyncRecord.count({ where: { syncStatus: 'failed' } })
    ]);

    return {
      openRequestsCount,
      upcomingApprovedBookingsCount,
      conflictedBookingsCount: 0, 
      resourcesWithLowStockCount: 0, 
      failedEmailsCount,
      failedCalendarSyncsCount
    };
  }

  async addNote(bookingId: string, content: string, authorId: string): Promise<InternalNote> {
    const note = await db.internalNote.create({
      data: {
        bookingId,
        content,
        authorId
      }
    });
    return note as unknown as InternalNote;
  }
}
