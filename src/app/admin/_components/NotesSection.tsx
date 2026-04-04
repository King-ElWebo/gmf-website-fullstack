'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function NotesSection({ bookingId, initialNotes }: { bookingId: string, initialNotes: any[] }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/bookings/${bookingId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      setContent('');
      router.refresh();
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-bold text-neutral-800 tracking-wide uppercase">Interne Notizen</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
         {initialNotes.length === 0 ? <p className="text-sm text-neutral-500 italic py-2">Bisher keine internen Notizen.</p> : 
          initialNotes.map((note) => (
           <div key={note.id} className="bg-yellow-50/80 border border-yellow-200/60 p-3 rounded-xl text-sm shadow-sm">
             <p className="text-neutral-800 leading-relaxed">{note.content}</p>
             <p className="text-[10px] font-medium text-neutral-500 mt-2 uppercase tracking-wider">{new Date(note.createdAt).toLocaleString('de-DE')} • {note.authorId}</p>
           </div>
         ))}
      </div>
      <form onSubmit={addNote} className="flex flex-col gap-3 pt-3 border-t border-neutral-100">
         <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Neue Notiz hinzufügen..." className="w-full text-sm rounded-lg border-neutral-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border outline-none resize-none transition-shadow" rows={3}></textarea>
         <button disabled={loading} className="self-end bg-neutral-900 hover:bg-black text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-50">Speichern</button>
      </form>
    </div>
  );
}
