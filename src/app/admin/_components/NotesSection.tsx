"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

type InternalNoteView = {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date | string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Notiz konnte nicht gespeichert werden";
}

export function NotesSection({
  bookingId,
  initialNotes,
}: {
  bookingId: string;
  initialNotes: InternalNoteView[];
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmedContent }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Notiz konnte nicht gespeichert werden");
      }

      setContent("");
      router.refresh();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-800">Interne Notizen</h3>
        <p className="mt-1 text-xs text-neutral-500">Nur im Admin sichtbar, wird nicht an Kunden gesendet.</p>
      </div>

      <div className="max-h-72 space-y-3 overflow-y-auto pr-2">
        {initialNotes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
            Bisher keine internen Notizen.
          </p>
        ) : (
          initialNotes.map((note) => (
            <div key={note.id} className="rounded-xl border border-yellow-200 bg-yellow-50/80 p-3 text-sm shadow-sm">
              <p className="whitespace-pre-line leading-relaxed text-neutral-800">{note.content}</p>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                {new Date(note.createdAt).toLocaleString("de-DE")} - {note.authorId}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={addNote} className="flex flex-col gap-3 border-t border-neutral-100 pt-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Neue interne Notiz hinzufuegen..."
          className="w-full resize-none rounded-lg border border-neutral-200 p-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          rows={4}
        />
        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        <button
          disabled={loading || !content.trim()}
          className="self-end rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Speichert..." : "Notiz speichern"}
        </button>
      </form>
    </div>
  );
}
