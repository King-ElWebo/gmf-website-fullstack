"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import {
  BOOKING_STATUS_META,
  CALENDAR_VIEWS,
  MANUAL_BLOCKER_STATUS_META,
  type AdminCalendarEvent,
  type AdminCalendarFeed,
  type CalendarCategoryOption,
  type CalendarResourceOption,
  type CalendarView,
} from "@/lib/calendar/types";
import {
  clampDateKey,
  countDaysInclusive,
  dateFromKey,
  getDatesBetween,
  getDayLabel,
  getMonthLabel,
  getRangeForView,
  getWeekLabel,
  overlapsDateRange,
  shiftAnchorDate,
  toDateKey,
} from "@/lib/calendar/date-utils";

const ALL_STATUS_OPTIONS = [
  ...Object.entries(BOOKING_STATUS_META),
  ...Object.entries(MANUAL_BLOCKER_STATUS_META),
].map(([value, meta]) => ({
  value,
  label: meta.label,
  chip: meta.chip,
}));

const MANUAL_STATUS_OPTIONS = Object.entries(MANUAL_BLOCKER_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

type EditorMode =
  | { open: false }
  | {
      open: true;
      mode: "create" | "edit";
      blockerId?: string;
      initialDateKey: string;
      title: string;
      status: string;
      startDate: string;
      endDate: string;
      appliesToAllItems: boolean;
      itemIds: string[];
      contactName: string;
      description: string;
    };

interface AdminCalendarClientProps {
  initialFeed: AdminCalendarFeed;
  items: CalendarResourceOption[];
  categories: CalendarCategoryOption[];
  initialAnchorDate: string;
}

function getStatusChipClasses(status: string) {
  if (status in BOOKING_STATUS_META) {
    return BOOKING_STATUS_META[status].chip;
  }

  return MANUAL_BLOCKER_STATUS_META[status]?.chip ?? "bg-slate-100 text-slate-700 border-slate-200";
}

function getToneSurfaceClasses(tone: string) {
  switch (tone) {
    case "emerald":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "rose":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "sky":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "cyan":
      return "border-cyan-200 bg-cyan-50 text-cyan-900";
    case "violet":
      return "border-violet-200 bg-violet-50 text-violet-900";
    case "fuchsia":
      return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-900";
  }
}

function getEventDateRangeLabel(event: AdminCalendarEvent) {
  const formatter = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });

  const start = formatter.format(new Date(event.startDate));
  const end = formatter.format(new Date(event.endDate));

  if (start === end) {
    return start;
  }

  return `${start} - ${end}`;
}

function getPeriodLabel(view: CalendarView, anchorDate: string) {
  if (view === "week") return getWeekLabel(anchorDate);
  if (view === "day") return getDayLabel(anchorDate);
  return getMonthLabel(anchorDate);
}

function getEventSortValue(event: AdminCalendarEvent) {
  return [
    event.isBlocking ? "0" : "1",
    event.startDate,
    String(999 - countDaysInclusive(toDateKey(event.startDate), toDateKey(event.endDate))).padStart(3, "0"),
    event.title,
  ].join("-");
}

function buildWeekSegments(events: AdminCalendarEvent[], weekDates: string[], maxVisibleLanes: number) {
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];
  const overlappingEvents = events
    .filter((event) => overlapsDateRange(toDateKey(event.startDate), toDateKey(event.endDate), weekStart, weekEnd))
    .sort((left, right) => getEventSortValue(left).localeCompare(getEventSortValue(right)));

  const laneEnds: number[] = [];
  const hiddenByDay = Object.fromEntries(weekDates.map((dateKey) => [dateKey, 0])) as Record<string, number>;
  const visibleSegments: Array<{ event: AdminCalendarEvent; lane: number; startIndex: number; endIndex: number }> = [];

  for (const event of overlappingEvents) {
    const startIndex = Math.max(0, weekDates.indexOf(clampDateKey(toDateKey(event.startDate), weekStart, weekEnd)));
    const endIndex = Math.max(0, weekDates.indexOf(clampDateKey(toDateKey(event.endDate), weekStart, weekEnd)));

    let lane = laneEnds.findIndex((laneEnd) => startIndex > laneEnd);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(endIndex);
    } else {
      laneEnds[lane] = endIndex;
    }

    if (lane < maxVisibleLanes) {
      visibleSegments.push({ event, lane, startIndex, endIndex });
    } else {
      for (let dayIndex = startIndex; dayIndex <= endIndex; dayIndex += 1) {
        hiddenByDay[weekDates[dayIndex]] += 1;
      }
    }
  }

  return { visibleSegments, hiddenByDay };
}

