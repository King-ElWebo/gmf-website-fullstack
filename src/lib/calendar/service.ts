import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  BOOKING_BLOCKING_STATUSES,
  BOOKING_STATUS_META,
  MANUAL_BLOCKER_STATUS_META,
  type AdminCalendarEvent,
  type AdminCalendarFeed,
  type CalendarCategoryOption,
  type CalendarResourceOption,
} from "./types";

interface CalendarFeedFilters {
  from: string;
  to: string;
  statuses?: string[];
  itemId?: string;
  categoryId?: string;
  search?: string;
}

type BookingCalendarRecord = any;

type BlockerCalendarRecord = Prisma.CalendarBlockerGetPayload<{
  include: {
    items: {
      include: {
        item: {
          include: {
            category: true;
          };
        };
      };
    };
  };
}>;

function summarizeItems(itemNames: string[]) {
  if (itemNames.length === 0) return "Keine Items";
  if (itemNames.length === 1) return itemNames[0];
  if (itemNames.length === 2) return `${itemNames[0]} + ${itemNames[1]}`;
  return `${itemNames[0]} + ${itemNames.length - 1} weitere`;
}

function isMissingCalendarBlockerTable(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021" &&
    typeof error.meta?.table === "string" &&
    error.meta.table.includes("CalendarBlocker")
  );
}

function buildStats(events: AdminCalendarEvent[]) {
  return {
    totalEvents: events.length,
    blockingEvents: events.filter((event) => event.isBlocking).length,
    approvedBookings: events.filter((event) => event.source === "booking" && event.status === "approved").length,
    requestedBookings: events.filter((event) => event.source === "booking" && event.status === "requested").length,
    manualBlockers: events.filter((event) => event.source === "blocker").length,
  };
}

function buildBookingWhere(filters: CalendarFeedFilters) {
  const bookingStatuses = filters.statuses?.filter((status) => status in BOOKING_STATUS_META);
  const search = filters.search?.trim();
  const itemFilter =
    filters.itemId || filters.categoryId
      ? {
          items: {
            some: {
              ...(filters.itemId ? { itemId: filters.itemId } : {}),
              ...(filters.categoryId
                ? {
                    item: {
                      categoryId: filters.categoryId,
                    },
                  }
                : {}),
            },
          },
        }
      : {};

  return {
    startDate: { lte: new Date(`${filters.to}T23:59:59.999Z`) },
    endDate: { gte: new Date(`${filters.from}T00:00:00.000Z`) },
    ...(filters.statuses
      ? bookingStatuses && bookingStatuses.length > 0
        ? { status: { in: bookingStatuses } }
        : { id: { equals: "__no-bookings__" } }
      : {}),
    ...itemFilter,
    ...(search
      ? {
          OR: [
            { referenceCode: { contains: search, mode: "insensitive" as const } },
            { customer: { firstName: { contains: search, mode: "insensitive" as const } } },
            { customer: { lastName: { contains: search, mode: "insensitive" as const } } },
            { customer: { email: { contains: search, mode: "insensitive" as const } } },
            {
              items: {
                some: {
                  item: {
                    title: { contains: search, mode: "insensitive" as const },
                  },
                },
              },
            },
          ],
        }
      : {}),
  };
}

function buildBlockerWhere(filters: CalendarFeedFilters) {
  const blockerStatuses = filters.statuses?.filter((status) => status in MANUAL_BLOCKER_STATUS_META);
  const search = filters.search?.trim();

  return {
    startDate: { lte: new Date(`${filters.to}T23:59:59.999Z`) },
    endDate: { gte: new Date(`${filters.from}T00:00:00.000Z`) },
    ...(filters.statuses
      ? blockerStatuses && blockerStatuses.length > 0
        ? { status: { in: blockerStatuses } }
        : { id: { equals: "__no-blockers__" } }
      : {}),
    ...(filters.itemId || filters.categoryId
      ? {
          OR: [
            { appliesToAllItems: true },
            {
              items: {
                some: {
                  ...(filters.itemId ? { itemId: filters.itemId } : {}),
                  ...(filters.categoryId
                    ? {
                        item: {
                          categoryId: filters.categoryId,
                        },
                      }
                    : {}),
                },
              },
            },
          ],
        }
      : {}),
    ...(search
      ? {
          AND: [
            {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { contactName: { contains: search, mode: "insensitive" as const } },
                { description: { contains: search, mode: "insensitive" as const } },
              ],
            },
          ],
        }
      : {}),
  };
}

