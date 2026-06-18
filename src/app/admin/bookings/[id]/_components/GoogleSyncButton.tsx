"use client";

import { useState } from "react";
import { RefreshCw, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";

interface GoogleSyncButtonProps {
  bookingId: string;
  syncStatus?: string | null;
  syncError?: string | null;
  htmlLink?: string | null;
}

export function GoogleSyncButton({ bookingId, syncStatus, syncError, htmlLink }: GoogleSyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch(`/api/admin/bookings/${bookingId}/sync`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Fehler beim Synchronisieren");
      }
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setIsSyncing(false);
    }
  };

  const isFailed = syncStatus === "failed";
  const isSynced = syncStatus === "synced";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <span className="text-slate-500">Google Kalender</span>
        <div className="flex items-center gap-2">
          {isFailed && <AlertTriangle className="w-4 h-4 text-red-500" />}
          {isSynced && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          <span className="font-medium text-slate-900">
            {syncStatus === "synced" ? "Synchronisiert" : syncStatus === "failed" ? "Fehlgeschlagen" : syncStatus || "Nicht aktiv"}
          </span>
        </div>
      </div>

      {isFailed && syncError && (
        <div className="rounded-md bg-red-50 p-2 text-xs text-red-700 break-words">
          {syncError}
        </div>
      )}

      {isSynced && htmlLink && (
        <a 
          href={htmlLink} 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Event in Google Calendar öffnen
        </a>
      )}

      {(isFailed || isSynced) && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="mt-2 w-full inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
          Erneut synchronisieren
        </button>
      )}
    </div>
  );
}
