import { PrismaBookingRepository } from '@/lib/booking-core/infrastructure/database/PrismaBookingRepository';
import { BookingStatusBadge } from '../../_components/BookingStatusBadge';
import { ClientBookingActions } from '../../_components/ClientBookingActions';
import { NotesSection } from '../../_components/NotesSection';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const repo = new PrismaBookingRepository();
  const booking: Record<string, any> | null = await repo.findById(resolvedParams.id) as any;

  if (!booking) return <div className="p-8 text-center text-neutral-500">Buchung nicht gefunden.</div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-6">
        <div>
           <Link href="/admin/bookings" className="text-xs font-semibold text-neutral-400 hover:text-black uppercase tracking-wider mb-2 inline-block transition-colors">&larr; Zurück zur Liste</Link>
           <div className="flex items-center gap-3 mb-1">
             <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{booking.referenceCode}</h1>
             <BookingStatusBadge status={booking.status} />
           </div>
           <p className="text-sm font-medium text-neutral-500">Erstellt am {new Date(booking.createdAt).toLocaleString('de-DE')} Uhr</p>
        </div>
        <ClientBookingActions bookingId={booking.id} currentStatus={booking.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
             <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-100">
               <h2 className="font-semibold text-neutral-800">Kundendaten</h2>
             </div>
             <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
               <div><span className="block font-semibold text-neutral-400 text-[10px] uppercase tracking-wider mb-1">Name</span><span className="font-medium text-neutral-800">{booking.customer.firstName} {booking.customer.lastName}</span></div>
               <div><span className="block font-semibold text-neutral-400 text-[10px] uppercase tracking-wider mb-1">Email</span><span className="text-neutral-800">{booking.customer.email}</span></div>
               <div><span className="block font-semibold text-neutral-400 text-[10px] uppercase tracking-wider mb-1">Telefon</span><span className="text-neutral-800">{booking.customer.phone || '-'}</span></div>
               <div>
                  <span className="block font-semibold text-neutral-400 text-[10px] uppercase tracking-wider mb-1">Adresse</span>
                  <span className="text-neutral-800">
                    {booking.customer.addressLine1 ? <>{booking.customer.addressLine1}<br/>{booking.customer.zip} {booking.customer.city}</> : '-'}
                  </span>
               </div>
             </div>
           </div>

           <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
             <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-100 flex justify-between items-center">
               <h2 className="font-semibold text-neutral-800">Angebotsdetails</h2>
               <span className="text-xs bg-white border border-neutral-200 px-3 py-1 rounded-md text-neutral-700 font-medium">
                 {new Date(booking.startDate).toLocaleDateString('de-DE')} - {new Date(booking.endDate).toLocaleDateString('de-DE')}
               </span>
             </div>
             <table className="w-full text-sm text-left">
               <thead className="bg-neutral-50/50 border-b border-neutral-100">
                 <tr>
                    <th className="px-5 py-3 font-medium text-neutral-500">Ressource / Item-ID</th>
                    <th className="px-5 py-3 font-medium text-neutral-500 text-right">Menge</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-neutral-100">
                 {booking.items.map((item: any) => (
                   <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                     <td className="px-5 py-4 font-medium text-neutral-800">{item.itemId}</td>
                     <td className="px-5 py-4 text-right font-medium text-neutral-800">{item.quantity}x</td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {booking.customerMessage && (
               <div className="p-5 border-t border-neutral-100 bg-neutral-50/50">
                 <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Nachricht des Kunden</p>
                 <p className="text-sm text-neutral-700 italic border-l-2 border-neutral-300 pl-3 leading-relaxed">{booking.customerMessage}</p>
               </div>
             )}
           </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6">
             <NotesSection bookingId={booking.id} initialNotes={booking.notes || []} />
           </div>
           
           <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 space-y-5">
             <h3 className="text-sm font-bold text-neutral-800 tracking-wide uppercase">Meta Daten</h3>
             <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-neutral-100 pb-3"><span className="text-neutral-500">Lieferart</span><span className="font-medium capitalize text-neutral-800">{booking.deliveryType}</span></div>
                <div className="flex justify-between border-b border-neutral-100 pb-3"><span className="text-neutral-500">Mail Logs</span><span className="font-medium text-neutral-800">{(booking as any).emailLogs?.length || 0} Events</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Calendar Sync</span><span className="font-medium text-neutral-800">{(booking as any).calendarSync ? 'Aktiv' : 'Fehlt'}</span></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