function getInitialEditor(dateKey: string): EditorMode {
  return {
    open: true,
    mode: "create",
    initialDateKey: dateKey,
    title: "",
    status: "blocked",
    startDate: dateKey,
    endDate: dateKey,
    appliesToAllItems: false,
    itemIds: [],
    contactName: "",
    description: "",
  };
}

export function AdminCalendarClient({
  initialFeed,
  items,
  categories,
  initialAnchorDate,
}: AdminCalendarClientProps) {
  const [view, setView] = useState<CalendarView>("month");
  const [anchorDate, setAnchorDate] = useState(initialAnchorDate);
  const [feed, setFeed] = useState(initialFeed);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(ALL_STATUS_OPTIONS.map((option) => option.value));
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(initialFeed.events[0]?.id ?? null);
  const [editor, setEditor] = useState<EditorMode>({ open: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = getRangeForView(view, anchorDate);
  const visibleDateKeys = getDatesBetween(range.from, range.to);
  const selectedEvent = feed.events.find((event) => event.id === selectedEventId) ?? null;
  const filteredItems = selectedCategoryId
    ? items.filter((item) => item.categoryId === selectedCategoryId)
    : items;

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeed() {
      setIsLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          view,
          anchorDate,
          from: range.from,
          to: range.to,
        });

        for (const status of selectedStatuses) {
          searchParams.append("status", status);
        }

        if (selectedItemId) searchParams.set("itemId", selectedItemId);
        if (selectedCategoryId) searchParams.set("categoryId", selectedCategoryId);
        if (deferredSearch.trim()) searchParams.set("search", deferredSearch.trim());

        const response = await fetch(`/api/admin/calendar?${searchParams.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Kalender konnte nicht geladen werden.");
        }

        setFeed(data);
        setSelectedEventId((current) => {
          if (current && data.events.some((event: AdminCalendarEvent) => event.id === current)) {
            return current;
          }

          return data.events[0]?.id ?? null;
        });
      } catch (loadError: unknown) {
        if (!(loadError instanceof Error && loadError.name === "AbortError")) {
          setError(loadError instanceof Error ? loadError.message : "Kalender konnte nicht geladen werden.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadFeed();

    return () => controller.abort();
  }, [anchorDate, deferredSearch, range.from, range.to, selectedCategoryId, selectedItemId, selectedStatuses, view]);

  async function refreshFeed(preferredEventId?: string | null) {
    const searchParams = new URLSearchParams({
      view,
      anchorDate,
      from: range.from,
      to: range.to,
    });

    for (const status of selectedStatuses) {
      searchParams.append("status", status);
    }

    if (selectedItemId) searchParams.set("itemId", selectedItemId);
    if (selectedCategoryId) searchParams.set("categoryId", selectedCategoryId);
    if (deferredSearch.trim()) searchParams.set("search", deferredSearch.trim());

    const response = await fetch(`/api/admin/calendar?${searchParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Kalender konnte nicht aktualisiert werden.");
    }

    setFeed(data);
    setSelectedEventId(preferredEventId ?? data.events[0]?.id ?? null);
  }

  function toggleStatus(status: string) {
    setSelectedStatuses((current) => {
      if (current.includes(status)) {
        if (current.length === 1) return current;
        return current.filter((value) => value !== status);
      }

      return [...current, status];
    });
  }

  function openCreateEditor(dateKey: string) {
    setEditor(getInitialEditor(dateKey));
  }

  function openEditEditor(event: AdminCalendarEvent) {
    if (event.source !== "blocker" || !event.blockerId) return;

    setEditor({
      open: true,
      mode: "edit",
      blockerId: event.blockerId,
      initialDateKey: toDateKey(event.startDate),
      title: event.title,
      status: event.status,
      startDate: toDateKey(event.startDate),
      endDate: toDateKey(event.endDate),
      appliesToAllItems: event.appliesToAllItems,
      itemIds: event.itemIds,
      contactName: event.contactName ?? "",
      description: event.description ?? "",
    });
  }

  async function handleSaveEditor(formState: Extract<EditorMode, { open: true }>) {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        formState.mode === "create" ? "/api/admin/calendar" : `/api/admin/calendar/${formState.blockerId}`,
        {
          method: formState.mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formState.title,
            status: formState.status,
            startDate: `${formState.startDate}T00:00:00.000Z`,
            endDate: `${formState.endDate}T00:00:00.000Z`,
            appliesToAllItems: formState.appliesToAllItems,
            itemIds: formState.itemIds,
            contactName: formState.contactName,
            description: formState.description,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Eintrag konnte nicht gespeichert werden.");
      }

      setEditor({ open: false });
      await refreshFeed(data.blocker ? `blocker-${data.blocker.id}` : null);
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Eintrag konnte nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteBlocker(blockerId: string) {
    if (!window.confirm("Soll dieser manuelle Blocker wirklich geloescht werden?")) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/calendar/${blockerId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Blocker konnte nicht geloescht werden.");
      }

      setEditor({ open: false });
      setSelectedEventId(null);
      await refreshFeed(null);
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : "Blocker konnte nicht geloescht werden.");
    } finally {
      setIsSaving(false);
    }
  }

  function renderMonthView() {
    const weeks: string[][] = [];
    for (let index = 0; index < visibleDateKeys.length; index += 7) {
      weeks.push(visibleDateKeys.slice(index, index + 7));
    }

    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/90 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-4 py-3 text-center">
              {label}
            </div>
          ))}
        </div>

        {weeks.map((weekDates) => {
          const { visibleSegments, hiddenByDay } = buildWeekSegments(feed.events, weekDates, 4);

          return (
            <div key={weekDates[0]} className="relative border-b border-slate-200 last:border-b-0">
              <div className="pointer-events-none absolute inset-x-0 top-10 z-10 space-y-1 px-2">
                {Array.from({ length: 4 }).map((_, lane) => (
                  <div key={lane} className="grid grid-cols-7 gap-1">
                    {visibleSegments
                      .filter((segment) => segment.lane === lane)
                      .map((segment) => (
                        <button
                          key={`${segment.event.id}-${lane}`}
                          type="button"
                          onClick={() => setSelectedEventId(segment.event.id)}
                          className={`pointer-events-auto col-span-1 h-7 overflow-hidden rounded-xl border px-2 text-left text-[11px] font-semibold shadow-sm transition hover:-translate-y-0.5 ${getToneSurfaceClasses(segment.event.tone)}`}
                          style={{
                            gridColumn: `${segment.startIndex + 1} / span ${segment.endIndex - segment.startIndex + 1}`,
                          }}
                          title={`${segment.event.title} - ${segment.event.statusLabel} - ${segment.event.itemSummary}`}
                        >
                          <span className="truncate block">{segment.event.title}</span>
                        </button>
                      ))}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px bg-slate-200">
                {weekDates.map((dateKey) => {
                  const dayEvents = feed.events.filter((event) =>
                    overlapsDateRange(toDateKey(event.startDate), toDateKey(event.endDate), dateKey, dateKey)
                  );
                  const isCurrentMonth = dateFromKey(dateKey).getUTCMonth() === dateFromKey(anchorDate).getUTCMonth();
                  const isToday = dateKey === toDateKey(new Date());

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => openCreateEditor(dateKey)}
                      className="min-h-[11rem] bg-white px-3 pb-3 pt-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                            isToday ? "bg-slate-900 text-white" : isCurrentMonth ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {dateFromKey(dateKey).getUTCDate()}
                        </span>
                        <span className="text-[11px] text-slate-400">{dayEvents.length} Eintraege</span>
                      </div>

                      <div className="pt-24 text-xs text-slate-500">
                        {hiddenByDay[dateKey] > 0 ? `+${hiddenByDay[dateKey]} weitere` : dayEvents.length === 0 ? "Klick fuer Blocker" : ""}
                      </div>

                      <div className="mt-2 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={`${dateKey}-${event.id}`}
                            className={`rounded-lg border px-2 py-1 text-[11px] ${getToneSurfaceClasses(event.tone)}`}
                          >
                            <div className="truncate font-semibold">{event.title}</div>
                            <div className="truncate text-[10px] opacity-80">{event.customerName || event.itemSummary}</div>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderWeekView() {
    const weekDates = visibleDateKeys;
    const { visibleSegments, hiddenByDay } = buildWeekSegments(feed.events, weekDates, 8);

    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/90">
          {weekDates.map((dateKey, index) => {
            const isToday = dateKey === toDateKey(new Date());

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => openCreateEditor(dateKey)}
                className="border-r border-slate-200 px-4 py-4 text-left last:border-r-0 hover:bg-slate-100/70"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {WEEKDAY_LABELS[index]}
                </div>
                <div className={`mt-2 text-lg font-semibold ${isToday ? "text-slate-900" : "text-slate-700"}`}>
                  {dateFromKey(dateKey).getUTCDate()}
                </div>
              </button>
            );
          })}
        </div>

        <div className="relative min-h-[25rem] bg-white px-2 py-3">
          <div className="pointer-events-none space-y-2">
            {Array.from({ length: 8 }).map((_, lane) => (
              <div key={lane} className="grid grid-cols-7 gap-2">
                {visibleSegments
                  .filter((segment) => segment.lane === lane)
                  .map((segment) => (
                    <button
                      key={`${segment.event.id}-${lane}`}
                      type="button"
                      onClick={() => setSelectedEventId(segment.event.id)}
                      className={`pointer-events-auto min-h-[4.75rem] rounded-2xl border px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5 ${getToneSurfaceClasses(segment.event.tone)}`}
                      style={{
                        gridColumn: `${segment.startIndex + 1} / span ${segment.endIndex - segment.startIndex + 1}`,
                      }}
                    >
                      <div className="truncate text-xs font-semibold uppercase tracking-[0.14em] opacity-70">
                        {segment.event.statusLabel}
                      </div>
                      <div className="truncate text-sm font-semibold">{segment.event.title}</div>
                      <div className="truncate text-xs opacity-80">
                        {segment.event.customerName || segment.event.contactName || segment.event.itemSummary}
                      </div>
                      <div className="truncate text-xs opacity-70">{segment.event.itemSummary}</div>
                    </button>
                  ))}
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {weekDates.map((dateKey) => (
              <button
                key={dateKey}
                type="button"
                onClick={() => openCreateEditor(dateKey)}
                className="min-h-24 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-3 text-left text-xs text-slate-500 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <div>{hiddenByDay[dateKey] > 0 ? `+${hiddenByDay[dateKey]} weitere Eintraege` : "Neuen Blocker anlegen"}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderDayView() {
    const dateKey = visibleDateKeys[0];
    const dayEvents = feed.events.filter((event) =>
      overlapsDateRange(toDateKey(event.startDate), toDateKey(event.endDate), dateKey, dateKey)
    );

    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{getDayLabel(dateKey)}</h2>
            <p className="text-sm text-slate-500">{dayEvents.length} sichtbare Eintraege</p>
          </div>
          <button
            type="button"
            onClick={() => openCreateEditor(dateKey)}
            className="rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black"
          >
            Blocker fuer diesen Tag
          </button>
        </div>

        <div className="space-y-3 p-6">
          {dayEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Keine Eintraege fuer diesen Tag. Klick oben, um eine interne Blockung anzulegen.
            </div>
          ) : (
            dayEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedEventId(event.id)}
                className={`w-full rounded-2xl border px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 ${getToneSurfaceClasses(event.tone)}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold">{event.title}</span>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${getStatusChipClasses(event.status)}`}>
                    {event.statusLabel}
                  </span>
                </div>
                <div className="mt-2 text-sm">{event.customerName || event.contactName || "Interner Eintrag"}</div>
                <div className="mt-1 text-sm opacity-80">{event.itemSummary}</div>
                <div className="mt-3 text-xs opacity-70">{getEventDateRangeLabel(event)}</div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eff6ff_48%,#ecfeff_100%)] p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm">
              Admin Kalender
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Belegungen, Buchungen und interne Blocker an einem Ort</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Der Kalender zeigt sichtbare Buchungen, markiert blockierende Zeitraeume und erlaubt direkte manuelle Reservierungen
                fuer Items oder den kompletten Bestand.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openCreateEditor(anchorDate)}
              className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-black"
            >
              Manuelle Blockung
            </button>
            <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
              {feed.stats.blockingEvents} blockierende Eintraege im sichtbaren Zeitraum
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Sichtbare Eintraege</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{feed.stats.totalEvents}</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Bestaetigt</div>
            <div className="mt-2 text-2xl font-semibold text-emerald-700">{feed.stats.approvedBookings}</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Offene Anfragen</div>
            <div className="mt-2 text-2xl font-semibold text-amber-700">{feed.stats.requestedBookings}</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Manuelle Blocker</div>
            <div className="mt-2 text-2xl font-semibold text-violet-700">{feed.stats.manualBlockers}</div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {CALENDAR_VIEWS.map((calendarView) => (
              <button
                key={calendarView}
                type="button"
                onClick={() => setView(calendarView)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  view === calendarView ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {calendarView === "month" ? "Monat" : calendarView === "week" ? "Woche" : "Tag"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAnchorDate(shiftAnchorDate(view, anchorDate, -1))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Zurueck
            </button>
            <button
              type="button"
              onClick={() => setAnchorDate(toDateKey(new Date()))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Heute
            </button>
            <button
              type="button"
              onClick={() => setAnchorDate(shiftAnchorDate(view, anchorDate, 1))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Vor
            </button>
            <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{getPeriodLabel(view, anchorDate)}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-[1.1fr_1.1fr_1fr_1fr]">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Suche</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Kunde, Referenz, Item, interner Titel"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-slate-400"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Kategorie</span>
            <select
              value={selectedCategoryId}
              onChange={(event) => {
                const nextCategoryId = event.target.value;
                setSelectedCategoryId(nextCategoryId);
                if (selectedItemId && nextCategoryId) {
                  const selectedItem = items.find((item) => item.id === selectedItemId);
                  if (selectedItem && selectedItem.categoryId !== nextCategoryId) {
                    setSelectedItemId("");
                  }
                }
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-slate-400"
            >
              <option value="">Alle Kategorien</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Item / Produkt</span>
            <select
              value={selectedItemId}
              onChange={(event) => setSelectedItemId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-slate-400"
            >
              <option value="">Alle Items</option>
              {filteredItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2 text-sm">
            <div className="font-medium text-slate-700">Status</div>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUS_OPTIONS.map((option) => {
                const isActive = selectedStatuses.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleStatus(option.value)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                      isActive ? option.chip : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-[0.18em] text-slate-400">Legende</span>
          {ALL_STATUS_OPTIONS.map((option) => (
            <span key={option.value} className={`inline-flex rounded-full border px-2.5 py-1 font-semibold uppercase tracking-[0.16em] ${option.chip}`}>
              {option.label}
            </span>
          ))}
        </div>

        {feed.warnings.map((warning) => (
          <div key={warning} className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {warning}
          </div>
        ))}
        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-sm">
              Kalender wird geladen...
            </div>
          ) : view === "month" ? (
            renderMonthView()
          ) : view === "week" ? (
            renderWeekView()
          ) : (
            renderDayView()
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Details</h2>
              {selectedEvent?.source === "blocker" ? (
                <button
                  type="button"
                  onClick={() => openEditEditor(selectedEvent)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Bearbeiten
                </button>
              ) : null}
            </div>

            {selectedEvent ? (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-slate-900">{selectedEvent.title}</h3>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${getStatusChipClasses(selectedEvent.status)}`}>
                      {selectedEvent.statusLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{getEventDateRangeLabel(selectedEvent)}</p>
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Kontakt / Kunde</div>
                    <div className="mt-1 font-medium text-slate-900">
                      {selectedEvent.customerName || selectedEvent.contactName || "Interner Eintrag"}
                    </div>
                    {selectedEvent.customerEmail ? <div className="mt-1 text-slate-500">{selectedEvent.customerEmail}</div> : null}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Items</div>
                    <div className="mt-1 font-medium text-slate-900">{selectedEvent.itemSummary}</div>
                    {selectedEvent.appliesToAllItems ? <div className="mt-1 text-slate-500">Blockiert den kompletten Bestand.</div> : null}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Wirkung</div>
                    <div className="mt-1 font-medium text-slate-900">{selectedEvent.isBlocking ? "Blockiert Verfuegbarkeit" : "Nur informativ"}</div>
                  </div>
                </div>

                {selectedEvent.description ? (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Notiz</div>
                    <p className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                      {selectedEvent.description}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {selectedEvent.linkHref ? (
                    <Link
                      href={selectedEvent.linkHref}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black"
                    >
                      Zur Buchung
                    </Link>
                  ) : null}
                  {selectedEvent.source === "blocker" && selectedEvent.blockerId ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteBlocker(selectedEvent.blockerId!)}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                    >
                      Loeschen
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm leading-6 text-slate-500">
                Waehle einen Kalendereintrag aus, um Details zu sehen. Leere Tage koennen direkt angeklickt werden, um einen manuellen
                Blocker anzulegen.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Kalender Sync</h2>
              <span className="text-xs text-slate-400">Letzte {feed.recentSyncLogs.length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {feed.recentSyncLogs.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Noch keine Sync-Aufzeichnungen vorhanden.
                </p>
              ) : (
                feed.recentSyncLogs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-900">{log.referenceCode || log.bookingId.slice(0, 8)}</div>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${log.syncStatus === "synced" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : log.syncStatus === "failed" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                        {log.syncStatus}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {log.lastSyncedAt ? new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" }).format(new Date(log.lastSyncedAt)) : "Noch nie synchronisiert"}
                    </div>
                    {log.externalEventId ? <div className="mt-1 truncate font-mono text-[11px] text-slate-400">{log.externalEventId}</div> : null}
                    {log.syncError ? <div className="mt-2 text-xs text-rose-600">{log.syncError}</div> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {editor.open ? (
        <BlockerEditor
          key={`${editor.mode}-${editor.blockerId ?? editor.initialDateKey}`}
          editor={editor}
          items={items}
          categories={categories}
          onClose={() => setEditor({ open: false })}
          onDelete={handleDeleteBlocker}
          onSave={handleSaveEditor}
          saving={isSaving}
        />
      ) : null}
    </div>
  );
}

function BlockerEditor({
  editor,
  items,
  categories,
  onClose,
  onDelete,
  onSave,
  saving,
}: {
  editor: Extract<EditorMode, { open: true }>;
  items: CalendarResourceOption[];
  categories: CalendarCategoryOption[];
  onClose: () => void;
  onDelete: (blockerId: string) => Promise<void>;
  onSave: (editor: Extract<EditorMode, { open: true }>) => Promise<void>;
  saving: boolean;
}) {
  const [formState, setFormState] = useState(editor);
  const [categoryFilter, setCategoryFilter] = useState("");

  const selectableItems = categoryFilter ? items.filter((item) => item.categoryId === categoryFilter) : items;

  function toggleItem(itemId: string) {
    setFormState((current) => ({
      ...current,
      itemIds: current.itemIds.includes(itemId)
        ? current.itemIds.filter((value) => value !== itemId)
        : [...current.itemIds, itemId],
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {formState.mode === "create" ? "Manuelle Blockung anlegen" : "Manuelle Blockung bearbeiten"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Interne Sperrzeiten, Reservierungen oder Wartungen blockieren dieselbe Verfuegbarkeit wie Buchungen.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Schliessen
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-700">Titel</span>
              <input
                value={formState.title}
                onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
                placeholder="z. B. VIP Reservierung, Wartung, gesperrt"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-slate-400"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-slate-700">Status</span>
                <select
                  value={formState.status}
                  onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-slate-400"
                >
                  {MANUAL_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-slate-700">Start</span>
                <input
                  type="date"
                  value={formState.startDate}
                  onChange={(event) => setFormState((current) => ({ ...current, startDate: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-slate-700">Ende</span>
                <input
                  type="date"
                  value={formState.endDate}
                  onChange={(event) => setFormState((current) => ({ ...current, endDate: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-slate-400"
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-700">Kontakt / Notizname</span>
              <input
                value={formState.contactName}
                onChange={(event) => setFormState((current) => ({ ...current, contactName: event.target.value }))}
                placeholder="z. B. Kunde, Team, Eventname"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-700">Beschreibung</span>
              <textarea
                value={formState.description}
                onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
                rows={5}
                placeholder="Interne Hinweise, Anlass, Verantwortliche..."
                className="w-full rounded-2xl border border-slate-200 px-3 py-3 outline-none transition focus:border-slate-400"
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
              <input
                type="checkbox"
                checked={formState.appliesToAllItems}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    appliesToAllItems: event.target.checked,
                    itemIds: event.target.checked ? [] : current.itemIds,
                  }))
                }
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <span>
                <span className="block font-medium text-slate-900">Auf alle Items anwenden</span>
                <span className="mt-1 block text-slate-500">Sperrt den gesamten Bestand fuer den gewaehlten Zeitraum.</span>
              </span>
            </label>

            <div className={`rounded-2xl border border-slate-200 p-4 ${formState.appliesToAllItems ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Betroffene Items</h3>
                  <p className="mt-1 text-sm text-slate-500">Mehrfachauswahl fuer spezifische Produkte oder Ressourcen.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {formState.itemIds.length} ausgewaehlt
                </span>
              </div>

              <label className="mt-4 block space-y-2 text-sm">
                <span className="font-medium text-slate-700">Nach Kategorie filtern</span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  disabled={formState.appliesToAllItems}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-slate-400"
                >
                  <option value="">Alle Kategorien</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                {selectableItems.map((item) => {
                  const checked = formState.itemIds.includes(item.id);

                  return (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                        checked ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={formState.appliesToAllItems}
                        onChange={() => toggleItem(item.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                      <span>
                        <span className="block font-medium">{item.title}</span>
                        <span className={`mt-1 block text-xs ${checked ? "text-slate-200" : "text-slate-500"}`}>{item.categoryName}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-5">
          <div>
            {formState.mode === "edit" && formState.blockerId ? (
              <button
                type="button"
                onClick={() => onDelete(formState.blockerId!)}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
              >
                Blocker loeschen
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => onSave(formState)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black disabled:opacity-50"
            >
              {saving ? "Speichert..." : formState.mode === "create" ? "Blocker anlegen" : "Aenderungen speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
