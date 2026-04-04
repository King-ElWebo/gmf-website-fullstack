import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

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
      itemIds,
    },
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const result = validateBlockerPayload(body);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const blocker = await db.calendarBlocker.update({
      where: { id: resolvedParams.id },
      data: {
        title: result.data.title,
        status: result.data.status,
        startDate: result.data.startDate,
        endDate: result.data.endDate,
        appliesToAllItems: result.data.appliesToAllItems,
        description: result.data.description,
        contactName: result.data.contactName,
        items: {
          deleteMany: {},
          ...(result.data.appliesToAllItems
            ? {}
            : {
                create: result.data.itemIds.map((itemId) => ({
                  itemId,
                })),
              }),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ blocker });
  } catch (error: unknown) {
    if (isMissingCalendarBlockerTable(error)) {
      return NextResponse.json(
        { error: "Die Datenbank-Migration fuer manuelle Kalender-Blocker fehlt noch. Bitte Migration ausfuehren." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Blocker konnte nicht aktualisiert werden." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await db.calendarBlocker.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (isMissingCalendarBlockerTable(error)) {
      return NextResponse.json(
        { error: "Die Datenbank-Migration fuer manuelle Kalender-Blocker fehlt noch. Bitte Migration ausfuehren." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Blocker konnte nicht geloescht werden." }, { status: 500 });
  }
}
