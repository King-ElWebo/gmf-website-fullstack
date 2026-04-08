import type { ItemInput } from "@/lib/repositories/items";

const PRICE_TYPES = new Set(["FIXED", "ON_REQUEST", "FROM_PRICE"]);

function asTrimmedText(value: unknown) {
    return typeof value === "string" ? value.trim() || null : null;
}

function asBoolean(value: unknown) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true") return true;
        if (normalized === "false") return false;
    }

    return Boolean(value);
}

type ParseResult =
    | { ok: true; data: ItemInput }
    | { ok: false; error: string; status: number };

export function parseAdminItemPayload(body: Record<string, unknown> | null): ParseResult {
    const title = asTrimmedText(body?.title);
    const slug = asTrimmedText(body?.slug);
    const description = asTrimmedText(body?.description);
    const shortDescription = asTrimmedText(body?.shortDescription);
    const longDescription = asTrimmedText(body?.longDescription) ?? description;
    const videoUrl = asTrimmedText(body?.videoUrl);

    const categoryId = asTrimmedText(body?.categoryId);
    const published = asBoolean(body?.published);
    const trackInventory = asBoolean(body?.trackInventory ?? true);
    const totalStockRaw = body?.totalStock;
    const totalStock =
        totalStockRaw === "" || totalStockRaw === null || totalStockRaw === undefined
            ? 1
            : Number(totalStockRaw);
    const priceType = typeof body?.priceType === "string" ? body.priceType.trim() : "FIXED";
    const priceLabel = asTrimmedText(body?.priceLabel);

    const basePriceCentsRaw = body?.basePriceCents ?? body?.priceCents;
    const basePriceCents =
        basePriceCentsRaw === "" || basePriceCentsRaw === null || basePriceCentsRaw === undefined
            ? null
            : Number(basePriceCentsRaw);

    if (!title || !slug || !categoryId) {
        return { ok: false, error: "title, slug, categoryId are required", status: 400 };
    }

    if (!PRICE_TYPES.has(priceType)) {
        return { ok: false, error: "priceType is invalid", status: 400 };
    }

    if (
        basePriceCents !== null &&
        (!Number.isFinite(basePriceCents) || basePriceCents < 0 || basePriceCents > 2147483647)
    ) {
        return { ok: false, error: "basePriceCents must be a positive number up to 2147483647", status: 400 };
    }

    if (!Number.isFinite(totalStock) || totalStock < 0 || totalStock > 2147483647) {
        return { ok: false, error: "totalStock must be a number between 0 and 2147483647", status: 400 };
    }

    if (priceType !== "ON_REQUEST" && basePriceCents === null) {
        return { ok: false, error: "A numeric base price is required for FIXED and FROM_PRICE", status: 400 };
    }

    return {
        ok: true,
        data: {
            title,
            slug,
            description: longDescription,
            shortDescription,
            longDescription,
            videoUrl,
            priceType: priceType as ItemInput["priceType"],
            basePriceCents: basePriceCents === null ? null : Math.round(basePriceCents),
            priceCents: basePriceCents === null ? null : Math.round(basePriceCents),
            priceLabel,
            depositRequired: asBoolean(body?.depositRequired),
            depositLabel: asTrimmedText(body?.depositLabel),
            depositInfo: asTrimmedText(body?.depositInfo),
            cleaningFeeApplies: asBoolean(body?.cleaningFeeApplies),
            cleaningFeeLabel: asTrimmedText(body?.cleaningFeeLabel),
            cleaningFeeInfo: asTrimmedText(body?.cleaningFeeInfo),
            dryingFeeApplies: asBoolean(body?.dryingFeeApplies),
            dryingFeeLabel: asTrimmedText(body?.dryingFeeLabel),
            dryingFeeInfo: asTrimmedText(body?.dryingFeeInfo),
            additionalCostsInfo: asTrimmedText(body?.additionalCostsInfo),
            deliveryAvailable: asBoolean(body?.deliveryAvailable),
            pickupAvailable: asBoolean(body?.pickupAvailable),
            requiresDeliveryAddress: asBoolean(body?.requiresDeliveryAddress),
            deliveryInfo: asTrimmedText(body?.deliveryInfo),
            usageInfo: asTrimmedText(body?.usageInfo),
            rentalNotes: asTrimmedText(body?.rentalNotes),
            setupRequirements: asTrimmedText(body?.setupRequirements),
            accessRequirements: asTrimmedText(body?.accessRequirements),
            trackInventory,
            totalStock: Math.floor(totalStock),
            published,
            categoryId,
        },
    };
}