function mapBookingEvent(booking: BookingCalendarRecord): AdminCalendarEvent {
  const itemNames = (booking.items || []).map((entry: any) => entry.item?.title ?? entry.itemId);
  const itemIds = (booking.items || []).map((entry: any) => entry.itemId);
  const categoryIds = (booking.items || [])
    .map((entry: any) => entry.item?.categoryId)
    .filter((value: string | undefined): value is string => Boolean(value));

  return {
    id: `booking-${booking.id}`,
    source: "booking",
    sourceId: booking.id,
    bookingId: booking.id,
    blockerId: null,
    title: booking.referenceCode,
    startDate: booking.startDate.toISOString(),
    endDate: booking.endDate.toISOString(),
    status: booking.status,
    statusLabel: BOOKING_STATUS_META[booking.status]?.label ?? booking.status,
    itemSummary: summarizeItems(itemNames),
    itemNames,
    itemIds,
    categoryIds,
    customerName: `${booking.customer?.firstName ?? ""} ${booking.customer?.lastName ?? ""}`.trim() || null,
    customerEmail: booking.customer?.email ?? null,
    description: booking.customerMessage ?? null,
    referenceCode: booking.referenceCode,
    contactName: null,
    appliesToAllItems: false,
    isBlocking: (BOOKING_BLOCKING_STATUSES as readonly string[]).includes(booking.status),
    linkHref: `/admin/bookings/${booking.id}`,
    tone: BOOKING_STATUS_META[booking.status]?.tone ?? "slate",
    syncStatus: booking.calendarSync?.syncStatus ?? null,
  };
}

function mapBlockerEvent(blocker: BlockerCalendarRecord): AdminCalendarEvent {
  const itemNames = blocker.items.map((entry) => entry.item?.title ?? entry.itemId);
  const itemIds = blocker.items.map((entry) => entry.itemId);
  const categoryIds = blocker.items
    .map((entry) => entry.item?.categoryId)
    .filter((value: string | undefined): value is string => Boolean(value));

  return {
    id: `blocker-${blocker.id}`,
    source: "blocker",
    sourceId: blocker.id,
    bookingId: null,
    blockerId: blocker.id,
    title: blocker.title,
    startDate: blocker.startDate.toISOString(),
    endDate: blocker.endDate.toISOString(),
    status: blocker.status,
    statusLabel: MANUAL_BLOCKER_STATUS_META[blocker.status]?.label ?? blocker.status,
    itemSummary: blocker.appliesToAllItems ? "Alle Items" : summarizeItems(itemNames),
    itemNames,
    itemIds,
    categoryIds,
    customerName: null,
    customerEmail: null,
    description: blocker.description ?? null,
    referenceCode: null,
    contactName: blocker.contactName ?? null,
    appliesToAllItems: blocker.appliesToAllItems,
    isBlocking: true,
    linkHref: null,
    tone: MANUAL_BLOCKER_STATUS_META[blocker.status]?.tone ?? "violet",
    syncStatus: null,
  };
}

export async function getAdminCalendarFeed(filters: CalendarFeedFilters): Promise<AdminCalendarFeed> {
  const warnings: string[] = [];
  const bookingsPromise = (db as any).booking.findMany({
    where: buildBookingWhere(filters),
    include: {
      customer: true,
      calendarSync: true,
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
    orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
  });

  const blockersPromise = db.calendarBlocker
    .findMany({
      where: buildBlockerWhere(filters),
      include: {
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
      orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
    })
    .catch((error: unknown) => {
      if (isMissingCalendarBlockerTable(error)) {
        warnings.push("Die Datenbank-Migration fuer manuelle Kalender-Blocker wurde noch nicht ausgefuehrt.");
        return [] as BlockerCalendarRecord[];
      }

      throw error;
    });

  const syncLogsPromise = db.calendarSyncRecord.findMany({
    include: {
      booking: { select: { referenceCode: true } }
    },
    orderBy: { updatedAt: "desc" },
    take: 50
  }).catch(() => [] as any[]);

  const [bookings, blockers, syncLogs] = await Promise.all([bookingsPromise, blockersPromise, syncLogsPromise]);

  const events = [...bookings.map(mapBookingEvent), ...blockers.map(mapBlockerEvent)].sort((left, right) => {
    if (left.startDate !== right.startDate) {
      return left.startDate.localeCompare(right.startDate);
    }

    if (left.isBlocking !== right.isBlocking) {
      return left.isBlocking ? -1 : 1;
    }

    return left.title.localeCompare(right.title);
  });

  return {
    range: {
      from: filters.from,
      to: filters.to,
    },
    events,
    stats: buildStats(events),
    recentSyncLogs: syncLogs.map((entry) => ({
      id: entry.id,
      bookingId: entry.bookingId,
      referenceCode: entry.booking?.referenceCode ?? null,
      externalEventId: entry.externalEventId ?? null,
      syncStatus: entry.syncStatus,
      lastSyncedAt: entry.lastSyncedAt?.toISOString() ?? null,
      syncError: entry.syncError ?? null,
    })),
    warnings,
  };
}

export async function getCalendarResourceOptions(): Promise<CalendarResourceOption[]> {
  const items = await db.item.findMany({
    include: {
      category: true,
    },
    orderBy: [{ title: "asc" }],
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    categoryId: item.categoryId,
    categoryName: item.category?.name ?? "",
  }));
}

export async function getCalendarCategoryOptions(): Promise<CalendarCategoryOption[]> {
  const categories = await db.category.findMany({
    orderBy: [{ name: "asc" }],
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
  }));
}

