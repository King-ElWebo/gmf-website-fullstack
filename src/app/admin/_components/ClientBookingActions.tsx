'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ClientBookingActions({ bookingId, currentStatus }: { bookingId: string, currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: 'approve' | 'reject' | 'cancel') {
    if (!confirm(`Bist du sicher, dass du diese Buchung ${action === 'approve' ? 'bestätigen' : action === 'reject' ? 'ablehnen' : 'stornieren'} möchtest?`)) return;
    setLoading(true);
    let payload = {};
    if (action === 'reject' || action === 'cancel') {
        const reason = prompt(`Grund für ${action}:`);
        if (!reason) { setLoading(false); return; }
        payload = { reasonDetails: reason };
    }

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.error);
      }
      router.refresh();
    } catch (e: any) {
      alert(`Fehler: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === 'completed' || currentStatus === 'cancelled' || currentStatus === 'rejected') return null;

  return (
    <div className="flex gap-2">
      {currentStatus === 'requested' && (
         <button disabled={loading} onClick={() => handleAction('approve')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 tracking-wide">
           Bestätigen
         </button>
      )}
      {(currentStatus === 'requested' || currentStatus === 'approved') && (
         <>
           {currentStatus === 'requested' && <button disabled={loading} onClick={() => handleAction('reject')} className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50">Ablehnen</button>}
           {currentStatus === 'approved' && <button disabled={loading} onClick={() => handleAction('cancel')} className="bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-300 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50">Stornieren</button>}
         </>
      )}
    </div>
  );
}
