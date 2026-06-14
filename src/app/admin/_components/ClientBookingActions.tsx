"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";

type BookingAction = "approve" | "reject" | "cancel" | "expire" | "archive" | "unarchive" | "delete";

type ActionConfig = {
  label: string;
  confirmLabel: string;
  endpoint: string;
  needsReason?: boolean;
  className: string;
};

const actionConfig: Record<BookingAction, ActionConfig> = {
  approve: {
    label: "Bestätigen",
    confirmLabel: "bestätigen",
    endpoint: "approve",
    className: "bg-green-600 text-white hover:bg-green-700",
  },
  reject: {
    label: "Ablehnen",
    confirmLabel: "ablehnen",
    endpoint: "reject",
    needsReason: true,
    className: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  },
  cancel: {
    label: "Stornieren",
    confirmLabel: "stornieren",
    endpoint: "cancel",
    needsReason: true,
    className: "border border-neutral-300 bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
  },
  expire: {
    label: "Als abgelaufen markieren",
    confirmLabel: "als abgelaufen markieren",
    endpoint: "expire",
    className: "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
  },
  archive: {
    label: "Archivieren",
    confirmLabel: "archivieren",
    endpoint: "archive",
    needsReason: true,
    className: "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400",
  },
  unarchive: {
    label: "Aus Archiv holen",
    confirmLabel: "wiederherstellen",
    endpoint: "unarchive",
    className: "bg-blue-600 text-white hover:bg-blue-700",
  },
  delete: {
    label: "Endgültig löschen",
    confirmLabel: "endgültig löschen (Achtung: Dies löscht alle zugehörigen Daten wie Notizen, Artikel und Kundendaten unwiderruflich!)",
    endpoint: "delete",
    className: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  },
};

function getAvailableActions(status: string, isArchived: boolean): BookingAction[] {
  if (isArchived) {
    return ["unarchive"];
  }

  const actions: BookingAction[] = [];
  if (status === "requested") {
    actions.push("approve", "reject", "cancel", "expire");
  } else if (status === "approved") {
    actions.push("cancel");
  }

  actions.push("archive");
  return actions;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unbekannter Fehler";
}

export function ClientBookingActions({
  bookingId,
  currentStatus,
  isArchived,
  isApprovedFuture
}: {
  bookingId: string;
  currentStatus: string;
  isArchived: boolean;
  isApprovedFuture: boolean;
}) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<BookingAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const actions = getAvailableActions(currentStatus, isArchived);

  async function handleAction(action: BookingAction) {
    const config = actionConfig[action];

    if (action === "archive" && isApprovedFuture) {
      if (!confirm("Warnung: Diese Buchung ist bestätigt und liegt in der Zukunft. Sie blockiert weiterhin Verfügbarkeiten, wird aber aus den aktiven Listen ausgeblendet. Fortfahren?")) {
        return;
      }
    } else {
      if (!confirm(`Diese Anfrage wirklich ${config.confirmLabel}?`)) return;
    }

    let payload: Record<string, string> | undefined;
    if (config.needsReason) {
      const reason = prompt(action === "archive" ? "Grund für die Archivierung (optional):" : "Interner Grund / Hinweis zur Statusänderung:");
      if (action === "archive") {
        payload = { reasonDetails: reason?.trim() || "Kein Grund angegeben" };
      } else {
        if (!reason?.trim()) return;
        payload = { reasonDetails: reason.trim() };
      }
    }

    setLoadingAction(action);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/${config.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ?? {}),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Status konnte nicht geändert werden");
      }

      router.refresh();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const config = actionConfig[action];
          const isArchiveBtn = action === "archive";
          const isUnarchiveBtn = action === "unarchive";

          return (
            <button
              key={action}
              disabled={loadingAction !== null}
              onClick={() => handleAction(action)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${config.className}`}
            >
              {isArchiveBtn && <Archive className="h-4 w-4" />}
              {isUnarchiveBtn && <ArchiveRestore className="h-4 w-4" />}
              {loadingAction === action ? "Wird gespeichert..." : config.label}
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}

export function ClientBookingDeleteButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const config = actionConfig["delete"];
    if (!confirm(`Diese Buchung wirklich ${config.confirmLabel}?`)) return;
    if (!confirm("Sind Sie absolut sicher? Dies kann nicht rückgängig gemacht werden!")) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Buchung konnte nicht gelöscht werden");
      }

      router.push("/admin/bookings");
      router.refresh();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        disabled={loading}
        onClick={handleDelete}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        {loading ? "Lösche..." : "Buchung endgültig löschen"}
      </button>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
