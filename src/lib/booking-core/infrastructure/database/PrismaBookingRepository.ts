import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { BookingRepository, BookingFilters, Paginated } from "../../application/ports";
import { Booking, BookingAddress, BookingStatus, AdminDashboardStats, InternalNote } from "../../domain/models";

const BOOKING_ITEM_SNAPSHOT_FIELDS = [
  "resourceTitle",
  "priceType",
  "basePriceCents",
  "priceLabel",
  "displayPrice",
  "pricingMode",
  "pricingReason",
  "bookingDays",
  "calculatedUnitPriceCents",
  "calculatedTotalPriceCents",
] as const;

function isUnknownBookingItemSnapshotArgument(error: unknown) {
  if (!(error instanceof Error)) return false;
  if (!error.message.includes("Unknown argument")) return false;
  return BOOKING_ITEM_SNAPSHOT_FIELDS.some((field) => error.message.includes(`\`${field}\``));
}

function isUnknownBillingAddressArgument(error: unknown) {
  if (!(error instanceof Error)) return false;
  if (!error.message.includes("Unknown argument")) return false;
  return error.message.includes("`billingAddress`") || error.message.includes("`billingAddressSameAsDelivery`");
}

function toStoredBillingAddress(address?: BookingAddress | null) {
  if (!address) return null;

  const stored: Record<string, string> = {};
  if (address.nameOrCompany) stored.nameOrCompany = address.nameOrCompany;
  if (address.addressLine1) stored.addressLine1 = address.addressLine1;
  if (address.zip) stored.zip = address.zip;
  if (address.city) stored.city = address.city;
  if (address.country) stored.country = address.country;

  return Object.keys(stored).length > 0 ? stored : null;
}

async function persistBillingAddressSnapshot(
  bookingId: string,
  billingAddressSameAsDelivery: boolean,
  billingAddress?: BookingAddress | null
) {
  const storedBillingAddress = toStoredBillingAddress(billingAddress);
  const storedBillingAddressJson = storedBillingAddress ? JSON.stringify(storedBillingAddress) : null;

  try {
    await db.$executeRaw(Prisma.sql`
      UPDATE "Booking"
      SET
        "billingAddressSameAsDelivery" = ${billingAddressSameAsDelivery},
        "billingAddress" = CAST(${storedBillingAddressJson} AS JSONB)
      WHERE "id" = ${bookingId}
    `);
  } catch (error) {
    if (error instanceof Error && error.message.includes("billingAddress")) {
      console.warn("[PrismaBookingRepository.save] Billing address columns are not available yet. Skipping billing address snapshot.");
      return;
    }

    throw error;
  }
}

async function readBillingAddressSnapshot(bookingId: string) {
  try {
    const rows = await db.$queryRaw<Array<{
      billingAddress: BookingAddress | null;
      billingAddressSameAsDelivery: boolean | null;
    }>>(Prisma.sql`
      SELECT
        "billingAddress" AS "billingAddress",
        "billingAddressSameAsDelivery" AS "billingAddressSameAsDelivery"
      FROM "Booking"
      WHERE "id" = ${bookingId}
      LIMIT 1
    `);

    return rows[0] ?? null;
  } catch (error) {
    if (error instanceof Error && error.message.includes("billingAddress")) {
      return null;
    }

    throw error;
  }
}

export class PrismaBookingRepository implements BookingRepository {
  async getResourceInventories(resourceIds: string[]): Promise<Array<{ resourceId: string; trackInventory: boolean; totalStock: number }>> {
    if (!resourceIds.length) return [];

    const rows = await db.item.findMany({
      where: { id: { in: resourceIds } },
      select: {
        id: true,
        trackInventory: true,
        totalStock: true,
      },
    });

    return rows.map((row) => ({
      resourceId: row.id,
      trackInventory: row.trackInventory,
      totalStock: row.totalStock,
    }));
  }

