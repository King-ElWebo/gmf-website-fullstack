import type { BookingCustomer } from "@/lib/booking-core/domain/models";
import type { InquiryCartItemPriceResult, InquiryCartPriceType } from "@/lib/inquiry-cart/pricing";

export type InquiryDeliveryType = "pickup" | "delivery";

export type InquiryBookingItemPricingPayload = InquiryCartItemPriceResult;
type InquiryPricingReason = Exclude<InquiryBookingItemPricingPayload["reason"], null>;

export type InquiryBookingItemPayload = {
    resourceId: string;
    quantity: number;
    title?: string | null;
    priceType?: InquiryCartPriceType | null;
    basePriceCents?: number | null;
    priceLabel?: string | null;
    displayPrice?: string | null;
    pricing?: InquiryBookingItemPricingPayload | null;
};

export type InquiryBookingRequestPayload = {
    items: InquiryBookingItemPayload[];
    startDate: string;
    endDate: string;
    bookingDays?: number | null;
    deliveryType: InquiryDeliveryType;
    customerMessage?: string;
    customer: BookingCustomer;
};

export type InquiryBookingRequestItemInput = {
    resourceId: string;
    quantity: number;
    title?: string | null;
    priceType?: InquiryCartPriceType | null;
    basePriceCents?: number | null;
    priceLabel?: string | null;
    displayPrice?: string | null;
    pricing?: InquiryBookingItemPricingPayload | null;
};

type ParseResult<T> =
    | { ok: true; value: T }
    | { ok: false; error: string };

export type ParsedInquiryBookingRequest = {
    items: InquiryBookingRequestItemInput[];
    startDate: string;
    endDate: string;
    deliveryType: InquiryDeliveryType;
    customerMessage?: string;
    customer: BookingCustomer;
};

const ALLOWED_PRICE_TYPES: InquiryCartPriceType[] = ["FIXED", "FROM_PRICE", "ON_REQUEST"];
const ALLOWED_PRICING_REASONS: InquiryPricingReason[] = [
    "missing_date_range",
    "invalid_date_range",
    "duration_over_limit",
    "on_request_price",
    "from_price",
    "missing_base_price",
    "invalid_quantity",
];

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

function toOptionalTrimmedString(value: unknown) {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
}

function toOptionalInteger(value: unknown): number | null | undefined {
    if (value == null) return undefined;
    if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
    return Number.isInteger(value) ? value : Math.round(value);
}

function parsePricingPayload(value: unknown): InquiryBookingItemPricingPayload | null | undefined {
    if (value == null) return undefined;
    if (!isRecord(value)) return undefined;

    const bookingDays = value.bookingDays == null ? null : toOptionalInteger(value.bookingDays);
    const multiplier = value.multiplier == null ? null : (typeof value.multiplier === "number" && Number.isFinite(value.multiplier) ? value.multiplier : null);
    const isAutoCalculated = typeof value.isAutoCalculated === "boolean" ? value.isAutoCalculated : false;
    const reasonRaw = value.reason;
    const reason =
        reasonRaw == null
            ? null
            : typeof reasonRaw === "string" && ALLOWED_PRICING_REASONS.includes(reasonRaw as InquiryPricingReason)
                ? (reasonRaw as InquiryPricingReason)
                : null;
    const calculatedUnitPriceCents =
        value.calculatedUnitPriceCents == null ? null : toOptionalInteger(value.calculatedUnitPriceCents) ?? null;
    const calculatedTotalPriceCents =
        value.calculatedTotalPriceCents == null ? null : toOptionalInteger(value.calculatedTotalPriceCents) ?? null;

    return {
        bookingDays: bookingDays == null ? null : bookingDays,
        multiplier,
        isAutoCalculated,
        reason,
        calculatedUnitPriceCents,
        calculatedTotalPriceCents,
    };
}

function parseCustomer(value: unknown): ParseResult<BookingCustomer> {
    if (!isRecord(value)) {
        return { ok: false, error: "Kundendaten fehlen oder sind ungültig." };
    }

    const firstName = toOptionalTrimmedString(value.firstName);
    const lastName = toOptionalTrimmedString(value.lastName);
    const email = toOptionalTrimmedString(value.email);

    if (!firstName || !lastName || !email) {
        return { ok: false, error: "Bitte Vorname, Nachname und E-Mail angeben." };
    }

    return {
        ok: true,
        value: {
            firstName,
            lastName,
            email,
            phone: toOptionalTrimmedString(value.phone),
            addressLine1: toOptionalTrimmedString(value.addressLine1),
            zip: toOptionalTrimmedString(value.zip),
            city: toOptionalTrimmedString(value.city),
        },
    };
}

export function parseInquiryBookingRequestPayload(input: unknown): ParseResult<ParsedInquiryBookingRequest> {
    if (!isRecord(input)) {
        return { ok: false, error: "Ungültiger Request-Body." };
    }

    const startDate = toOptionalTrimmedString(input.startDate);
    const endDate = toOptionalTrimmedString(input.endDate);

    if (!startDate || !endDate) {
        return { ok: false, error: "Bitte Zeitraum (Von/Bis) angeben." };
    }

    const itemsRaw = input.items;
    if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
        return { ok: false, error: "Bitte mindestens ein Produkt im Anfragekorb auswählen." };
    }

    const parsedItems: InquiryBookingRequestItemInput[] = [];

    for (const rawItem of itemsRaw) {
        if (!isRecord(rawItem)) {
            return { ok: false, error: "Ungültige Produktdaten in der Anfrage." };
        }

        const resourceId = toOptionalTrimmedString(rawItem.resourceId);
        const quantityRaw = rawItem.quantity;
        const quantity =
            typeof quantityRaw === "number" && Number.isFinite(quantityRaw)
                ? Math.max(1, Math.floor(quantityRaw))
                : null;

        if (!resourceId || quantity == null) {
            return { ok: false, error: "Jedes Produkt benötigt eine gültige ID und Menge." };
        }

        const priceType =
            typeof rawItem.priceType === "string" && ALLOWED_PRICE_TYPES.includes(rawItem.priceType as InquiryCartPriceType)
                ? (rawItem.priceType as InquiryCartPriceType)
                : undefined;

        parsedItems.push({
            resourceId,
            quantity,
            title: toOptionalTrimmedString(rawItem.title),
            priceType,
            basePriceCents: toOptionalInteger(rawItem.basePriceCents),
            priceLabel: toOptionalTrimmedString(rawItem.priceLabel),
            displayPrice: toOptionalTrimmedString(rawItem.displayPrice),
            pricing: parsePricingPayload(rawItem.pricing),
        });
    }

    const parsedCustomer = parseCustomer(input.customer);
    if (!parsedCustomer.ok) {
        return parsedCustomer;
    }

    const deliveryType: InquiryDeliveryType =
        input.deliveryType === "delivery" ? "delivery" : "pickup";

    return {
        ok: true,
        value: {
            items: parsedItems,
            startDate,
            endDate,
            deliveryType,
            customerMessage: toOptionalTrimmedString(input.customerMessage),
            customer: parsedCustomer.value,
        },
    };
}
