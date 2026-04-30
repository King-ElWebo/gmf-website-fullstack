type StatusMeta = {
  label: string;
  className: string;
};

const statusMeta: Record<string, StatusMeta> = {
  requested: {
    label: "Offen",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  approved: {
    label: "Bestaetigt",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  rejected: {
    label: "Abgelehnt",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  cancelled: {
    label: "Storniert",
    className: "border-neutral-200 bg-neutral-100 text-neutral-700",
  },
  expired: {
    label: "Abgelaufen",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  completed: {
    label: "Abgeschlossen",
    className: "border-blue-200 bg-blue-50 text-blue-800",
  },
};

export function BookingStatusBadge({ status }: { status: string }) {
  const meta = statusMeta[status] ?? {
    label: status,
    className: "border-neutral-200 bg-neutral-100 text-neutral-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
