type PriceLike = {
    priceType: "FIXED" | "ON_REQUEST" | "FROM_PRICE";
    basePriceCents?: number | null;
    priceCents?: number | null;
    priceLabel?: string | null;
};

type MediaLike = {
    url: string;
    type?: "IMAGE" | "VIDEO" | null;
};

type DescriptiveLike = {
    shortDescription?: string | null;
    description?: string | null;
    longDescription?: string | null;
};

export function formatCurrency(cents: number) {
    return cents.toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR",
    });
}

export function formatItemPrice(item: PriceLike) {
    if (item.priceLabel?.trim()) return item.priceLabel.trim();

    const cents = item.basePriceCents ?? item.priceCents;

    if (item.priceType === "ON_REQUEST") {
        return "Preis auf Anfrage";
    }

    if (item.priceType === "FROM_PRICE") {
        return cents != null ? `ab ${formatCurrency(cents)} / Tag` : "Preis auf Anfrage";
    }

    return cents != null ? `${formatCurrency(cents)} / Tag` : "Preis auf Anfrage";
}

export function getPrimaryImageUrl(item: { images: MediaLike[] }) {
    return item.images.find((image) => image.type !== "VIDEO")?.url ?? item.images[0]?.url ?? "";
}

export function getVideoUrl(item: { videoUrl?: string | null; images: MediaLike[] }) {
    return item.videoUrl ?? item.images.find((image) => image.type === "VIDEO")?.url ?? null;
}

export function getItemSummary(item: DescriptiveLike) {
    return item.shortDescription?.trim() || item.description?.trim() || item.longDescription?.trim() || "";
}

export function getItemLongDescription(item: DescriptiveLike) {
    return item.longDescription?.trim() || item.description?.trim() || item.shortDescription?.trim() || "";
}
