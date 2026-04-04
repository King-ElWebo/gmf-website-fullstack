import type { CalendarView } from "./types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function dateFromKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export function toDateKey(input: string | Date) {
  const date = input instanceof Date ? input : new Date(input);
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_IN_MS);
}

export function addMonths(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

export function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function endOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

export function startOfWeek(date: Date) {
  const day = date.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(date, offset);
}

export function endOfWeek(date: Date) {
  return addDays(startOfWeek(date), 6);
}

export function getRangeForView(view: CalendarView, anchorDateKey: string) {
  const anchor = dateFromKey(anchorDateKey);

  if (view === "week") {
    return {
      from: toDateKey(startOfWeek(anchor)),
      to: toDateKey(endOfWeek(anchor)),
    };
  }

  if (view === "day") {
    return {
      from: anchorDateKey,
      to: anchorDateKey,
    };
  }

  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);

  return {
    from: toDateKey(startOfWeek(monthStart)),
    to: toDateKey(endOfWeek(monthEnd)),
  };
}

export function shiftAnchorDate(view: CalendarView, anchorDateKey: string, direction: -1 | 1) {
  const anchor = dateFromKey(anchorDateKey);

  if (view === "week") {
    return toDateKey(addDays(anchor, direction * 7));
  }

  if (view === "day") {
    return toDateKey(addDays(anchor, direction));
  }

  return toDateKey(addMonths(anchor, direction));
}

export function getDatesBetween(fromKey: string, toKey: string) {
  const dates: string[] = [];
  let cursor = dateFromKey(fromKey);
  const end = dateFromKey(toKey);

  while (cursor <= end) {
    dates.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
}

export function countDaysInclusive(fromKey: string, toKey: string) {
  const from = dateFromKey(fromKey).getTime();
  const to = dateFromKey(toKey).getTime();
  return Math.floor((to - from) / DAY_IN_MS) + 1;
}

export function clampDateKey(dateKey: string, minKey: string, maxKey: string) {
  if (dateKey < minKey) return minKey;
  if (dateKey > maxKey) return maxKey;
  return dateKey;
}

export function overlapsDateRange(startKey: string, endKey: string, fromKey: string, toKey: string) {
  return startKey <= toKey && endKey >= fromKey;
}

export function getMonthLabel(anchorDateKey: string) {
  return new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateFromKey(anchorDateKey));
}

export function getWeekLabel(anchorDateKey: string) {
  const { from, to } = getRangeForView("week", anchorDateKey);
  const formatter = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });

  return `${formatter.format(dateFromKey(from))} - ${formatter.format(dateFromKey(to))}`;
}

export function getDayLabel(anchorDateKey: string) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dateFromKey(anchorDateKey));
}
