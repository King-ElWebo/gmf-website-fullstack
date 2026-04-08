"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import { getItemPriceDisplay } from "@/lib/items/price";
import ImagePanel from "./image-panel";
import { readErrorMessageFromResponse } from "@/lib/http/error-response";
import { validateItemUploadFiles } from "@/lib/uploads/item-upload-limits";

type CategoryOption = { id: string; name: string; slug: string; catalogTypeName?: string };
type PriceType = "FIXED" | "ON_REQUEST" | "FROM_PRICE";

type ImageRow = {
    id: string;
    url: string;
    key: string;
    alt: string | null;
    sortOrder: number;
    file?: File;
};

type ItemFormState = {
    title: string;
    slug: string;
    shortDescription: string;
    longDescription: string;
    videoUrl: string;
    priceType: PriceType;
    basePriceCents: string;
    priceLabel: string;
    depositRequired: boolean;
    depositLabel: string;
    depositInfo: string;
    cleaningFeeApplies: boolean;
    cleaningFeeLabel: string;
    cleaningFeeInfo: string;
    dryingFeeApplies: boolean;
    dryingFeeLabel: string;
    dryingFeeInfo: string;
    additionalCostsInfo: string;
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
    requiresDeliveryAddress: boolean;
    deliveryInfo: string;
    usageInfo: string;
    rentalNotes: string;
    setupRequirements: string;
    accessRequirements: string;
    trackInventory: boolean;
    totalStock: string;
    published: boolean;
    categoryId: string;
};

const sectionClassName = "space-y-4 rounded-lg border p-4";
const inputClassName = "w-full rounded-md border px-3 py-2";
const textareaClassName = "w-full rounded-md border px-3 py-2";
const CLEANING_DEFAULT_TEXT = "Reinigung 120 Euro";
const DRYING_DEFAULT_TEXT = "Trocknung 190 Euro";

function buildDefaultAdditionalCostsText(cleaningFeeApplies: boolean, dryingFeeApplies: boolean) {
    const lines: string[] = [];
    if (cleaningFeeApplies) lines.push(CLEANING_DEFAULT_TEXT);
    if (dryingFeeApplies) lines.push(DRYING_DEFAULT_TEXT);
    return lines.join("\n");
}

