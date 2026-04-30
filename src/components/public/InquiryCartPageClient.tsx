"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingCart, AlertTriangle, ShieldCheck, Clock, CloudRain, Info } from "lucide-react";
import { Button } from "@/components/public/Button";
import { Input } from "@/components/public/Input";
import { Textarea } from "@/components/public/Textarea";
import { DateRangePicker } from "@/components/public/DateRangePicker";
import "@/components/public/DateRangePicker.css";
import { useInquiryCart } from "@/components/public/InquiryCartProvider";
import { formatPriceCents } from "@/lib/items/price";
import { calculateInquiryCartItemPrice, getBookingDurationDays } from "@/lib/inquiry-cart/pricing";
import type { InquiryBookingRequestPayload } from "@/lib/inquiry-cart/request-payload";

type FormState = {
    startDate: string;
    endDate: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    zip: string;
    city: string;
    deliveryType: "pickup" | "delivery";
    billingAddressDiffers: boolean;
    billingCustomerType: "private" | "business";
    billingFirstName: string;
    billingLastName: string;
    billingCompanyName: string;
    billingAddressLine1: string;
    billingZip: string;
    billingCity: string;
    billingCountry: string;
    message: string;
};

type AvailabilityItemDetail = {
    resourceId: string;
    requestedQuantity: number;
    availableQuantity: number | null;
    totalStock: number | null;
    trackInventory: boolean;
    isAvailable: boolean;
};

const initialFormState: FormState = {
    startDate: "",
    endDate: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    zip: "",
    city: "",
    deliveryType: "pickup",
    billingAddressDiffers: false,
    billingCustomerType: "private",
    billingFirstName: "",
    billingLastName: "",
    billingCompanyName: "",
    billingAddressLine1: "",
    billingZip: "",
    billingCity: "",
    billingCountry: "",
    message: "",
};

