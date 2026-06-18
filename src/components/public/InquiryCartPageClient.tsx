"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/public/Button";
import { useInquiryCart } from "@/components/public/InquiryCartProvider";
import { calculateInquiryCartItemPrice, getBookingDurationDays } from "@/lib/inquiry-cart/pricing";
import type { InquiryBookingRequestPayload } from "@/lib/inquiry-cart/request-payload";
import type { SiteSettingsRecord } from "@/lib/repositories/site-settings";

// Wizard step imports
import { WizardStepper, type WizardStep } from "./wizard/WizardStepper";
import { CartStep } from "./wizard/CartStep";
import { DatesStep } from "./wizard/DatesStep";
import { DeliveryStep } from "./wizard/DeliveryStep";
import { ContactStep } from "./wizard/ContactStep";
import { SummaryStep } from "./wizard/SummaryStep";

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
    resourceLimitReached?: boolean;
    globalBlockReached?: boolean;
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
            return "Bitte zuerst den Zeitraum auswählen.";
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

export function InquiryCartPageClient({ settings }: { settings?: SiteSettingsRecord }) {
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

    // Wizard step state
    const [currentStep, setCurrentStep] = useState<WizardStep>("cart");
    const [stepValidationError, setStepValidationError] = useState<string | null>(null);

    const WIZARD_STEPS: WizardStep[] = ["cart", "dates", "delivery", "contact", "summary"];

    const getStepValidationError = (step: WizardStep): string | null => {
        switch (step) {
            case "cart":
                if (items.length === 0) {
                    return "Bitte wählen Sie zuerst mindestens ein Produkt aus.";
                }
                return null;
            case "dates":
                if (!formState.startDate || !formState.endDate) {
                    return "Bitte wählen Sie den gewünschten Mietzeitraum aus.";
                }
                if (bookingDuration.reason === "invalid_date_range") {
                    return "Das Enddatum darf nicht vor dem Startdatum liegen.";
                }
                const hasGlobalBlock = Object.values(availabilityByItemId).some((entry) => !entry.isAvailable && entry.globalBlockReached);
                if (hasGlobalBlock) {
                    return "An diesem Tag ist GMF bereits für Auf- und Abbau eingeplant. Bitte wählen Sie einen anderen Tag.";
                }
                const hasStockUnavailable = Object.values(availabilityByItemId).some((entry) => !entry.isAvailable && !entry.resourceLimitReached && !entry.globalBlockReached);
                if (hasStockUnavailable) {
                    return "Mindestens ein Produkt ist im gewählten Zeitraum nicht verfügbar.";
                }
                return null;
            case "delivery":
                const resourceUnavailableEntries = Object.values(availabilityByItemId).filter((entry) => !entry.isAvailable && entry.resourceLimitReached);
                if (resourceUnavailableEntries.length > 0) {
                    const unavailableItemIds = resourceUnavailableEntries.map(e => e.resourceId);
                    const itemsThatFailed = items.filter(i => unavailableItemIds.includes(i.id));
                    const allFailedSupportPickup = itemsThatFailed.every(i => i.pickupAvailable);
                    
                    if (formState.deliveryType === "delivery") {
                        return allFailedSupportPickup 
                            ? "Lieferung/Aufbau ist an diesem Tag nicht möglich. Abholung ist weiterhin möglich."
                            : "Die Liefer-/Aufbaukapazität ist an diesem Tag für Ihre Auswahl leider erschöpft.";
                    } else {
                        return "Die Kapazität für diesen Tag ist für Ihre Auswahl leider erschöpft.";
                    }
                }
                
                if (formState.deliveryType === "delivery") {
                    if (!formState.addressLine1.trim() || !formState.zip.trim() || !formState.city.trim()) {
                        return "Bitte ergänzen Sie die Veranstaltungs-/Lieferadresse.";
                    }
                }
                if (formState.billingAddressDiffers) {
                    if (formState.billingCustomerType === "private") {
                        if (!formState.billingFirstName.trim() || !formState.billingLastName.trim()) {
                            return "Bitte ergänzen Sie den Namen für die abweichende Rechnungsadresse.";
                        }
                    } else {
                        if (!formState.billingCompanyName.trim()) {
                            return "Bitte ergänzen Sie den Firmennamen für die abweichende Rechnungsadresse.";
                        }
                    }
                    if (!formState.billingAddressLine1.trim() || !formState.billingZip.trim() || !formState.billingCity.trim()) {
                        return "Bitte ergänzen Sie die Rechnungsadresse vollständig.";
                    }
                }
                return null;
            case "contact":
                if (!formState.firstName.trim() || !formState.lastName.trim() || !formState.email.trim() || !formState.phone.trim()) {
                    return "Bitte geben Sie Name, E-Mail-Adresse und Telefonnummer an.";
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
                    return "Bitte geben Sie eine gültige E-Mail-Adresse an.";
                }
                return null;
            default:
                return null;
        }
    };

    const isStepValid = (step: WizardStep): boolean => {
        return getStepValidationError(step) === null;
    };

    const isStepCompleted = (step: WizardStep): boolean => {
        const targetIdx = WIZARD_STEPS.indexOf(step);
        const currentIdx = WIZARD_STEPS.indexOf(currentStep);
        return targetIdx < currentIdx && isStepValid(step);
    };

    const isStepSelectable = (step: WizardStep): boolean => {
        const targetIdx = WIZARD_STEPS.indexOf(step);
        const currentIdx = WIZARD_STEPS.indexOf(currentStep);
        
        if (targetIdx <= currentIdx) return true;
        
        for (let i = 0; i < targetIdx; i++) {
            if (!isStepValid(WIZARD_STEPS[i])) {
                return false;
            }
        }
        return true;
    };

    const handleStepClick = (step: WizardStep) => {
        setStepValidationError(null);
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleNextStep = () => {
        const errorMsg = getStepValidationError(currentStep);
        if (errorMsg) {
            setStepValidationError(errorMsg);
            return;
        }
        setStepValidationError(null);
        const currentIdx = WIZARD_STEPS.indexOf(currentStep);
        if (currentIdx < WIZARD_STEPS.length - 1) {
            setCurrentStep(WIZARD_STEPS[currentIdx + 1]);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handlePrevStep = () => {
        setStepValidationError(null);
        const currentIdx = WIZARD_STEPS.indexOf(currentStep);
        if (currentIdx > 0) {
            setCurrentStep(WIZARD_STEPS[currentIdx - 1]);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Compute allowed shipping types based on product flags
    const {
        hasDeliveryOnlyItem,
        hasPickupOnlyItem,
        allowedDeliveryTypes,
        showDeliveryDropdown,
    } = useMemo(() => {
        let hasDeliveryOnly = false;
        let hasPickupOnly = false;

        for (const item of items) {
            const delivery = item.deliveryAvailable ?? true;
            const pickup = item.pickupAvailable ?? true;

            if (delivery && !pickup) {
                hasDeliveryOnly = true;
            }
            if (pickup && !delivery) {
                hasPickupOnly = true;
            }
        }

        let allowed: Array<"pickup" | "delivery"> = ["pickup", "delivery"];
        if (hasDeliveryOnly && !hasPickupOnly) {
            allowed = ["delivery"];
        } else if (hasPickupOnly && !hasDeliveryOnly) {
            allowed = ["pickup"];
        }

        const showDropdown = items.every(
            (item) => (item.deliveryAvailable ?? true) && (item.pickupAvailable ?? true)
        );

        return {
            hasDeliveryOnlyItem: hasDeliveryOnly,
            hasPickupOnlyItem: hasPickupOnly,
            allowedDeliveryTypes: allowed,
            showDeliveryDropdown: showDropdown,
        };
    }, [items]);

    // Force active selection to the allowed one if forced
    useEffect(() => {
        if (allowedDeliveryTypes.length === 1) {
            const forced = allowedDeliveryTypes[0];
            if (formState.deliveryType !== forced) {
                setFormState((prev) => ({ ...prev, deliveryType: forced }));
            }
        } else if (hasDeliveryOnlyItem && hasPickupOnlyItem) {
            if (formState.deliveryType !== "delivery") {
                setFormState((prev) => ({ ...prev, deliveryType: "delivery" }));
            }
        }
    }, [allowedDeliveryTypes, formState.deliveryType, hasDeliveryOnlyItem, hasPickupOnlyItem]);

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
            formState.email.trim() &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim()) &&
            formState.phone.trim()
        );
        const hasRequiredDeliveryAddress = formState.deliveryType === "pickup" || Boolean(
            formState.addressLine1.trim() &&
            formState.zip.trim() &&
            formState.city.trim()
        );

        return (
            items.length > 0 &&
            bookingDuration.days != null &&
            !hasUnavailableItem &&
            hasRequiredCustomerData &&
            hasRequiredDeliveryAddress &&
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
                        deliveryType: formState.deliveryType,
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
    }, [bookingDuration.days, formState.endDate, formState.startDate, formState.deliveryType, items]);

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
            <div className="min-h-screen bg-[#fffdf8]">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <p className="font-['Nunito'] text-[16px] text-[#64748b]">Anfragekorb wird geladen...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#fffdf8]">
                <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="rounded-[28px] border border-blue-100 bg-white p-10 text-center shadow-xl shadow-blue-500/5">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#066bb7] text-white">
                            <ShoppingCart size={30} />
                        </div>
                        <h1 className="font-['Fredoka'] font-semibold text-[32px] text-[#1a202c] mb-4">Anfrage erfolgreich gesendet!</h1>
                        <p className="font-['Nunito'] text-[16px] text-[#4a5568] leading-relaxed mb-4">
                            Vielen Dank. Ihre Sammelanfrage wurde erfolgreich übermittelt. Sie erhalten eine Eingangsbestätigung per E-Mail. Falls keine E-Mail ankommt, prüfen Sie bitte Ihren Spam-Ordner oder kontaktieren Sie uns telefonisch.
                        </p>
                        <p className="font-['Nunito'] text-[14px] text-[#64748b] mb-8">
                            Referenznummer: <strong className="text-[#1a3a52]">{success.bookingId}</strong>
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

    const steps = [
        { id: "cart" as WizardStep, label: "Produkte" },
        { id: "dates" as WizardStep, label: "Zeitraum" },
        { id: "delivery" as WizardStep, label: "Lieferung" },
        { id: "contact" as WizardStep, label: "Kontakt" },
        { id: "summary" as WizardStep, label: "Zusammenfassung" },
    ];

    return (
        <div className="min-h-screen bg-[#fffdf8]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <nav className="flex items-center gap-2 text-[14px]">
                        <Link href="/" className="font-['Nunito'] text-[#64748b] hover:text-[#1a3a52] transition-colors">Start</Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <Link href="/produkte" className="font-['Nunito'] text-[#64748b] hover:text-[#1a3a52] transition-colors">Produkte</Link>
                        <span className="text-[#cbd5e1]">/</span>
                        <span className="font-['Nunito'] text-[#1a202c]">Anfrage-Assistent</span>
                    </nav>
                </div>

                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-['Fredoka'] font-semibold text-[32px] text-[#1a202c] mb-3">
                            {items.length === 0 ? "Anfragekorb" : "Anfrage-Assistent"}
                        </h1>
                        <p className="font-['Nunito'] text-[16px] text-[#64748b] leading-relaxed max-w-[700px]">
                            {items.length === 0 
                                ? "Fügen Sie Produkte hinzu, um eine Sammelanfrage zu senden."
                                : "Sammeln Sie mehrere Produkte und senden Sie anschließend eine gemeinsame Anfrage."}
                        </p>
                    </div>
                    {items.length > 0 && currentStep === "cart" && (
                        <Link href="/produkte">
                            <Button variant="secondary">Weitere Produkte hinzufügen</Button>
                        </Link>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="rounded-[32px] border border-blue-100 bg-white p-10 text-center shadow-xl shadow-blue-500/5">
                        <p className="font-['Nunito'] text-[18px] text-[#1a202c] mb-3">Ihr Anfragekorb ist leer.</p>
                        <p className="font-['Nunito'] text-[14px] text-[#64748b] mb-6">
                            Fügen Sie zuerst Produkte hinzu, bevor Sie eine Sammelanfrage absenden.
                        </p>
                        <Link href="/produkte">
                            <Button variant="primary">Zu den Produkten</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Wizard Stepper */}
                        <WizardStepper
                            currentStep={currentStep}
                            steps={steps}
                            onStepClick={handleStepClick}
                            isStepCompleted={isStepCompleted}
                            isStepSelectable={isStepSelectable}
                        />

                        {/* Step Form Wrapper */}
                        <form onSubmit={handleSubmit}>
                            {currentStep === "summary" ? (
                                <SummaryStep
                                    items={items}
                                    formState={formState}
                                    pricingByItemId={pricingByItemId}
                                    pricingSummary={pricingSummary}
                                    selectedRangeLabel={selectedRangeLabel}
                                    bookingDuration={bookingDuration}
                                    submitting={submitting}
                                    error={error}
                                />
                            ) : (
                                <div className="bg-white rounded-[28px] border border-blue-100 p-6 md:p-8 shadow-xl shadow-blue-500/5">
                                    {currentStep === "cart" && (
                                        <CartStep
                                            items={items}
                                            itemCount={itemCount}
                                            removeItem={removeItem}
                                            updateQuantity={updateQuantity}
                                            clearCart={clearCart}
                                            pricingByItemId={pricingByItemId}
                                            availabilityByItemId={availabilityByItemId}
                                            selectedRangeLabel={selectedRangeLabel}
                                            getPricingReasonLabel={getPricingReasonLabel}
                                        />
                                    )}
                                    {currentStep === "dates" && (
                                        <DatesStep
                                            startDate={formState.startDate}
                                            endDate={formState.endDate}
                                            onStartDateChange={(val) => {
                                                setFormState((prev) => ({ ...prev, startDate: val }));
                                                setStepValidationError(null);
                                            }}
                                            onEndDateChange={(val) => {
                                                setFormState((prev) => ({ ...prev, endDate: val }));
                                                setStepValidationError(null);
                                            }}
                                            unavailableDates={unavailableDates}
                                            isLoadingDates={isLoadingDates}
                                            onMonthChange={handleMonthChange}
                                            bookingDuration={bookingDuration}
                                            pricingSummary={pricingSummary}
                                            availabilityByItemId={availabilityByItemId}
                                            selectedRangeLabel={selectedRangeLabel}
                                        />
                                    )}
                                    {currentStep === "delivery" && (
                                        <DeliveryStep
                                            formState={formState}
                                            setFormState={setFormState}
                                            allowedDeliveryTypes={allowedDeliveryTypes}
                                            showDeliveryDropdown={showDeliveryDropdown}
                                            hasDeliveryOnlyItem={hasDeliveryOnlyItem}
                                            hasPickupOnlyItem={hasPickupOnlyItem}
                                            settings={settings}
                                            handleBillingAddressToggle={handleBillingAddressToggle}
                                        />
                                    )}
                                    {currentStep === "contact" && (
                                        <ContactStep
                                            formState={formState}
                                            setFormState={setFormState}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Validation warning */}
                            {stepValidationError && (
                                <div className="mt-6 flex items-center gap-2.5 rounded-[16px] bg-[#fef2f2] border border-[#fecaca] px-4 py-3">
                                    <AlertTriangle size={18} className="text-[#dc2626] shrink-0" />
                                    <p className="font-['Nunito'] text-[14.5px] font-medium text-[#991b1b]">
                                        {stepValidationError}
                                    </p>
                                </div>
                            )}

                            {/* Stepper Navigation Buttons */}
                            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
                                {currentStep !== "cart" ? (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handlePrevStep}
                                        className="h-12 px-6"
                                    >
                                        Zurück
                                    </Button>
                                ) : (
                                    <Link href="/produkte">
                                        <Button type="button" variant="secondary" className="h-12 px-6">
                                            Produkte hinzufügen
                                        </Button>
                                    </Link>
                                )}

                                {currentStep !== "summary" && (
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={handleNextStep}
                                        className="h-12 px-8 bg-[#066bb7] text-white hover:bg-[#1a3a52] transition-all"
                                    >
                                        {currentStep === "cart" && "Weiter zum Zeitraum"}
                                        {currentStep === "dates" && "Weiter zur Lieferung"}
                                        {currentStep === "delivery" && "Weiter zu Kontaktdaten"}
                                        {currentStep === "contact" && "Weiter zur Zusammenfassung"}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