export default function ItemForm(props: {
    mode: "create" | "edit";
    itemId?: string;
    categories: CategoryOption[];
    initial?: Partial<ItemFormState>;
    initialImages?: ImageRow[];
    initialError?: string;
}) {
    const router = useRouter();
    const { mode, itemId, categories } = props;

    const [formState, setFormState] = useState<ItemFormState>({
        title: props.initial?.title ?? "",
        slug: props.initial?.slug ?? "",
        shortDescription: props.initial?.shortDescription ?? "",
        longDescription: props.initial?.longDescription ?? "",
        videoUrl: props.initial?.videoUrl ?? "",
        priceType: props.initial?.priceType ?? "FIXED",
        basePriceCents: props.initial?.basePriceCents ?? "",
        priceLabel: props.initial?.priceLabel ?? "",
        depositRequired: Boolean(props.initial?.depositRequired ?? false),
        depositLabel: props.initial?.depositLabel ?? "",
        depositInfo: props.initial?.depositInfo ?? "",
        cleaningFeeApplies: Boolean(props.initial?.cleaningFeeApplies ?? false),
        cleaningFeeLabel: props.initial?.cleaningFeeLabel ?? "",
        cleaningFeeInfo: props.initial?.cleaningFeeInfo ?? "",
        dryingFeeApplies: Boolean(props.initial?.dryingFeeApplies ?? false),
        dryingFeeLabel: props.initial?.dryingFeeLabel ?? "",
        dryingFeeInfo: props.initial?.dryingFeeInfo ?? "",
        additionalCostsInfo: props.initial?.additionalCostsInfo ?? "",
        deliveryAvailable: Boolean(props.initial?.deliveryAvailable ?? false),
        pickupAvailable: Boolean(props.initial?.pickupAvailable ?? false),
        requiresDeliveryAddress: Boolean(props.initial?.requiresDeliveryAddress ?? false),
        deliveryInfo: props.initial?.deliveryInfo ?? "",
        usageInfo: props.initial?.usageInfo ?? "",
        rentalNotes: props.initial?.rentalNotes ?? "",
        setupRequirements: props.initial?.setupRequirements ?? "",
        accessRequirements: props.initial?.accessRequirements ?? "",
        trackInventory: Boolean(props.initial?.trackInventory ?? true),
        totalStock: props.initial?.totalStock ?? "1",
        published: Boolean(props.initial?.published ?? false),
        categoryId: props.initial?.categoryId ?? (categories[0]?.id ?? ""),
    });
    const [slugTouched, setSlugTouched] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(props.initialError ?? null);
    const [localImages, setLocalImages] = useState<ImageRow[]>([]);

    const slug = useMemo(
        () => (slugTouched ? formState.slug : slugify(formState.title)),
        [formState.slug, formState.title, slugTouched]
    );
    const numericPriceRequired = formState.priceType !== "ON_REQUEST";
    const hasNumericPrice = formState.basePriceCents.trim().length > 0;
    const parsedTotalStock = Number(formState.totalStock);
    const hasValidTotalStock = Number.isFinite(parsedTotalStock) && parsedTotalStock >= 0;
    const canSave =
        formState.title.trim().length > 0 &&
        slug.trim().length > 0 &&
        formState.categoryId.trim().length > 0 &&
        (!formState.trackInventory || hasValidTotalStock) &&
        (!numericPriceRequired || hasNumericPrice);

    const previewPrice = getItemPriceDisplay({
        priceType: formState.priceType,
        basePriceCents: hasNumericPrice ? Number(formState.basePriceCents) : null,
        priceLabel: formState.priceLabel.trim() || null,
    });

    function updateField<K extends keyof ItemFormState>(field: K, value: ItemFormState[K]) {
        setFormState((current) => ({ ...current, [field]: value }));
    }

    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        if (!canSave) return;

        setError(null);

        const pendingLocalFiles = localImages
            .filter((image): image is ImageRow & { file: File } => image.file instanceof File)
            .map((image) => image.file);

        if (mode === "create" && pendingLocalFiles.length > 0) {
            const validation = validateItemUploadFiles(
                pendingLocalFiles.map((file) => ({ name: file.name, size: file.size }))
            );
            if (!validation.ok) {
                setError(validation.message);
                return;
            }
        }

        setSaving(true);

        const payload = {
            title: formState.title,
            slug,
            shortDescription: formState.shortDescription,
            longDescription: formState.longDescription,
            description: formState.longDescription,
            videoUrl: formState.videoUrl,
            priceType: formState.priceType,
            basePriceCents: hasNumericPrice ? Number(formState.basePriceCents) : null,
            priceLabel: formState.priceLabel.trim() || null,
            depositRequired: formState.depositRequired,
            depositLabel: formState.depositLabel,
            depositInfo: formState.depositInfo,
            cleaningFeeApplies: formState.cleaningFeeApplies,
            cleaningFeeLabel: formState.cleaningFeeLabel,
            cleaningFeeInfo: formState.cleaningFeeInfo,
            dryingFeeApplies: formState.dryingFeeApplies,
            dryingFeeLabel: formState.dryingFeeLabel,
            dryingFeeInfo: formState.dryingFeeInfo,
            additionalCostsInfo: formState.additionalCostsInfo,
            deliveryAvailable: formState.deliveryAvailable,
            pickupAvailable: formState.pickupAvailable,
            requiresDeliveryAddress: formState.requiresDeliveryAddress,
            deliveryInfo: formState.deliveryInfo,
            usageInfo: formState.usageInfo,
            rentalNotes: formState.rentalNotes,
            setupRequirements: formState.setupRequirements,
            accessRequirements: formState.accessRequirements,
            trackInventory: formState.trackInventory,
            totalStock: hasValidTotalStock ? Math.floor(parsedTotalStock) : 0,
            published: formState.published,
            categoryId: formState.categoryId,
        };

        const url = mode === "create" ? "/api/admin/items" : `/api/admin/items/${itemId}`;
        const method = mode === "create" ? "POST" : "PATCH";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        setSaving(false);

        if (!res.ok) {
            const text = await res.text();
            setError(`Save failed (${res.status}): ${text}`);
            return;
        }

        const data = await res.json().catch(() => ({}));
        const targetId = mode === "create" ? data.item?.id : itemId;

        if (mode === "create" && targetId && localImages.length > 0) {
            try {
                const fd = new FormData();
                for (const image of localImages) {
                    if (image.file) fd.append("files", image.file);
                }
                const imgRes = await fetch(`/api/admin/items/${targetId}/images`, {
                    method: "POST",
                    body: fd,
                });
                if (!imgRes.ok) {
                    const message = await readErrorMessageFromResponse(
                        imgRes,
                        "Bilder konnten nicht hochgeladen werden."
                    );
                    router.push(`/admin/items/${targetId}/edit?uploadError=${encodeURIComponent(message)}`);
                    router.refresh();
                    return;
                }
            } catch (err) {
                console.error("Image upload exception post-creation:", err);
                router.push(`/admin/items/${targetId}/edit?uploadError=${encodeURIComponent("Bilder konnten nicht hochgeladen werden. Bitte erneut versuchen.")}`);
                router.refresh();
                return;
            }
        }

        router.push("/admin/items");
        router.refresh();
    }

    async function onDelete() {
        if (mode !== "edit" || !itemId) return;
        if (!confirm("Delete this item?")) return;

        setDeleting(true);
        setError(null);

        const res = await fetch(`/api/admin/items/${itemId}`, { method: "DELETE" });
        setDeleting(false);

        if (!res.ok) {
            const text = await res.text();
            setError(`Delete failed (${res.status}): ${text}`);
            return;
        }

        router.push("/admin/items");
        router.refresh();
    }

    return (
        <div className="max-w-4xl space-y-4">
            <h1 className="text-2xl font-semibold">{mode === "create" ? "New Item" : "Edit Item"}</h1>

            {categories.length === 0 ? (
                <div className="rounded-md border p-4 text-sm text-neutral-700">
                    You need at least one category before creating items.
                </div>
            ) : (
                <form onSubmit={onSave} className="space-y-4">
                    <section className={sectionClassName}>
                        <div>
                            <h2 className="text-base font-semibold">Stammdaten & Darstellung</h2>
                            <p className="text-sm text-neutral-600">
                                Inhalte fuer Karten, Listen und Produktdetailseiten.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-medium">Titel</label>
                                <input
                                    className={inputClassName}
                                    value={formState.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                    autoFocus={mode === "create"}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Slug</label>
                                <input
                                    className={inputClassName}
                                    value={slug}
                                    onChange={(e) => {
                                        setSlugTouched(true);
                                        updateField("slug", e.target.value);
                                    }}
                                />
                                <p className="text-xs text-neutral-600">Auto-generiert aus dem Titel, aber editierbar.</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Kategorie</label>
                                <select
                                    className={inputClassName}
                                    value={formState.categoryId}
                                    onChange={(e) => updateField("categoryId", e.target.value)}
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.catalogTypeName ? `${category.catalogTypeName} / ` : ""}
                                            {category.name} ({category.slug})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-medium">Kurzbeschreibung</label>
                                <textarea
                                    className={textareaClassName}
                                    rows={3}
                                    value={formState.shortDescription}
                                    onChange={(e) => updateField("shortDescription", e.target.value)}
                                    placeholder="Kurzer Teaser fuer Karten, Listen oder Vorschauen"
                                />
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-medium">Ausfuehrliche Beschreibung</label>
                                <textarea
                                    className={textareaClassName}
                                    rows={6}
                                    value={formState.longDescription}
                                    onChange={(e) => updateField("longDescription", e.target.value)}
                                    placeholder="Inhalt fuer die Detailseite"
                                />
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-medium">Produktvideo-URL</label>
                                <input
                                    type="url"
                                    className={inputClassName}
                                    value={formState.videoUrl}
                                    onChange={(e) => updateField("videoUrl", e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClassName}>
                        <div>
                            <h2 className="text-base font-semibold">Preis & Zusatzkosten</h2>
                            <p className="text-sm text-neutral-600">
                                Preisdarstellung plus pflegbare Hinweise zu Kaution und Nebenkosten.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Price Display Type</label>
                                <select
                                    className={inputClassName}
                                    value={formState.priceType}
                                    onChange={(e) => updateField("priceType", e.target.value as PriceType)}
                                >
                                    <option value="FIXED">Fixed price</option>
                                    <option value="FROM_PRICE">From price</option>
                                    <option value="ON_REQUEST">Price on request</option>
                                </select>
                            </div>

                            {formState.priceType !== "ON_REQUEST" ? (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        {formState.priceType === "FROM_PRICE" ? "Starting price (cents)" : "Fixed price (cents)"}
                                    </label>
                                    <input
                                        type="number"
                                        className={inputClassName}
                                        value={formState.basePriceCents}
                                        onChange={(e) => updateField("basePriceCents", e.target.value)}
                                        placeholder="e.g. 4900"
                                        min={0}
                                        max={2147483647}
                                        step={1}
                                    />
                                </div>
                            ) : (
                                <div className="rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                                    Bei &quot;Price on request&quot; ist kein numerischer Preis erforderlich.
                                </div>
                            )}

                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-medium">Custom price label (optional)</label>
                                <input
                                    className={inputClassName}
                                    value={formState.priceLabel}
                                    onChange={(e) => updateField("priceLabel", e.target.value)}
                                    placeholder='z.B. "ab 49 EUR" oder "Preis auf Anfrage"'
                                />
                                <p className="text-xs text-neutral-600">
                                    If set, this label overrides the automatic frontend display.
                                </p>
                            </div>

                            <div className="rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700 md:col-span-2">
                                Preview: <span className="font-medium">{previewPrice}</span>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3 rounded-md border p-4">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={formState.depositRequired}
                                        onChange={(e) => updateField("depositRequired", e.target.checked)}
                                    />
                                    Kaution erforderlich
                                </label>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Kautions-Label</label>
                                    <input
                                        className={inputClassName}
                                        value={formState.depositLabel}
                                        onChange={(e) => updateField("depositLabel", e.target.value)}
                                        placeholder="z.B. Kaution zzgl."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Kautions-Hinweis</label>
                                    <textarea
                                        className={textareaClassName}
                                        rows={3}
                                        value={formState.depositInfo}
                                        onChange={(e) => updateField("depositInfo", e.target.value)}
                                        placeholder="Freitext fuer Kaution und Rueckgabehinweise"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 rounded-md border p-4">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={formState.cleaningFeeApplies}
                                        onChange={(e) =>
                                            setFormState((current) => {
                                                const nextCleaningFeeApplies = e.target.checked;
                                                const next = {
                                                    ...current,
                                                    cleaningFeeApplies: nextCleaningFeeApplies,
                                                };

                                                if (nextCleaningFeeApplies && !current.cleaningFeeLabel.trim()) {
                                                    next.cleaningFeeLabel = CLEANING_DEFAULT_TEXT;
                                                }

                                                const autoBefore = buildDefaultAdditionalCostsText(
                                                    current.cleaningFeeApplies,
                                                    current.dryingFeeApplies
                                                );
                                                const autoAfter = buildDefaultAdditionalCostsText(
                                                    nextCleaningFeeApplies,
                                                    current.dryingFeeApplies
                                                );
                                                const currentAdditionalCosts = current.additionalCostsInfo.trim();
                                                const shouldAutoUpdateAdditionalCosts =
                                                    !currentAdditionalCosts || currentAdditionalCosts === autoBefore;

                                                if (shouldAutoUpdateAdditionalCosts) {
                                                    next.additionalCostsInfo = autoAfter;
                                                }

                                                return next;
                                            })
                                        }
                                    />
                                    Reinigungskosten relevant
                                </label>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Reinigungs-Label</label>
                                    <input
                                        className={inputClassName}
                                        value={formState.cleaningFeeLabel}
                                        onChange={(e) => updateField("cleaningFeeLabel", e.target.value)}
                                        placeholder="z.B. Reinigung optional"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Reinigungs-Hinweis</label>
                                    <textarea
                                        className={textareaClassName}
                                        rows={3}
                                        value={formState.cleaningFeeInfo}
                                        onChange={(e) => updateField("cleaningFeeInfo", e.target.value)}
                                        placeholder="Freitext fuer Reinigungskosten"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 rounded-md border p-4">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={formState.dryingFeeApplies}
                                        onChange={(e) =>
                                            setFormState((current) => {
                                                const nextDryingFeeApplies = e.target.checked;
                                                const next = {
                                                    ...current,
                                                    dryingFeeApplies: nextDryingFeeApplies,
                                                };

                                                if (nextDryingFeeApplies && !current.dryingFeeLabel.trim()) {
                                                    next.dryingFeeLabel = DRYING_DEFAULT_TEXT;
                                                }

                                                const autoBefore = buildDefaultAdditionalCostsText(
                                                    current.cleaningFeeApplies,
                                                    current.dryingFeeApplies
                                                );
                                                const autoAfter = buildDefaultAdditionalCostsText(
                                                    current.cleaningFeeApplies,
                                                    nextDryingFeeApplies
                                                );
                                                const currentAdditionalCosts = current.additionalCostsInfo.trim();
                                                const shouldAutoUpdateAdditionalCosts =
                                                    !currentAdditionalCosts || currentAdditionalCosts === autoBefore;

                                                if (shouldAutoUpdateAdditionalCosts) {
                                                    next.additionalCostsInfo = autoAfter;
                                                }

                                                return next;
                                            })
                                        }
                                    />
                                    Trocknungskosten relevant
                                </label>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Trocknungs-Label</label>
                                    <input
                                        className={inputClassName}
                                        value={formState.dryingFeeLabel}
                                        onChange={(e) => updateField("dryingFeeLabel", e.target.value)}
                                        placeholder="z.B. Trocknung nach Aufwand"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Trocknungs-Hinweis</label>
                                    <textarea
                                        className={textareaClassName}
                                        rows={3}
                                        value={formState.dryingFeeInfo}
                                        onChange={(e) => updateField("dryingFeeInfo", e.target.value)}
                                        placeholder="Freitext fuer Trocknungskosten"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 rounded-md border p-4 md:col-span-2">
                                <label className="text-sm font-medium">Allgemeine Zusatzkosten-Hinweise</label>
                                <textarea
                                    className={textareaClassName}
                                    rows={3}
                                    value={formState.additionalCostsInfo}
                                    onChange={(e) => updateField("additionalCostsInfo", e.target.value)}
                                    placeholder="Allgemeine Hinweise zu weiteren moeglichen Kosten"
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClassName}>
                        <div>
                            <h2 className="text-base font-semibold">Lieferung, Abholung & Anforderungen</h2>
                            <p className="text-sm text-neutral-600">
                                Verfuegbarkeit und Hinweise fuer Logistik, Nutzung und Aufbau.
                            </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <label className="flex items-center gap-2 rounded-md border px-3 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={formState.deliveryAvailable}
                                    onChange={(e) => updateField("deliveryAvailable", e.target.checked)}
                                />
                                Lieferung verfuegbar
                            </label>
                            <label className="flex items-center gap-2 rounded-md border px-3 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={formState.pickupAvailable}
                                    onChange={(e) => updateField("pickupAvailable", e.target.checked)}
                                />
                                Abholung verfuegbar
                            </label>
                            <label className="flex items-center gap-2 rounded-md border px-3 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={formState.requiresDeliveryAddress}
                                    onChange={(e) => updateField("requiresDeliveryAddress", e.target.checked)}
                                />
                                Lieferadresse erforderlich
                            </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-medium">Lieferhinweise</label>
                                <textarea
                                    className={textareaClassName}
                                    rows={3}
                                    value={formState.deliveryInfo}
                                    onChange={(e) => updateField("deliveryInfo", e.target.value)}
                                    placeholder="Infos zu Lieferung, Abholung oder Zeitfenstern"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Nutzungshinweise</label>
                                <textarea
                                    className={textareaClassName}
                                    rows={4}
                                    value={formState.usageInfo}
                                    onChange={(e) => updateField("usageInfo", e.target.value)}
                                    placeholder="Wichtige Informationen fuer Nutzung oder Einsatz"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Mietnotizen</label>
                                <textarea
                                    className={textareaClassName}
                                    rows={4}
                                    value={formState.rentalNotes}
                                    onChange={(e) => updateField("rentalNotes", e.target.value)}
                                    placeholder="Zusatznotizen fuer Anfrage- oder Checkout-Prozesse"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Aufstellanforderungen</label>
                                <textarea
                                    className={textareaClassName}
                                    rows={4}
                                    value={formState.setupRequirements}
                                    onChange={(e) => updateField("setupRequirements", e.target.value)}
                                    placeholder="Platzbedarf, Aufbau oder technische Voraussetzungen"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Zugangsanforderungen</label>
                                <textarea
                                    className={textareaClassName}
                                    rows={4}
                                    value={formState.accessRequirements}
                                    onChange={(e) => updateField("accessRequirements", e.target.value)}
                                    placeholder="Lift, Einfahrt, Traglast, Anlieferung etc."
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClassName}>
                        <div>
                            <h2 className="text-base font-semibold">Bestand</h2>
                            <p className="text-sm text-neutral-600">
                                Definiert, wie viele Einheiten dieses Produkts gleichzeitig für denselben Zeitraum angefragt werden dürfen.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex items-center gap-2 rounded-md border px-3 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={formState.trackInventory}
                                    onChange={(e) => updateField("trackInventory", e.target.checked)}
                                />
                                Bestand aktiv verwalten
                            </label>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Maximaler Bestand</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={1}
                                    className={inputClassName}
                                    value={formState.totalStock}
                                    onChange={(e) => updateField("totalStock", e.target.value)}
                                    disabled={!formState.trackInventory}
                                />
                                <p className="text-xs text-neutral-500">
                                    {formState.trackInventory
                                        ? "0 bedeutet: aktuell keine verfügbare Einheit."
                                        : "Wenn deaktiviert, wird die Menge nicht bestandsbegrenzt."}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className={sectionClassName}>
                        <div>
                            <h2 className="text-base font-semibold">Status</h2>
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={formState.published}
                                onChange={(e) => updateField("published", e.target.checked)}
                            />
                            Published
                        </label>
                    </section>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex gap-2">
                        <button
                            disabled={saving || !canSave || categories.length === 0}
                            className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>

                        {mode === "edit" && (
                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={deleting}
                                className="rounded-md border px-4 py-2 text-sm disabled:opacity-60"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        )}
                    </div>
                </form>
            )}

            {mode === "create" ? (
                <ImagePanel initialImages={[]} onChangeLocal={setLocalImages} />
            ) : itemId ? (
                <ImagePanel itemId={itemId} initialImages={props.initialImages ?? []} />
            ) : null}
        </div>
    );
}