function formatDateKeyForDisplay(dateKey: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
    if (!match) return dateKey;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat("de-AT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

function getPricingReasonLabel(reason: string | null) {
    if (!reason) return null;

    switch (reason) {
        case "missing_date_range":
            return "Bitte zuerst den Zeitraum auswaehlen.";
        case "invalid_date_range":
            return "Ungueltiger Zeitraum.";
        case "duration_over_limit":
            return "Ab 4 Tagen wird ein individueller Preis angeboten.";
        case "on_request_price":
            return "Preis auf Anfrage.";
        case "from_price":
            return "Ab-Preis: wird individuell bestaetigt.";
        case "missing_base_price":
            return "Kein Basispreis hinterlegt.";
        case "invalid_quantity":
            return "Ungueltige Menge.";
        default:
            return "Preis wird individuell berechnet.";
    }
}

function getCustomerBillingName(formState: FormState) {
    return `${formState.firstName} ${formState.lastName}`.trim();
}

function isSeparateBillingAddressComplete(formState: FormState) {
    if (!formState.billingAddressDiffers) return true;

    const hasName = formState.billingCustomerType === "private"
        ? Boolean(formState.billingFirstName.trim() && formState.billingLastName.trim())
        : Boolean(formState.billingCompanyName.trim());

    return Boolean(
        hasName &&
        formState.billingAddressLine1.trim() &&
        formState.billingZip.trim() &&
        formState.billingCity.trim()
    );
}

function resetBillingAddressFields(current: FormState): FormState {
    return {
        ...current,
        billingAddressDiffers: false,
        billingCustomerType: "private",
        billingFirstName: "",
        billingLastName: "",
        billingCompanyName: "",
        billingAddressLine1: "",
        billingZip: "",
        billingCity: "",
        billingCountry: "",
    };
}

export function InquiryCartPageClient() {
    const { items, removeItem, updateQuantity, clearCart, itemCount, hasHydrated } = useInquiryCart();
    const [formState, setFormState] = useState<FormState>(initialFormState);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ bookingId: string } | null>(null);
    const [availabilityByItemId, setAvailabilityByItemId] = useState<Record<string, AvailabilityItemDetail>>({});
    const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
    const [isLoadingDates, setIsLoadingDates] = useState(false);
    const bookingDuration = useMemo(
        () => getBookingDurationDays(formState.startDate, formState.endDate),
        [formState.endDate, formState.startDate]
    );

    // Fetch unavailable dates when items or visible month changes
    const fetchUnavailableDates = useCallback(
        async (year: number, month: number) => {
            if (items.length === 0) {
                setUnavailableDates(new Set());
                return;
            }

            const resourceIds = items.map((item) => item.id);
            // Fetch 3 months of data (prev, current, next) for smooth navigation
            const monthStart = new Date(year, month - 1, 1);
            const monthEnd = new Date(year, month + 2, 0);

            const startStr = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}-${String(monthStart.getDate()).padStart(2, "0")}`;
            const endStr = `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, "0")}-${String(monthEnd.getDate()).padStart(2, "0")}`;

            setIsLoadingDates(true);
            try {
                const response = await fetch("/api/public/availability/dates", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ resourceIds, monthStart: startStr, monthEnd: endStr }),
                });

                if (response.ok) {
                    const data = (await response.json()) as { unavailableDates?: string[] };
                    if (Array.isArray(data.unavailableDates)) {
                        setUnavailableDates((prev) => {
                            const next = new Set(prev);
                            for (const d of data.unavailableDates!) {
                                next.add(d);
                            }
                            return next;
                        });
                    }
                }
            } catch {
                // Silently fail – availability will just not be shown
            } finally {
                setIsLoadingDates(false);
            }
        },
        [items]
    );

    // Initial fetch for current month
    useEffect(() => {
        const now = new Date();
        fetchUnavailableDates(now.getFullYear(), now.getMonth());
    }, [fetchUnavailableDates]);

    const handleMonthChange = useCallback(
        (year: number, month: number) => {
            fetchUnavailableDates(year, month);
        },
        [fetchUnavailableDates]
    );

    const pricingByItemId = useMemo(() => {
        return new Map(
            items.map((item) => [
                item.id,
                calculateInquiryCartItemPrice(
                    {
                        priceType: item.priceType,
                        basePriceCents: item.basePriceCents,
                        quantity: item.quantity,
                    },
                    formState.startDate,
                    formState.endDate
                ),
            ])
        );
    }, [formState.endDate, formState.startDate, items]);

    const canSubmit = useMemo(() => {
        const hasUnavailableItem = Object.values(availabilityByItemId).some((entry) => !entry.isAvailable);
        const hasRequiredCustomerData = Boolean(
            formState.firstName.trim() &&
            formState.lastName.trim() &&
            formState.email.trim()
        );

        return (
            items.length > 0 &&
            bookingDuration.days != null &&
            !hasUnavailableItem &&
            hasRequiredCustomerData &&
            isSeparateBillingAddressComplete(formState)
        );
    }, [availabilityByItemId, bookingDuration.days, formState, items.length]);

    const pricingSummary = useMemo(() => {
        let autoCalculatedTotalCents = 0;
        let autoCalculatedItemCount = 0;
        let individualItemCount = 0;

        for (const item of items) {
            const pricing = pricingByItemId.get(item.id);
            if (!pricing) continue;

            if (pricing.isAutoCalculated && pricing.calculatedTotalPriceCents != null) {
                autoCalculatedTotalCents += pricing.calculatedTotalPriceCents;
                autoCalculatedItemCount += 1;
            } else {
                individualItemCount += 1;
            }
        }

        return {
            autoCalculatedTotalCents,
            autoCalculatedItemCount,
            individualItemCount,
            hasMixedPricing: autoCalculatedItemCount > 0 && individualItemCount > 0,
        };
    }, [items, pricingByItemId]);

    const selectedRangeLabel = useMemo(() => {
        if (!formState.startDate || !formState.endDate) return "Noch nicht ausgewaehlt";
        return `${formatDateKeyForDisplay(formState.startDate)} - ${formatDateKeyForDisplay(formState.endDate)}`;
    }, [formState.endDate, formState.startDate]);

    useEffect(() => {
        if (!formState.startDate || !formState.endDate || bookingDuration.days == null || items.length === 0) {
            setAvailabilityByItemId({});
            return;
        }

        let cancelled = false;

        const run = async () => {
            try {
                const response = await fetch("/api/public/availability/check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        items: items.map((item) => ({
                            resourceId: item.id,
                            quantity: item.quantity,
                        })),
                        startDate: formState.startDate,
                        endDate: formState.endDate,
                    }),
                });

                if (!response.ok) return;

                const data = (await response.json()) as { items?: AvailabilityItemDetail[] };
                if (cancelled || !Array.isArray(data.items)) return;

                const nextMap: Record<string, AvailabilityItemDetail> = {};
                for (const entry of data.items) {
                    nextMap[entry.resourceId] = entry;
                }
                setAvailabilityByItemId(nextMap);
            } catch {
                if (!cancelled) {
                    setAvailabilityByItemId({});
                }
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [bookingDuration.days, formState.endDate, formState.startDate, items]);

    useEffect(() => {
        for (const item of items) {
            const availability = availabilityByItemId[item.id];
            if (!availability) continue;
            if (!availability.trackInventory || availability.availableQuantity == null) continue;

            const maxAllowed = Math.max(0, availability.availableQuantity);
            if (maxAllowed >= 1 && item.quantity > maxAllowed) {
                updateQuantity(item.id, maxAllowed);
            }
        }
    }, [availabilityByItemId, items, updateQuantity]);

    const handleBillingAddressToggle = (checked: boolean) => {
        setFormState((current) => {
            if (!checked) {
                return resetBillingAddressFields(current);
            }

            return {
                ...current,
                billingAddressDiffers: true,
                billingFirstName: current.billingFirstName || current.firstName,
                billingLastName: current.billingLastName || current.lastName,
            };
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!canSubmit) return;

        setSubmitting(true);
        setError(null);

        const billingAddressSameAsDelivery = !formState.billingAddressDiffers;
        const payload: InquiryBookingRequestPayload = {
            items: items.map((item) => ({
                resourceId: item.id,
                quantity: item.quantity,
                title: item.title,
                priceType: item.priceType,
                basePriceCents: item.basePriceCents,
                priceLabel: item.priceLabel,
                displayPrice: item.price,
                pricing: pricingByItemId.get(item.id) ?? null,
            })),
            startDate: formState.startDate,
            endDate: formState.endDate,
            bookingDays: bookingDuration.days,
            deliveryType: formState.deliveryType,
            billingAddressSameAsDelivery,
            billingAddress: billingAddressSameAsDelivery
                ? {
                    nameOrCompany: getCustomerBillingName(formState) || undefined,
                    addressLine1: formState.addressLine1 || undefined,
                    zip: formState.zip || undefined,
                    city: formState.city || undefined,
                }
                : {
                    nameOrCompany: formState.billingCustomerType === "private"
                        ? `${formState.billingFirstName} ${formState.billingLastName}`.trim()
                        : formState.billingCompanyName,
                    addressLine1: formState.billingAddressLine1,
                    zip: formState.billingZip,
                    city: formState.billingCity,
                    country: formState.billingCountry || undefined,
                },
            customerMessage: formState.message,
            customer: {
                firstName: formState.firstName,
                lastName: formState.lastName,
                email: formState.email,
                phone: formState.phone || undefined,
                addressLine1: formState.addressLine1 || undefined,
                zip: formState.zip || undefined,
                city: formState.city || undefined,
            },
        };

        const response = await fetch("/api/public/bookings/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        setSubmitting(false);

        if (!response.ok) {
            setError(data?.error ?? "Die Anfrage konnte nicht gesendet werden.");
            return;
        }

        clearCart();
        setSuccess({ bookingId: data.bookingId });
        setFormState(initialFormState);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!hasHydrated) {
        return (
            <div className="min-h-screen bg-[#fefce8]">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <p className="font-['Nunito'] text-[16px] text-[#64748b]">Anfragekorb wird geladen...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#fefce8]">
                <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="rounded-[16px] border border-[#cbd5e1] bg-white p-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#3b82f6]">
                            <ShoppingCart className="text-[#1a3a52]" size={30} />
                        </div>
                        <h1 className="font-['Nunito'] font-semibold text-[32px] text-[#1a202c] mb-4">Anfrage erfolgreich gesendet!</h1>
                        <p className="font-['Nunito'] text-[16px] text-[#4a5568] leading-[25.6px] mb-4">
                            Vielen Dank. Ihre Sammelanfrage wurde erfolgreich uebermittelt.
                        </p>
                        <p className="font-['Nunito'] text-[14px] text-[#64748b] mb-8">
                            Referenz: <strong>{success.bookingId}</strong>
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/produkte"><Button variant="primary">Weitere Produkte ansehen</Button></Link>
                            <Link href="/"><Button variant="secondary">Zur Startseite</Button></Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fefce8]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <nav className="flex items-center gap-2 text-[14px]">
                        <Link href="/" className="font-['Nunito'] text-[#64748b] hover:text-[#1a3a52]">Start</Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <Link href="/produkte" className="font-['Nunito'] text-[#64748b] hover:text-[#1a3a52]">Produkte</Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <span className="font-['Nunito'] text-[#1a202c]">Anfragekorb</span>
                    </nav>
                </div>

                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-['Nunito'] font-semibold text-[32px] text-[#1a202c] mb-3">Anfragekorb</h1>
                        <p className="font-['Nunito'] text-[16px] text-[#64748b] leading-[25.6px] max-w-[700px]">
                            Sammeln Sie mehrere Produkte und senden Sie anschliessend eine gemeinsame Anfrage.
                        </p>
                    </div>
                    <Link href="/produkte">
                        <Button variant="secondary">Weitere Produkte hinzufuegen</Button>
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-[16px] border border-[#cbd5e1] bg-[#f7f8fa] p-10 text-center">
                        <p className="font-['Nunito'] text-[18px] text-[#1a202c] mb-3">Ihr Anfragekorb ist leer.</p>
                        <p className="font-['Nunito'] text-[14px] text-[#64748b] mb-6">
                            Fuegen Sie zuerst Produkte hinzu, bevor Sie eine Sammelanfrage absenden.
                        </p>
                        <Link href="/produkte">
                            <Button variant="primary">Zu den Produkten</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
                        <div className="space-y-4">
                            <div className="rounded-[16px] border border-[#cbd5e1] bg-white p-6">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <h2 className="font-['Nunito'] font-semibold text-[24px] text-[#1a202c]">
                                        Ausgewaehlte Produkte ({itemCount})
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={clearCart}
                                        className="font-['Nunito'] text-[14px] text-[#64748b] hover:text-[#1a3a52]"
                                    >
                                        Alles entfernen
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex flex-col gap-4 rounded-[16px] border border-[#e2e8f0] p-4 sm:flex-row">
                                            <div className="h-[110px] w-full overflow-hidden rounded-[16px] bg-[#fef9c3] sm:w-[160px]">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-sm text-[#64748b]">
                                                        Kein Bild
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-1 flex-col gap-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <Link href={`/produkt/${item.slug}`} className="font-['Nunito'] font-medium text-[18px] text-[#1a202c] hover:text-[#1a3a52]">
                                                            {item.title}
                                                        </Link>
                                                        {item.summary && (
                                                            <p className="mt-1 font-['Nunito'] text-[14px] leading-[20px] text-[#64748b]">
                                                                {item.summary}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f8fa] text-[#64748b] transition-colors hover:bg-[#fee2e2] hover:text-[#b91c1c]"
                                                        aria-label={`${item.title} entfernen`}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <p className="font-['Nunito'] font-semibold text-[16px] text-[#4a5568]">
                                                            {item.price || "Preis auf Anfrage"}
                                                        </p>
                                                        {(() => {
                                                            const pricing = pricingByItemId.get(item.id);
                                                            if (!pricing) return null;
                                                            const availability = availabilityByItemId[item.id];

                                                            const periodText = pricing.bookingDays != null
                                                                ? `${selectedRangeLabel} (${pricing.bookingDays} Tag${pricing.bookingDays === 1 ? "" : "e"})`
                                                                : selectedRangeLabel;
                                                            const stockLabel =
                                                                availability && availability.trackInventory && availability.availableQuantity != null
                                                                    ? availability.isAvailable
                                                                        ? `Verfuegbar im Zeitraum: ${availability.availableQuantity}`
                                                                        : `Nicht ausreichend verfuegbar im Zeitraum (max. ${availability.availableQuantity})`
                                                                    : item.trackInventory
                                                                        ? `Bestand: ${item.totalStock}`
                                                                        : null;

                                                            if (
                                                                pricing.isAutoCalculated &&
                                                                pricing.calculatedUnitPriceCents != null &&
                                                                pricing.calculatedTotalPriceCents != null
                                                            ) {
                                                                return (
                                                                    <div className="space-y-1">
                                                                        <p className="font-['Nunito'] text-[12px] text-[#64748b]">
                                                                            Zeitraum: {periodText}
                                                                        </p>
                                                                        <p className="font-['Nunito'] text-[13px] text-[#1a3a52]">
                                                                            Berechnet: {formatPriceCents(pricing.calculatedUnitPriceCents)} x {item.quantity} ={" "}
                                                                            <span className="font-semibold">{formatPriceCents(pricing.calculatedTotalPriceCents)}</span>
                                                                        </p>
                                                                        {stockLabel && (
                                                                            availability && !availability.isAvailable ? (
                                                                                <span className="inline-flex items-center gap-1.5 mt-1 rounded-[6px] bg-[#fef2f2] border border-[#fecaca] px-2.5 py-1">
                                                                                    <AlertTriangle size={12} className="text-[#dc2626] shrink-0" />
                                                                                    <span className="font-['Nunito'] text-[11px] font-medium text-[#991b1b]">
                                                                                        {stockLabel}
                                                                                    </span>
                                                                                </span>
                                                                            ) : (
                                                                                <p className="font-['Nunito'] text-[12px] text-[#64748b]">
                                                                                    {stockLabel}
                                                                                </p>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                );
                                                            }

                                                            const label = getPricingReasonLabel(pricing.reason);
                                                            if (!label && !stockLabel) return null;

                                                            return (
                                                                <div className="space-y-1">
                                                                    <p className="font-['Nunito'] text-[12px] text-[#64748b]">
                                                                        Zeitraum: {periodText}
                                                                    </p>
                                                                    {label && (
                                                                        <p className="font-['Nunito'] text-[13px] text-[#64748b]">
                                                                            {label}
                                                                        </p>
                                                                    )}
                                                                    {stockLabel && (
                                                                        availability && !availability.isAvailable ? (
                                                                            <span className="inline-flex items-center gap-1.5 mt-1 rounded-[6px] bg-[#fef2f2] border border-[#fecaca] px-2.5 py-1">
                                                                                <AlertTriangle size={12} className="text-[#dc2626] shrink-0" />
                                                                                <span className="font-['Nunito'] text-[11px] font-medium text-[#991b1b]">
                                                                                    {stockLabel}
                                                                                </span>
                                                                            </span>
                                                                        ) : (
                                                                            <p className="font-['Nunito'] text-[12px] text-[#64748b]">
                                                                                {stockLabel}
                                                                            </p>
                                                                        )
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-['Nunito'] text-[14px] text-[#64748b]">Menge</span>
                                                        <div className="flex items-center rounded-[16px] border border-[#cbd5e1]">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="h-10 w-10 text-[#1a3a52]"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="min-w-[40px] text-center font-['Nunito'] text-[14px] text-[#1a202c]">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const availability = availabilityByItemId[item.id];
                                                                    const stockMaxFromAvailability =
                                                                        availability && availability.trackInventory && availability.availableQuantity != null
                                                                            ? Math.max(0, availability.availableQuantity)
                                                                            : null;
                                                                    const stockMax =
                                                                        stockMaxFromAvailability ??
                                                                        (item.trackInventory ? Math.max(0, item.totalStock) : null);

                                                                    if (stockMax == null) {
                                                                        updateQuantity(item.id, item.quantity + 1);
                                                                        return;
                                                                    }

                                                                    if (stockMax === 0) return;
                                                                    updateQuantity(item.id, Math.min(stockMax, item.quantity + 1));
                                                                }}
                                                                className="h-10 w-10 text-[#1a3a52]"
                                                                disabled={(() => {
                                                                    const availability = availabilityByItemId[item.id];
                                                                    const stockMaxFromAvailability =
                                                                        availability && availability.trackInventory && availability.availableQuantity != null
                                                                            ? Math.max(0, availability.availableQuantity)
                                                                            : null;
                                                                    const stockMax =
                                                                        stockMaxFromAvailability ??
                                                                        (item.trackInventory ? Math.max(0, item.totalStock) : null);
                                                                    return stockMax != null && item.quantity >= stockMax;
                                                                })()}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[16px] border border-[#cbd5e1] bg-white p-6">
                            <h2 className="font-['Nunito'] font-semibold text-[24px] text-[#1a202c] mb-6">Sammelanfrage senden</h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <DateRangePicker
                                    startDate={formState.startDate}
                                    endDate={formState.endDate}
                                    onStartDateChange={(value) => setFormState((current) => ({ ...current, startDate: value }))}
                                    onEndDateChange={(value) => setFormState((current) => ({ ...current, endDate: value }))}
                                    unavailableDates={unavailableDates}
                                    isLoadingDates={isLoadingDates}
                                    onMonthChange={handleMonthChange}
                                />

                                {formState.startDate && formState.endDate && bookingDuration.reason === "invalid_date_range" && (
                                    <div className="flex items-center gap-2 rounded-[16px] bg-[#fef2f2] border border-[#fecaca] px-4 py-3">
                                        <AlertTriangle size={16} className="text-[#dc2626] shrink-0" />
                                        <p className="font-['Nunito'] text-[13px] text-[#991b1b]">
                                            Das Enddatum darf nicht vor dem Startdatum liegen.
                                        </p>
                                    </div>
                                )}

                                <div className="rounded-[16px] border border-[#e2e8f0] bg-[#fffbeb] p-4">
                                    <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c] mb-2">Preisuebersicht</h3>
                                    <div className="space-y-1">
                                        <p className="font-['Nunito'] text-[14px] text-[#4a5568]">
                                            Zeitraum: <span className="font-medium">{selectedRangeLabel}</span>
                                        </p>
                                        <p className="font-['Nunito'] text-[14px] text-[#4a5568]">
                                            Buchungsdauer:{" "}
                                            <span className="font-medium">
                                                {bookingDuration.days != null ? `${bookingDuration.days} Tag${bookingDuration.days === 1 ? "" : "e"}` : "-"}
                                            </span>
                                        </p>
                                        <p className="font-['Nunito'] text-[14px] text-[#4a5568]">
                                            Automatisch berechenbar:{" "}
                                            <span className="font-medium">{pricingSummary.autoCalculatedItemCount}</span> Produkt
                                            {pricingSummary.autoCalculatedItemCount === 1 ? "" : "e"}
                                        </p>
                                        <p className="font-['Nunito'] text-[14px] text-[#4a5568]">
                                            Individuell / auf Anfrage:{" "}
                                            <span className="font-medium">{pricingSummary.individualItemCount}</span> Produkt
                                            {pricingSummary.individualItemCount === 1 ? "" : "e"}
                                        </p>
                                    </div>

                                    <div className="mt-3 border-t border-[#e2e8f0] pt-3">
                                        {pricingSummary.autoCalculatedItemCount > 0 ? (
                                            <>
                                                <p className="font-['Nunito'] text-[14px] text-[#4a5568]">Voraussichtliche Gesamtsumme</p>
                                                <p className="font-['Nunito'] text-[12px] text-[#64748b] mb-1">
                                                    Für automatisch berechenbare Produkte
                                                </p>
                                                <p className="font-['Nunito'] font-semibold text-[28px] leading-[1.1] text-[#1a202c]">
                                                    {formatPriceCents(pricingSummary.autoCalculatedTotalCents)}
                                                </p>
                                                {pricingSummary.hasMixedPricing && (
                                                    <p className="mt-1 font-['Nunito'] text-[12px] text-[#64748b]">
                                                        Hinweis: Individuelle Positionen sind in dieser Summe nicht enthalten.
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-start gap-3 rounded-[16px] bg-[#fffbeb] border border-[#fde68a] px-4 py-3">
                                                <span className="text-[20px] leading-none mt-0.5">💬</span>
                                                <div>
                                                    <p className="font-['Nunito'] font-semibold text-[14px] text-[#92400e] mb-1">
                                                        Individuelles Angebot
                                                    </p>
                                                    <p className="font-['Nunito'] text-[13px] text-[#a16207] leading-[1.4]">
                                                        {bookingDuration.days != null && bookingDuration.days > 3
                                                            ? `Bei einer Buchungsdauer von ${bookingDuration.days} Tagen erstellen wir Ihnen gerne ein individuelles Angebot.`
                                                            : "Für die ausgewählten Produkte wird ein individuelles Angebot erstellt."
                                                        }
                                                        {" "}Senden Sie Ihre Anfrage ab und wir melden uns zeitnah bei Ihnen.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {Object.values(availabilityByItemId).some((entry) => !entry.isAvailable) && (
                                            <div className="mt-2 flex items-center gap-2 rounded-[16px] bg-[#fef2f2] border border-[#fecaca] px-3 py-2">
                                                <AlertTriangle size={14} className="text-[#dc2626] shrink-0" />
                                                <p className="font-['Nunito'] text-[12px] text-[#991b1b]">
                                                    Für mindestens ein Produkt ist die gewünschte Menge im gewählten Zeitraum nicht verfügbar.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Vorname"
                                        value={formState.firstName}
                                        onChange={(e) => setFormState((current) => ({ ...current, firstName: e.target.value }))}
                                        required
                                    />
                                    <Input
                                        label="Nachname"
                                        value={formState.lastName}
                                        onChange={(e) => setFormState((current) => ({ ...current, lastName: e.target.value }))}
                                        required
                                    />
                                </div>

                                <Input
                                    label="E-Mail"
                                    type="email"
                                    value={formState.email}
                                    onChange={(e) => setFormState((current) => ({ ...current, email: e.target.value }))}
                                    required
                                />

                                <Input
                                    label="Telefon"
                                    type="tel"
                                    value={formState.phone}
                                    onChange={(e) => setFormState((current) => ({ ...current, phone: e.target.value }))}
                                />

                                <div className="space-y-2">
                                    <label className="font-['Nunito'] font-medium text-[14px] leading-[21px] text-[#1a202c]">
                                        Lieferart
                                    </label>
                                    <select
                                        value={formState.deliveryType}
                                        onChange={(e) => setFormState((current) => ({ ...current, deliveryType: e.target.value as "pickup" | "delivery" }))}
                                        className="bg-white h-[50px] w-full rounded-[16px] px-[16px] py-[12px] font-['Nunito'] text-[16px] text-[#2d3748] border border-[#cbd5e1] focus:outline-none focus:border-[#1a3a52]"
                                    >
                                        <option value="pickup">Selbstabholung</option>
                                        <option value="delivery">Lieferung</option>
                                    </select>
                                </div>

                                <div className="space-y-4 rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
                                    <div>
                                        <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c]">Lieferadresse</h3>
                                        <p className="mt-1 font-['Nunito'] text-[13px] leading-[20px] text-[#64748b]">
                                            Diese Adresse verwenden wir standardmaessig auch als Rechnungsadresse.
                                        </p>
                                    </div>

                                    <Input
                                        label="Strasse und Hausnummer"
                                        value={formState.addressLine1}
                                        onChange={(e) => setFormState((current) => ({ ...current, addressLine1: e.target.value }))}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="PLZ"
                                            value={formState.zip}
                                            onChange={(e) => setFormState((current) => ({ ...current, zip: e.target.value }))}
                                        />
                                        <Input
                                            label="Ort"
                                            value={formState.city}
                                            onChange={(e) => setFormState((current) => ({ ...current, city: e.target.value }))}
                                        />
                                    </div>

                                    <label className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-[#cbd5e1] bg-white px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={formState.billingAddressDiffers}
                                            onChange={(e) => handleBillingAddressToggle(e.target.checked)}
                                            className="mt-0.5 h-5 w-5 rounded border-[#94a3b8] text-[#1a3a52] focus:ring-[#1a3a52]"
                                        />
                                        <span className="font-['Nunito'] text-[14px] leading-[21px] text-[#1a202c]">
                                            Rechnungsadresse abweichend von Lieferadresse
                                        </span>
                                    </label>
                                </div>

                                {formState.billingAddressDiffers && (
                                    <div className="space-y-4 rounded-[16px] border border-[#cbd5e1] bg-white p-4">
                                        <div>
                                            <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c]">Rechnungsadresse</h3>
                                            <p className="mt-1 font-['Nunito'] text-[13px] leading-[20px] text-[#64748b]">
                                                Wird nur verwendet, wenn sie von der Lieferadresse abweicht.
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pb-2">
                                            <label className="flex cursor-pointer items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={formState.billingCustomerType === "private"}
                                                    onChange={() => setFormState(s => ({ ...s, billingCustomerType: "private" }))}
                                                    className="h-4 w-4 border-[#94a3b8] text-[#1a3a52] focus:ring-[#1a3a52]"
                                                />
                                                <span className="font-['Nunito'] text-[14px] text-[#1a202c]">Privatperson</span>
                                            </label>
                                            <label className="flex cursor-pointer items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={formState.billingCustomerType === "business"}
                                                    onChange={() => setFormState(s => ({ ...s, billingCustomerType: "business" }))}
                                                    className="h-4 w-4 border-[#94a3b8] text-[#1a3a52] focus:ring-[#1a3a52]"
                                                />
                                                <span className="font-['Nunito'] text-[14px] text-[#1a202c]">Geschäftskunde</span>
                                            </label>
                                        </div>

                                        {formState.billingCustomerType === "private" ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <Input
                                                    label="Vorname"
                                                    value={formState.billingFirstName}
                                                    onChange={(e) => setFormState((current) => ({ ...current, billingFirstName: e.target.value }))}
                                                    required
                                                />
                                                <Input
                                                    label="Nachname"
                                                    value={formState.billingLastName}
                                                    onChange={(e) => setFormState((current) => ({ ...current, billingLastName: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <Input
                                                label="Firmenname"
                                                value={formState.billingCompanyName}
                                                onChange={(e) => setFormState((current) => ({ ...current, billingCompanyName: e.target.value }))}
                                                required
                                            />
                                        )}

                                        <Input
                                            label="Strasse und Hausnummer"
                                            value={formState.billingAddressLine1}
                                            onChange={(e) => setFormState((current) => ({ ...current, billingAddressLine1: e.target.value }))}
                                            required
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Input
                                                label="PLZ"
                                                value={formState.billingZip}
                                                onChange={(e) => setFormState((current) => ({ ...current, billingZip: e.target.value }))}
                                                required
                                            />
                                            <Input
                                                label="Ort"
                                                value={formState.billingCity}
                                                onChange={(e) => setFormState((current) => ({ ...current, billingCity: e.target.value }))}
                                                required
                                            />
                                        </div>

                                        <Input
                                            label="Land (optional)"
                                            value={formState.billingCountry}
                                            onChange={(e) => setFormState((current) => ({ ...current, billingCountry: e.target.value }))}
                                        />
                                    </div>
                                )}

                                <Textarea
                                    label="Zusätzliche Nachricht (optional)"
                                    placeholder="Weitere Infos zu Ihrer Anfrage oder besondere Wünsche..."
                                    value={formState.message}
                                    onChange={(e) => setFormState((current) => ({ ...current, message: e.target.value }))}
                                    rows={4}
                                />

                                {/* STORNO INFO */}
                                <div className="mt-8 bg-[#fffbeb] border border-[#cbd5e1] rounded-[16px] p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-[#fef3c7] flex items-center justify-center text-[#d97706] shrink-0">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c]">Faire Stornobedingungen</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-2">
                                            <Clock size={16} className="text-[#059669] mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-['Nunito'] text-[13px] font-medium text-[#1a202c]">Kostenlos</p>
                                                <p className="font-['Nunito'] text-[12px] text-[#4a5568]">Bis 48 Stunden vorher</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle size={16} className="text-[#d97706] mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-['Nunito'] text-[13px] font-medium text-[#1a202c]">25% der Kosten</p>
                                                <p className="font-['Nunito'] text-[12px] text-[#4a5568]">Bis 24 Stunden vorher</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle size={16} className="text-[#dc2626] mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-['Nunito'] text-[13px] font-medium text-[#1a202c]">50% + Aufwand</p>
                                                <p className="font-['Nunito'] text-[12px] text-[#4a5568]">Vor-Ort Stornierung</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CloudRain size={16} className="text-[#0284c7] mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-['Nunito'] text-[13px] font-medium text-[#1a202c]">Schlechtwetter-Storno</p>
                                                <p className="font-['Nunito'] text-[12px] text-[#4a5568]">Individuelle & faire Lösung</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* HAFTUNG INFO */}
                                <div className="mt-4 bg-[#fffbeb] border border-[#cbd5e1] rounded-[16px] p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#3b82f6] shrink-0">
                                            <Info size={18} />
                                        </div>
                                        <h3 className="font-['Nunito'] font-semibold text-[16px] text-[#1a202c]">Haftung & Versicherung</h3>
                                    </div>
                                    <ul className="space-y-2 mt-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#3b82f6] mt-0.5">•</span>
                                            <span className="font-['Nunito'] text-[13px] text-[#4a5568] leading-snug">Der Betreiber ist ausschließlich Vermieter. Eine Betreuung/Aufsicht ist nicht inkludiert.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#3b82f6] mt-0.5">•</span>
                                            <span className="font-['Nunito'] text-[13px] text-[#4a5568] leading-snug">Es besteht <strong>keine</strong> Versicherung über den Anbieter. Die Haftung liegt nicht beim Anbieter.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#3b82f6] mt-0.5">•</span>
                                            <span className="font-['Nunito'] text-[13px] text-[#4a5568] leading-snug">Detaillierte Haftungsinformationen erhalten Sie mit Ihrem Vertragsangebot.</span>
                                        </li>
                                    </ul>
                                </div>

                                {error && (
                                    <p className="font-['Nunito'] text-[14px] text-[#dc2626] mt-2">
                                        {error}
                                    </p>
                                )}

                                <div className="pt-2">
                                    <Button type="submit" variant="primary" disabled={!canSubmit || submitting} className="w-full h-[54px] text-[16px]">
                                        {submitting ? "Anfrage wird gesendet..." : "Gesamtanfrage senden"}
                                    </Button>
                                    <p className="text-center font-['Nunito'] text-[12px] text-[#64748b] mt-4">
                                        Diese Anfrage ist noch unverbindlich. Sie erhalten von uns ein Angebot.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

