export const CALENDAR_VIEWS = ["month", "week", "day"] as const;

export type CalendarView = (typeof CALENDAR_VIEWS)[number];

export const BOOKING_BLOCKING_STATUSES = ["approved", "requested"] as const;

export const BOOKING_STATUS_META: Record<
  string,
  {
    label: string;
    tone: string;
    chip: string;
  }
> = {
  requested: {
    label: "Angefragt",
    tone: "amber",
    chip: "bg-amber-100 text-amber-800 border-amber-200",
  },
  approved: {
    label: "Bestaetigt",
    tone: "emerald",
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  rejected: {
    label: "Abgelehnt",
    tone: "rose",
    chip: "bg-rose-100 text-rose-800 border-rose-200",
  },
  cancelled: {
    label: "Storniert",
    tone: "slate",
    chip: "bg-slate-100 text-slate-700 border-slate-200",
  },
  expired: {
    label: "Abgelaufen",
    tone: "zinc",
    chip: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
  completed: {
    label: "Abgeschlossen",
    tone: "sky",
    chip: "bg-sky-100 text-sky-800 border-sky-200",
  },
};

export const MANUAL_BLOCKER_STATUS_META: Record<
  string,
  {
    label: string;
    tone: string;
    chip: string;
  }
> = {
  blocked: {
    label: "Sperrzeit",
    tone: "violet",
    chip: "bg-violet-100 text-violet-800 border-violet-200",
  },
  reservation: {
    label: "Interne Reservierung",
    tone: "cyan",
    chip: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  maintenance: {
    label: "Wartung",
    tone: "fuchsia",
    chip: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  },
};

export interface CalendarResourceOption {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
}

export interface CalendarCategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface AdminCalendarEvent {
  id: string;
  source: "booking" | "blocker";
  sourceId: string;
  bookingId: string | null;
  blockerId: string | null;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  statusLabel: string;
  itemSummary: string;
  itemNames: string[];
  itemIds: string[];
  categoryIds: string[];
  customerName: string | null;
  customerEmail: string | null;
  description: string | null;
  referenceCode: string | null;
  contactName: string | null;
  appliesToAllItems: boolean;
  isBlocking: boolean;
  linkHref: string | null;
  tone: string;
  syncStatus: string | null;
}

export interface AdminCalendarStats {
  totalEvents: number;
  blockingEvents: number;
  approvedBookings: number;
  requestedBookings: number;
  manualBlockers: number;
}

export interface CalendarSyncLogSummary {
  id: string;
  bookingId: string;
  referenceCode: string | null;
  externalEventId: string | null;
  syncStatus: string;
  lastSyncedAt: string | null;
  syncError: string | null;
}

export interface AdminCalendarFeed {
  range: {
    from: string;
    to: string;
  };
  events: AdminCalendarEvent[];
  stats: AdminCalendarStats;
  recentSyncLogs: CalendarSyncLogSummary[];
  warnings: string[];
}
