import { db as prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminEmailsPage() {
  const logs: any[] = []; // Model 'EmailLog' was removed from Prisma schema
  
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold mb-1 text-slate-900">E-Mail Logs</h1>
        <p className="text-sm text-slate-500">Verfolge den Status aller systemgenerierten E-Mails.</p>
      </div>
      
      <div className="admin-surface rounded-[28px] p-4 sm:p-5">
        <div className="admin-table rounded-[26px] overflow-hidden border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="p-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Datum</th>
                <th className="p-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Typ</th>
                <th className="p-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Empfänger</th>
                <th className="p-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Status</th>
                <th className="p-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 text-right">Buchung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="p-4 text-slate-600 whitespace-nowrap">{new Date(log.lastAttemptAt).toLocaleString()}</td>
                <td className="p-4 font-medium text-slate-900">{log.templateType}</td>
                <td className="p-4 text-slate-600">{log.recipientEmail}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-semibold uppercase tracking-wider border shadow-sm ${
                    log.status === 'sent' ? 'bg-green-50 text-green-700 border-green-200' :
                    log.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {log.status}
                  </span>
                  {log.errorText && <p className="text-xs text-red-600 mt-1 max-w-xs truncate" title={log.errorText}>{log.errorText}</p>}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/bookings/${log.bookingId}`} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">{log.booking?.referenceCode || log.bookingId.slice(0,8)}</Link>
                </td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500 bg-white/90">Keine Logs vorhanden.</td></tr>}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
