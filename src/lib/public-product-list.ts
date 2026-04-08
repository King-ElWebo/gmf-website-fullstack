import { listPublishedItems, listCategories } from "@/lib/repositories/catalog";
import { listCatalogTypesForSelect } from "@/lib/repositories/catalog-types";
import { formatItemPrice, getItemSummary, getPrimaryImageUrl } from "@/lib/public-catalog";

const LIGHTING_AUDIO_SLUG_CANDIDATES = [
    "licht-tontechnik",
    "licht-und-tontechnik",
    "lichttontechnik",
    "licht-ton",
    "licht",
];

function normalizeValue(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function isLikelyLightingAudioCatalogType(name: string, slug: string) {
    const normalizedName = normalizeValue(name);
    const normalizedSlug = normalizeValue(slug);
    const hasLight = normalizedName.includes("licht") || normalizedSlug.includes("licht");
    const hasAudio =
        normalizedName.includes("ton") ||
        normalizedSlug.includes("ton") ||
        normalizedName.includes("audio") ||
        normalizedSlug.includes("audio") ||
        normalizedName.includes("sound") ||
        normalizedSlug.includes("sound");

    return hasLight && hasAudio;
}

export async function resolveLightingAudioCatalogTypeSlug() {
    const catalogTypes = await listCatalogTypesForSelect();
    if (catalogTypes.length === 0) return null;

    const exactCandidate = catalogTypes.find((catalogType) =>
        LIGHTING_AUDIO_SLUG_CANDIDATES.some((candidate) => normalizeValue(catalogType.slug) === normalizeValue(candidate))
    );
    if (exactCandidate) return exactCandidate.slug;

    const likelyCatalogType = catalogTypes.find((catalogType) =>
        isLikelyLightingAudioCatalogType(catalogType.name, catalogType.slug)
    );
    if (likelyCatalogType) return likelyCatalogType.slug;

    return null;
}

export async function getProduktFilterData(options: { catalogTypeSlug?: string } = {}) {
    const [items, categories] = await Promise.all([
        listPublishedItems({ catalogTypeSlug: options.catalogTypeSlug }),
        listCategories(options.catalogTypeSlug),
    ]);

    const mappedItems = items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: getItemSummary(item),
        price: formatItemPrice(item),
        priceType: item.priceType,
        basePriceCents: item.basePriceCents ?? item.priceCents,
        priceLabel: item.priceLabel,
        trackInventory: item.trackInventory,
        totalStock: item.totalStock,
        imageUrl: getPrimaryImageUrl(item),
        categoryName: item.category.name,
        categorySlug: item.category.slug,
        catalogTypeName: item.category.catalogType.name,
        catalogTypeSlug: item.category.catalogType.slug,
    }));

    const mappedCategories = categories.map((category) => ({
        name: category.name,
        slug: category.slug,
        catalogTypeName: category.catalogType.name,
        catalogTypeSlug: category.catalogType.slug,
    }));

    return {
        items: mappedItems,
        categories: mappedCategories,
    };
}