// --- Google Calendar Sync ---

import { isGoogleCalendarEnabled, createGoogleCalendarEvent, updateGoogleCalendarEvent, deleteGoogleCalendarEvent } from "./google-calendar-client";

function buildEventPayload(booking: any) {
  const startDate = new Date(booking.startDate);
  // All day event: end date is exclusive, so add 1 day to the end date
  const endDate = new Date(booking.endDate);
  endDate.setDate(endDate.getDate() + 1);

  const startString = startDate.toISOString().split("T")[0];
  const endString = endDate.toISOString().split("T")[0];

  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const adminUrl = `${baseUrl}/admin/bookings/${booking.id}`;

  const customerName = `${booking.customer?.firstName || ""} ${booking.customer?.lastName || ""}`.trim();
  const addressLines = [
    booking.customer?.addressLine1,
    booking.customer?.zip ? `${booking.customer.zip} ${booking.customer.city || ""}` : booking.customer?.city
  ].filter(Boolean).join(", ");

  const itemsList = booking.items.map((i: any) => `- ${i.quantity}x ${i.resourceTitle || i.item?.title || "Produkt"}`).join("\n");

  const description = `Referenz: ${booking.referenceCode}
Status: ${booking.status}
Zeitraum: ${startDate.toLocaleDateString("de-DE")} bis ${new Date(booking.endDate).toLocaleDateString("de-DE")}
Lieferart: ${booking.deliveryType}

Produkte:
${itemsList}

Kunde:
Name: ${customerName}
Adresse: ${addressLines || "Nicht angegeben"}
E-Mail: ${booking.customer?.email || "Nicht angegeben"}
Telefon: ${booking.customer?.phone || "Nicht angegeben"}

Detailansicht (Admin):
${adminUrl}

Automatisch generiert aus der GMF Website.`;

  return {
    summary: `GMF: ${booking.referenceCode} - ${customerName}`,
    description,
    location: addressLines || undefined,
    start: { date: startString },
    end: { date: endString },
    // Keine Attendees eintragen, damit Google keine Mails schickt!
  };
}

export async function syncBookingToGoogleCalendar(bookingId: string) {
  if (!isGoogleCalendarEnabled()) {
    return;
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      items: { include: { item: true } },
      calendarSync: true,
    }
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.status === "requested") return; // We do not sync requested bookings

  const eventPayload = buildEventPayload(booking);
  const syncRecord = booking.calendarSync;

  try {
    let resultEvent;

    if (syncRecord?.externalEventId) {
      resultEvent = await updateGoogleCalendarEvent(syncRecord.externalEventId, eventPayload);
    } else {
      resultEvent = await createGoogleCalendarEvent(eventPayload);
    }

    const htmlLink = resultEvent?.htmlLink || null;
    const externalEventId = resultEvent?.id || syncRecord?.externalEventId;

    await db.calendarSyncRecord.upsert({
      where: { bookingId },
      create: {
        bookingId,
        externalEventId,
        htmlLink,
        syncStatus: "synced",
        lastSyncedAt: new Date(),
        syncError: null,
      },
      update: {
        externalEventId,
        htmlLink,
        syncStatus: "synced",
        lastSyncedAt: new Date(),
        syncError: null,
      }
    });

  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Google Sync] Failed to sync booking ${bookingId}:`, errorMsg);
    
    await db.calendarSyncRecord.upsert({
      where: { bookingId },
      create: {
        bookingId,
        syncStatus: "failed",
        lastSyncedAt: new Date(),
        syncError: errorMsg,
      },
      update: {
        syncStatus: "failed",
        lastSyncedAt: new Date(),
        syncError: errorMsg,
      }
    });
  }
}

export async function deleteGoogleCalendarEventForBooking(bookingId: string) {
  if (!isGoogleCalendarEnabled()) {
    return;
  }

  const syncRecord = await db.calendarSyncRecord.findUnique({ where: { bookingId } });
  if (!syncRecord || !syncRecord.externalEventId) return;

  try {
    await deleteGoogleCalendarEvent(syncRecord.externalEventId);
    
    await db.calendarSyncRecord.update({
      where: { bookingId },
      data: {
        syncStatus: "deleted",
        lastSyncedAt: new Date(),
        syncError: null,
      }
    });
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Google Sync] Failed to delete event for booking ${bookingId}:`, errorMsg);
    
    await db.calendarSyncRecord.update({
      where: { bookingId },
      data: {
        syncStatus: "failed",
        lastSyncedAt: new Date(),
        syncError: `Delete failed: ${errorMsg}`,
      }
    });
  }
}

export async function resyncBooking(bookingId: string) {
  return syncBookingToGoogleCalendar(bookingId);
}
