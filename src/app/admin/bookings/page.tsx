import Link from 'next/link';
import { PrismaBookingRepository } from '@/lib/booking-core/infrastructure/database/PrismaBookingRepository';
import { BookingStatusBadge } from '../_components/BookingStatusBadge';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage({ searchParams }: { searchParams: { status?: string, page?: string } }) {
  const repo = new PrismaBookingRepository();
  const page = parseInt(searchParams.page || '1');
  const filters: any = {};
  if (searchParams.status) filters.statuses = [searchParams.status];
  
  const result = await repo.findForAdminView(filters, page, 50);
  const bookings = result.data;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Buchungen</h1>
          <p className="text-sm text-neutral-600">Verwalte alle eingehenden und bestätigten Anfragen.</p>
        </div>
        <div className="flex gap-2 bg-neutral-100 p-1 rounded-lg">
           <Link href="/admin/bookings" className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${!searchParams.status ? 'bg-white shadow-sm text-black' : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'}`}>Alle</Link>
           <Link href="/admin/bookings?status=requested" className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${searchParams.status === 'requested' ? 'bg-white shadow-sm text-yellow-700' : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'}`}>Offen</Link>
           <Link href="/admin/bookings?status=approved" className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${searchParams.status === 'approved' ? 'bg-white shadow-sm text-green-700' : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'}`}>Bestätigt</Link>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50/80 border-b">
            <tr>
              <th className="p-4 font-medium text-neutral-600">Referenz</th>
              <th className="p-4 font-medium text-neutral-600">Kunde</th>
              <th className="p-4 font-medium text-neutral-600">Zeitraum</th>
              <th className="p-4 font-medium text-neutral-600 text-center">Status</th>
              <th className="p-4 font-medium text-neutral-600 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b: any) => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-neutral-50/50 transition-colors">
                <td className="p-4 font-medium text-neutral-800">
                  <Link href={`/admin/bookings/${b.id}`} className="hover:underline text-blue-800">{b.referenceCode}</Link>
                </td>
                <td className="p-4 text-neutral-600">{b.customer?.firstName} {b.customer?.lastName}</td>
                <td className="p-4 text-neutral-600">
                  {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                </td>
                <td className="p-4 text-center">
                  <BookingStatusBadge status={b.status} />
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/bookings/${b.id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium px-2 py-1">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500 bg-neutral-50/30">
                  Keine Buchungen gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
