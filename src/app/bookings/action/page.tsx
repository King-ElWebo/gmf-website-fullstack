import { createAdminBookingCommands } from "@/lib/booking-core/server";
import { PrismaBookingRepository } from "@/lib/booking-core/infrastructure/database/PrismaBookingRepository";
import { verifyActionToken } from "@/lib/email/security";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Package,
  ArrowRight,
  Info
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    bookingId?: string;
    action?: string;
    expiresAt?: string;
    token?: string;
  }>;
}

function formatDateDE(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function renderErrorCard(title: string, message: string, referenceCode?: string, isConflict = false) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-rose-50 to-orange-50 p-4 font-[family-name:var(--font-nunito)]">
      <div className="backdrop-blur-md bg-white/90 border border-slate-200/50 shadow-2xl rounded-3xl p-8 md:p-12 max-w-xl w-full text-center transform transition-all duration-300 hover:scale-[1.01] hover:shadow-rose-100/40">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 border border-rose-100 text-rose-500 mb-6 animate-pulse">
          {isConflict ? <AlertTriangle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
        </div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl md:text-3xl font-bold text-slate-800 mb-3 tracking-tight">
          {title}
        </h1>
        {referenceCode && (
          <div className="inline-block bg-slate-100 border border-slate-200 rounded-full px-4 py-1 text-xs font-bold text-slate-600 mb-4 uppercase tracking-wider">
            Ref: {referenceCode}
          </div>
        )}
        <p className="text-slate-600 text-base md:text-lg mb-8 leading-relaxed">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition duration-150 shadow-md"
          >
            Zum Admin-Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function renderAlreadyProcessedCard(
  referenceCode: string,
  status: string,
  startDate: Date,
  endDate: Date,
  customerName: string
) {
  const isApproved = status.toLowerCase() === "angenommen" || status.toLowerCase() === "approved";
  const badgeColor = isApproved
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : status.toLowerCase() === "abgelehnt" || status.toLowerCase() === "rejected"
    ? "bg-rose-50 text-rose-700 border-rose-100"
    : "bg-amber-50 text-amber-700 border-amber-100";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 font-[family-name:var(--font-nunito)]">
      <div className="backdrop-blur-md bg-white/90 border border-slate-200/50 shadow-2xl rounded-3xl p-8 md:p-12 max-w-xl w-full text-center transform transition-all duration-300 hover:scale-[1.01] hover:shadow-blue-100/40">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 border border-blue-100 text-blue-500 mb-6">
          <Info className="w-10 h-10" />
        </div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl md:text-3xl font-bold text-slate-800 mb-3 tracking-tight">
          Bereits bearbeitet
        </h1>
        <div className="inline-block bg-slate-100 border border-slate-200 rounded-full px-4 py-1 text-xs font-bold text-slate-600 mb-6 uppercase tracking-wider">
          Ref: {referenceCode}
        </div>
        
        <p className="text-slate-600 text-base md:text-lg mb-6 leading-relaxed">
          Diese Anfrage wurde bereits bearbeitet und befindet sich in folgendem Status:
        </p>

        <div className={`inline-flex items-center justify-center px-6 py-2 rounded-full border font-bold text-lg mb-8 ${badgeColor}`}>
          {status}
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left space-y-3">
          <div className="flex items-center gap-3 text-slate-600 text-sm">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span><strong>Kunde:</strong> {customerName}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 text-sm">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span><strong>Zeitraum:</strong> {formatDateDE(startDate)} bis {formatDateDE(endDate)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition duration-150 shadow-md w-full sm:w-auto"
          >
            Zur Buchungsübersicht
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function renderSuccessCard(
  title: string,
  message: string,
  referenceCode: string,
  startDate: Date,
  endDate: Date,
  customerName: string,
  items: any[],
  isApproved: boolean
) {
  const themeGradient = isApproved
    ? "from-slate-50 via-emerald-50 to-teal-50"
    : "from-slate-50 via-rose-50 to-orange-50";

  const shadowHover = isApproved
    ? "hover:shadow-emerald-100/40"
    : "hover:shadow-rose-100/40";

  const iconBg = isApproved
    ? "bg-emerald-50 border-emerald-100 text-emerald-500"
    : "bg-rose-50 border-rose-100 text-rose-500";

  return (
    <div className={`min-h-screen w-full flex items-center justify-center bg-gradient-to-br ${themeGradient} p-4 font-[family-name:var(--font-nunito)]`}>
      <div className={`backdrop-blur-md bg-white/90 border border-slate-200/50 shadow-2xl rounded-3xl p-8 md:p-12 max-w-xl w-full text-center transform transition-all duration-300 hover:scale-[1.01] ${shadowHover}`}>
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border mb-6 ${iconBg}`}>
          {isApproved ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
        </div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl md:text-3xl font-bold text-slate-800 mb-3 tracking-tight">
          {title}
        </h1>
        <div className="inline-block bg-slate-100 border border-slate-200 rounded-full px-4 py-1 text-xs font-bold text-slate-600 mb-6 uppercase tracking-wider">
          Ref: {referenceCode}
        </div>
        
        <p className="text-slate-600 text-base md:text-lg mb-8 leading-relaxed">
          {message}
        </p>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 text-left space-y-4">
          <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b border-slate-200/60 pb-2">Details zur Buchung</h4>
          
          <div className="flex items-center gap-3 text-slate-600 text-sm">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span><strong>Kunde:</strong> {customerName}</span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-600 text-sm">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span><strong>Zeitraum:</strong> {formatDateDE(startDate)} bis {formatDateDE(endDate)}</span>
          </div>

          {items && items.length > 0 && (
            <div className="pt-2">
              <div className="flex items-start gap-3 text-slate-600 text-sm">
                <Package className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong>Produkte:</strong>
                  <ul className="mt-1 space-y-1 pl-4 list-disc text-slate-500">
                    {items.map((item, idx) => (
                      <li key={idx}>
                        {item.resourceTitle || item.title || "Produkt"} (x{item.quantity})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition duration-150 shadow-md w-full sm:w-auto"
          >
            Zur Buchungsübersicht
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function BookingActionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { bookingId, action, expiresAt, token } = params;

  // 1. Parameter Validation
  if (!bookingId || !action || !expiresAt || !token) {
    return renderErrorCard(
      "Ungültiger Link",
      "Der Aktionslink ist unvollständig oder ungültig. Bitte verwenden Sie die Links aus der offiziellen Benachrichtigungs-E-Mail."
    );
  }

  if (action !== "approve" && action !== "reject") {
    return renderErrorCard(
      "Ungültige Aktion",
      "Die angeforderte Aktion ist nicht zulässig."
    );
  }

  // 2. Cryptographic Verification
  const expiresAtMs = parseInt(expiresAt, 10);
  const isSignatureValid = verifyActionToken(
    bookingId,
    action as "approve" | "reject",
    expiresAtMs,
    token
  );

  if (!isSignatureValid) {
    return renderErrorCard(
      "Link ungültig oder abgelaufen",
      "Die Sicherheits-Signatur dieses Links ist ungültig oder der Link ist bereits abgelaufen (Gültigkeit: 7 Tage)."
    );
  }

  // 3. Database Check & Fetching Booking
  const bookingRepo = new PrismaBookingRepository();
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    return renderErrorCard(
      "Anfrage nicht gefunden",
      `Die Buchungsanfrage mit der ID "${bookingId}" wurde nicht im System gefunden.`
    );
  }

  // 4. Double Processing Prevention
  if (booking.status !== "requested") {
    let statusGerman: string = booking.status;
    if (booking.status === "approved") statusGerman = "Angenommen";
    if (booking.status === "rejected") statusGerman = "Abgelehnt";
    if (booking.status === "cancelled") statusGerman = "Storniert";
    if (booking.status === "expired") statusGerman = "Abgelaufen";

    return renderAlreadyProcessedCard(
      booking.referenceCode,
      statusGerman,
      booking.startDate,
      booking.endDate,
      `${booking.customer?.firstName} ${booking.customer?.lastName}`
    );
  }

  // 5. Execute Command
  const adminCommands = createAdminBookingCommands();
  const adminId = "system-admin";

  try {
    if (action === "approve") {
      await adminCommands.approveBooking(bookingId, adminId);
      return renderSuccessCard(
        "Anfrage angenommen",
        `Die Anfrage ${booking.referenceCode} wurde erfolgreich bestätigt. Der Kunde wurde per E-Mail benachrichtigt.`,
        booking.referenceCode,
        booking.startDate,
        booking.endDate,
        `${booking.customer?.firstName} ${booking.customer?.lastName}`,
        booking.items,
        true
      );
    } else {
      await adminCommands.rejectBooking(bookingId, "Abgelehnt via E-Mail-Direktlink", adminId);
      return renderSuccessCard(
        "Anfrage abgelehnt",
        `Die Anfrage ${booking.referenceCode} wurde abgelehnt. Der Kunde wurde per E-Mail benachrichtigt.`,
        booking.referenceCode,
        booking.startDate,
        booking.endDate,
        `${booking.customer?.firstName} ${booking.customer?.lastName}`,
        booking.items,
        false
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten.";
    
    // Check if it was an availability conflict
    const isConflict = message.toLowerCase().includes("conflict") || message.toLowerCase().includes("konflikt") || message.toLowerCase().includes("ausgebucht");

    return renderErrorCard(
      isConflict ? "Verfügbarkeitskonflikt" : "Aktion fehlgeschlagen",
      message,
      booking.referenceCode,
      isConflict
    );
  }
}