  async findById(id: string): Promise<Booking | null> {
    const data = await (db as any).booking.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            item: {
              include: {
                category: true,
                images: {
                  orderBy: { sortOrder: "asc" },
                  take: 1,
                },
              },
            },
          },
        },
        notes: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!data) return null;
    const billingSnapshot = await readBillingAddressSnapshot(id);
    const dataWithBilling = data as {
      billingAddressSameAsDelivery?: boolean | null;
      billingAddress?: BookingAddress | null;
    };

    return {
      ...data,
      billingAddressSameAsDelivery: billingSnapshot?.billingAddressSameAsDelivery ?? dataWithBilling.billingAddressSameAsDelivery ?? true,
      billingAddress: billingSnapshot?.billingAddress ?? dataWithBilling.billingAddress ?? null,
    } as unknown as Booking;
  }

  async findOverlapping(resourceId: string, start: Date, end: Date, blockingStatuses: BookingStatus[]): Promise<Booking[]> {
    const data = await (db as any).booking.findMany({
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
    const billingAddressSameAsDelivery = booking.billingAddressSameAsDelivery ?? true;
    const storedBillingAddress = toStoredBillingAddress(booking.billingAddress);
    const commonDataWithoutBilling = {
      referenceCode: booking.referenceCode,
      status: booking.status,
      startDate: booking.startDate,
      endDate: booking.endDate,
      deliveryType: booking.deliveryType,
      customerMessage: booking.customerMessage,
      totalPriceCents: booking.totalPriceCents ?? null,
      hasIndividualPricing: booking.hasIndividualPricing ?? false,
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
    } as const;
    const commonData = {
      ...commonDataWithoutBilling,
      billingAddressSameAsDelivery,
      billingAddress: storedBillingAddress ?? Prisma.DbNull,
    } as const;

    const includeData = {
      customer: true,
      items: {
        include: {
          item: true,
        },
      }
    } as const;

    try {
      const data = await (db as any).booking.create({
        data: {
          ...commonData,
          items: {
            create: booking.items.map(i => ({
              itemId: i.resourceId,
              quantity: i.quantity,
              resourceTitle: i.resourceTitle,
              priceType: i.priceType,
              basePriceCents: i.basePriceCents ?? null,
              priceLabel: i.priceLabel ?? null,
              displayPrice: i.displayPrice ?? null,
              pricingMode: i.pricingMode ?? null,
              pricingReason: i.pricingReason ?? null,
              bookingDays: i.bookingDays ?? null,
              calculatedUnitPriceCents: i.calculatedUnitPriceCents ?? null,
              calculatedTotalPriceCents: i.calculatedTotalPriceCents ?? null,
            }))
          }
        },
        include: includeData
      });

      return data as unknown as Booking;
    } catch (error) {
      const unknownBillingAddressArgument = isUnknownBillingAddressArgument(error);
      const unknownSnapshotArgument = isUnknownBookingItemSnapshotArgument(error);

      if (!unknownBillingAddressArgument && !unknownSnapshotArgument) {
        throw error;
      }

      const retryCommonData = unknownBillingAddressArgument ? commonDataWithoutBilling : commonData;

      if (!unknownSnapshotArgument) {
        const retryData = await (db as any).booking.create({
          data: {
            ...retryCommonData,
            items: {
              create: booking.items.map(i => ({
                itemId: i.resourceId,
                quantity: i.quantity,
                resourceTitle: i.resourceTitle,
                priceType: i.priceType,
                basePriceCents: i.basePriceCents ?? null,
                priceLabel: i.priceLabel ?? null,
                displayPrice: i.displayPrice ?? null,
                pricingMode: i.pricingMode ?? null,
                pricingReason: i.pricingReason ?? null,
                bookingDays: i.bookingDays ?? null,
                calculatedUnitPriceCents: i.calculatedUnitPriceCents ?? null,
                calculatedTotalPriceCents: i.calculatedTotalPriceCents ?? null,
              }))
            }
          },
          include: includeData
        });

        if (unknownBillingAddressArgument) {
          await persistBillingAddressSnapshot(retryData.id, billingAddressSameAsDelivery, booking.billingAddress);
        }

        return {
          ...retryData,
          billingAddressSameAsDelivery,
          billingAddress: storedBillingAddress,
        } as unknown as Booking;
      }

      // Compatibility fallback: allows saving requests even if Prisma Client/schema is stale.
      console.warn("[PrismaBookingRepository.save] Snapshot fields not available in Prisma Client yet. Falling back to legacy BookingItem create payload.");
      const fallbackData = await (db as any).booking.create({
        data: {
          ...retryCommonData,
          items: {
            create: booking.items.map(i => ({
              itemId: i.resourceId,
              quantity: i.quantity,
            }))
          }
        },
        include: includeData
      });

      if (unknownBillingAddressArgument) {
        await persistBillingAddressSnapshot(fallbackData.id, billingAddressSameAsDelivery, booking.billingAddress);
      }

      return {
        ...fallbackData,
        billingAddressSameAsDelivery,
        billingAddress: storedBillingAddress,
      } as unknown as Booking;
    }
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const updated = await (db as any).booking.update({
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
    const whereClause: any = {};
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
      (db as any).booking.findMany({
        where: whereClause,
        include: {
          customer: true,
          items: {
            include: {
              item: {
                include: {
                  category: true,
                  images: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: { startDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      (db as any).booking.count({ where: whereClause })
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
      (db as any).booking.count({ where: { status: 'requested' } }),
      (db as any).booking.count({ 
        where: { 
          status: 'approved',
          startDate: { gt: new Date() }
        } 
      }),
      0, // db.emailLog.count
      0  // db.calendarSyncRecord.count
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
    const note = await (db as any).internalNote.create({
      data: {
        bookingId,
        content,
        authorId
      }
    });
    return note as unknown as InternalNote;
  }
}
