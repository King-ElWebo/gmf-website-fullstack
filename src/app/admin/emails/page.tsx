import { db as prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminEmailsPage() {
  const logs: any[] = []; // Model 'EmailLog' was removed from Prisma schema
  
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold mb-1">E-Mail Logs</h1>
        <p className="text-sm text-neutral-600">Verfolge den Status aller systemgenerierten E-Mails.</p>
      </div>
      
      <div className="rounded-xl border overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50/80 border-b border-neutral-200">
            <tr>
              <th className="p-4 font-medium text-neutral-600">Datum</th>
              <th className="p-4 font-medium text-neutral-600">Typ</th>
              <th className="p-4 font-medium text-neutral-600">Empfänger</th>
              <th className="p-4 font-medium text-neutral-600">Status</th>
              <th className="p-4 font-medium text-neutral-600 text-right">Buchung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="p-4 text-neutral-600 whitespace-nowrap">{new Date(log.lastAttemptAt).toLocaleString()}</td>
                <td className="p-4 font-medium text-neutral-800">{log.templateType}</td>
                <td className="p-4 text-neutral-600">{log.recipientEmail}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide border shadow-sm ${
                    log.status === 'sent' ? 'bg-green-50 text-green-700 border-green-200' :
                    log.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {log.status}
                  </span>
                  {log.errorText && <p className="text-xs text-red-500 mt-1 max-w-xs truncate" title={log.errorText}>{log.errorText}</p>}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/bookings/${log.bookingId}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">{log.booking?.referenceCode || log.bookingId.slice(0,8)}</Link>
                </td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-neutral-500 bg-neutral-50/30">Keine Logs vorhanden.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
