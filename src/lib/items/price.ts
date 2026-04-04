export type ItemPriceLike = {
    priceType: "FIXED" | "ON_REQUEST" | "FROM_PRICE";
    basePriceCents: number | null;
    priceLabel: string | null;
};

export function formatPriceCents(value: number) {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
    }).format(value / 100);
}

export function getItemPriceDisplay(price: ItemPriceLike) {
    const customLabel = price.priceLabel?.trim();
    if (customLabel) {
        return customLabel;
    }

    if (price.priceType === "ON_REQUEST") {
        return "Preis auf Anfrage";
    }

    if (typeof price.basePriceCents === "number") {
        const formatted = formatPriceCents(price.basePriceCents);
        return price.priceType === "FROM_PRICE" ? `ab ${formatted}` : formatted;
    }

    return price.priceType === "FROM_PRICE" ? "ab Preis folgt" : "-";
}
