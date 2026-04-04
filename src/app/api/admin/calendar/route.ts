import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminCalendarFeed } from "@/lib/calendar/service";
import { getRangeForView, toDateKey } from "@/lib/calendar/date-utils";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMissingCalendarBlockerTable(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021" &&
    typeof error.meta?.table === "string" &&
    error.meta.table.includes("CalendarBlocker")
  );
}

function parseItemIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
}

function validateBlockerPayload(body: unknown) {
  const payload = isRecord(body) ? body : {};
  const itemIds = parseItemIds(payload.itemIds);
  const startDate = typeof payload.startDate === "string" ? new Date(payload.startDate) : null;
  const endDate = typeof payload.endDate === "string" ? new Date(payload.endDate) : null;
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const status = typeof payload.status === "string" ? payload.status : "blocked";
  const appliesToAllItems = Boolean(payload.appliesToAllItems);

  if (!title) {
    return { error: "Titel ist erforderlich." };
  }

  if (!startDate || Number.isNaN(startDate.getTime()) || !endDate || Number.isNaN(endDate.getTime())) {
    return { error: "Gueltige Start- und Enddaten sind erforderlich." };
  }

  if (startDate > endDate) {
    return { error: "Das Startdatum darf nicht nach dem Enddatum liegen." };
  }

  if (!appliesToAllItems && itemIds.length === 0) {
    return { error: "Waehle mindestens ein Item oder aktiviere 'Alle Items'." };
  }

  return {
    data: {
      title,
      status,
      startDate,
      endDate,
      appliesToAllItems,
      description: typeof payload.description === "string" ? payload.description.trim() || null : null,
      contactName: typeof payload.contactName === "string" ? payload.contactName.trim() || null : null,
      source: "manual",
      createdBy: "system-admin",
      itemIds,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get("view");
    const anchorDate = searchParams.get("anchorDate");
    const fallbackAnchor = anchorDate && /^\d{4}-\d{2}-\d{2}$/.test(anchorDate) ? anchorDate : toDateKey(new Date());
    const fallbackRange = getRangeForView(view === "week" || view === "day" ? view : "month", fallbackAnchor);

    const from = searchParams.get("from") ?? fallbackRange.from;
    const to = searchParams.get("to") ?? fallbackRange.to;
    const statusValues = searchParams.getAll("status");

    const feed = await getAdminCalendarFeed({
      from,
      to,
      statuses: statusValues.length > 0 ? statusValues : undefined,
      itemId: searchParams.get("itemId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      search: searchParams.get("search") || undefined,
    });

    return NextResponse.json(feed);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Kalender konnte nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = validateBlockerPayload(body);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const blocker = await db.calendarBlocker.create({
      data: {
        title: result.data.title,
        status: result.data.status,
        startDate: result.data.startDate,
        endDate: result.data.endDate,
        appliesToAllItems: result.data.appliesToAllItems,
        description: result.data.description,
        contactName: result.data.contactName,
        source: result.data.source,
        createdBy: result.data.createdBy,
        items: result.data.appliesToAllItems
          ? undefined
          : {
              create: result.data.itemIds.map((itemId) => ({
                itemId,
              })),
            },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ blocker }, { status: 201 });
  } catch (error: unknown) {
    if (isMissingCalendarBlockerTable(error)) {
      return NextResponse.json(
        { error: "Die Datenbank-Migration fuer manuelle Kalender-Blocker fehlt noch. Bitte Migration ausfuehren." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Blocker konnte nicht gespeichert werden." }, { status: 500 });
  }
}
