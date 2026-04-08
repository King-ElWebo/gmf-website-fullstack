import type { ItemPriceLike } from "@/lib/items/price";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const AUTO_PRICE_MULTIPLIERS = {
    1: 1,
    2: 1.5,
    3: 2,
} as const;

export type InquiryCartPriceType = ItemPriceLike["priceType"];

export type InquiryCartPriceInput = {
    priceType: InquiryCartPriceType;
    basePriceCents: number | null;
    quantity: number;
};

export type InquiryCartItemPriceResult = {
    bookingDays: number | null;
    multiplier: number | null;
    isAutoCalculated: boolean;
    reason:
        | "missing_date_range"
        | "invalid_date_range"
        | "duration_over_limit"
        | "on_request_price"
        | "from_price"
        | "missing_base_price"
        | "invalid_quantity"
        | null;
    calculatedUnitPriceCents: number | null;
    calculatedTotalPriceCents: number | null;
};

type DurationResult = {
    days: number | null;
    reason: "missing_date_range" | "invalid_date_range" | null;
};

function parseDateKeyToUtcMs(dateKey: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const parsed = new Date(Date.UTC(year, month - 1, day));

    if (
        parsed.getUTCFullYear() !== year ||
        parsed.getUTCMonth() !== month - 1 ||
        parsed.getUTCDate() !== day
    ) {
        return null;
    }

    return parsed.getTime();
}

export function getBookingDurationDays(startDate: string, endDate: string): DurationResult {
    if (!startDate || !endDate) {
        return { days: null, reason: "missing_date_range" };
    }

    const startMs = parseDateKeyToUtcMs(startDate);
    const endMs = parseDateKeyToUtcMs(endDate);

    if (startMs == null || endMs == null || endMs < startMs) {
        return { days: null, reason: "invalid_date_range" };
    }

    const days = Math.floor((endMs - startMs) / DAY_IN_MS) + 1;
    return { days, reason: null };
}

export function getDurationMultiplier(days: number) {
    if (days in AUTO_PRICE_MULTIPLIERS) {
        return AUTO_PRICE_MULTIPLIERS[days as keyof typeof AUTO_PRICE_MULTIPLIERS];
    }

    return null;
}

export function calculateInquiryCartItemPrice(
    item: InquiryCartPriceInput,
    startDate: string,
    endDate: string
): InquiryCartItemPriceResult {
    const duration = getBookingDurationDays(startDate, endDate);
    if (duration.days == null) {
        return {
            bookingDays: null,
            multiplier: null,
            isAutoCalculated: false,
            reason: duration.reason,
            calculatedUnitPriceCents: null,
            calculatedTotalPriceCents: null,
        };
    }

    if (duration.days > 3) {
        return {
            bookingDays: duration.days,
            multiplier: null,
            isAutoCalculated: false,
            reason: "duration_over_limit",
            calculatedUnitPriceCents: null,
            calculatedTotalPriceCents: null,
        };
    }

    if (item.priceType === "ON_REQUEST") {
        return {
            bookingDays: duration.days,
            multiplier: null,
            isAutoCalculated: false,
            reason: "on_request_price",
            calculatedUnitPriceCents: null,
            calculatedTotalPriceCents: null,
        };
    }

    if (item.priceType === "FROM_PRICE") {
        return {
            bookingDays: duration.days,
            multiplier: null,
            isAutoCalculated: false,
            reason: "from_price",
            calculatedUnitPriceCents: null,
            calculatedTotalPriceCents: null,
        };
    }

    if (item.basePriceCents == null || !Number.isFinite(item.basePriceCents)) {
        return {
            bookingDays: duration.days,
            multiplier: null,
            isAutoCalculated: false,
            reason: "missing_base_price",
            calculatedUnitPriceCents: null,
            calculatedTotalPriceCents: null,
        };
    }

    if (!Number.isFinite(item.quantity) || item.quantity < 1) {
        return {
            bookingDays: duration.days,
            multiplier: null,
            isAutoCalculated: false,
            reason: "invalid_quantity",
            calculatedUnitPriceCents: null,
            calculatedTotalPriceCents: null,
        };
    }

    const multiplier = getDurationMultiplier(duration.days);

    if (multiplier == null) {
        return {
            bookingDays: duration.days,
            multiplier: null,
            isAutoCalculated: false,
            reason: "duration_over_limit",
            calculatedUnitPriceCents: null,
            calculatedTotalPriceCents: null,
        };
    }

    const calculatedUnitPriceCents = Math.round(item.basePriceCents * multiplier);
    const calculatedTotalPriceCents = calculatedUnitPriceCents * item.quantity;

    return {
        bookingDays: duration.days,
        multiplier,
        isAutoCalculated: true,
        reason: null,
        calculatedUnitPriceCents,
        calculatedTotalPriceCents,
    };
}
