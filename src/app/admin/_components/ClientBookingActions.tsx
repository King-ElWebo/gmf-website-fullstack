"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BookingAction = "approve" | "reject" | "cancel" | "expire";

type ActionConfig = {
  label: string;
  confirmLabel: string;
  endpoint: string;
  needsReason?: boolean;
  className: string;
};

const actionConfig: Record<BookingAction, ActionConfig> = {
  approve: {
    label: "Bestaetigen",
    confirmLabel: "bestaetigen",
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
};

function getAvailableActions(status: string): BookingAction[] {
  if (status === "requested") return ["approve", "reject", "cancel", "expire"];
  if (status === "approved") return ["cancel"];
  return [];
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unbekannter Fehler";
}

export function ClientBookingActions({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<BookingAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const actions = getAvailableActions(currentStatus);

  async function handleAction(action: BookingAction) {
    const config = actionConfig[action];
    if (!confirm(`Diese Anfrage wirklich ${config.confirmLabel}?`)) return;

    let payload: Record<string, string> | undefined;
    if (config.needsReason) {
      const reason = prompt("Interner Grund / Hinweis zur Statusaenderung:");
      if (!reason?.trim()) return;
      payload = { reasonDetails: reason.trim() };
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
        throw new Error(data.error || "Status konnte nicht geaendert werden");
      }

      router.refresh();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoadingAction(null);
    }
  }

  if (actions.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
        Fuer diesen Status sind keine direkten Aktionen verfuegbar.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const config = actionConfig[action];
          return (
            <button
              key={action}
              disabled={loadingAction !== null}
              onClick={() => handleAction(action)}
              className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${config.className}`}
            >
              {loadingAction === action ? "Wird gespeichert..." : config.label}
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
