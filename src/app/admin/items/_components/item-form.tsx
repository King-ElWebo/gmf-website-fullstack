"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { slugify } from "@/lib/slug";
import { getItemPriceDisplay } from "@/lib/items/price";
import ImagePanel from "./image-panel";
import { readErrorMessageFromResponse } from "@/lib/http/error-response";
import { validateItemUploadFiles } from "@/lib/uploads/item-upload-limits";

type CategoryOption = { id: string; name: string; slug: string; catalogTypeName?: string; catalogTypeId: string };
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

const sectionClassName = "group space-y-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5";
const inputClassName = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400";
const textareaClassName = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const labelClassName = "text-sm font-medium text-slate-700";
const helperClassName = "text-xs text-slate-500";
const CLEANING_DEFAULT_TEXT = "Reinigung: 120 € exkl. MwSt. bei grober/mutwilliger Verschmutzung";
const DRYING_DEFAULT_TEXT = "Trocknung: 165 € netto pro Hüpfburg bei Nässe/Regen";

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
    catalogTypes: { id: string; name: string }[];
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
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(props.initialError ?? null);
    const [localImages, setLocalImages] = useState<ImageRow[]>([]);

    // Determine initial catalog type
    const initialCategory = categories.find((c) => c.id === (props.initial?.categoryId ?? formState.categoryId));
    const initialCatalogTypeId = initialCategory?.catalogTypeId ?? (props.catalogTypes?.[0]?.id ?? "");
    const [selectedCatalogTypeId, setSelectedCatalogTypeId] = useState(initialCatalogTypeId);

    const filteredCategories = useMemo(() => {
        return categories.filter((c) => c.catalogTypeId === selectedCatalogTypeId);
    }, [categories, selectedCatalogTypeId]);

    const handleCatalogTypeChange = (newCatalogTypeId: string) => {
        setSelectedCatalogTypeId(newCatalogTypeId);
        const filtered = categories.filter((c) => c.catalogTypeId === newCatalogTypeId);
        if (filtered.length > 0) {
            updateField("categoryId", filtered[0].id);
        } else {
            updateField("categoryId", "");
        }
    };

    const slug = useMemo(() => {
        if (mode === "edit" && props.initial?.slug) {
            if (formState.title === props.initial?.title) {
                return props.initial.slug;
            }
        }
        return slugify(formState.title);
    }, [formState.title, mode, props.initial?.slug, props.initial?.title]);
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
                    <div className="sticky top-4 z-20 rounded-[22px] border border-slate-200 bg-white/95 p-3 shadow-lg shadow-slate-900/10 backdrop-blur">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-slate-950">
                                    {formState.title.trim() || "Unbenanntes Produkt"}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                    <span className={`rounded-full px-2.5 py-1 font-semibold ${formState.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                        {formState.published ? "Published" : "Draft"}
                                    </span>
                                    <span>{previewPrice}</span>
                                    {!canSave && <span className="text-amber-700">Pflichtfelder prüfen</span>}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={formState.published}
                                        onChange={(e) => updateField("published", e.target.checked)}
                                    />
                                    Published
                                </label>

                                {mode === "edit" && (
                                    <a
                                        href={`/produkt/${slug}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        Öffentliche Seite
                                    </a>
                                )}

                                {mode === "edit" && (
                                    <button
                                        type="button"
                                        onClick={onDelete}
                                        disabled={deleting}
                                        className="h-10 rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                                    >
                                        {deleting ? "Löscht..." : "Löschen"}
                                    </button>
                                )}

                                <button
                                    disabled={saving || !canSave || categories.length === 0}
                                    className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? "Speichert..." : "Speichern"}
                                </button>
                            </div>
                        </div>
                    </div>
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
                                <label className="text-sm font-medium">Katalogtyp</label>
                                <select
                                    className={inputClassName}
                                    value={selectedCatalogTypeId}
                                    onChange={(e) => handleCatalogTypeChange(e.target.value)}
                                >
                                    {props.catalogTypes.map((ct) => (
                                        <option key={ct.id} value={ct.id}>
                                            {ct.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Kategorie</label>
                                <select
                                    className={inputClassName}
                                    value={formState.categoryId}
                                    onChange={(e) => updateField("categoryId", e.target.value)}
                                >
                                    {filteredCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
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

                            <div className="space-y-1">
                                <label className={labelClassName}>Preisstatus</label>
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
                                    <label className={labelClassName}>
                                        {formState.priceType === "FROM_PRICE" ? "Startpreis (Cent)" : "Fixpreis (Cent)"}
                                    </label>
                                    <input
                                        type="number"
                                        className={inputClassName}
                                        value={formState.basePriceCents}
                                        onChange={(e) => updateField("basePriceCents", e.target.value)}
                                        placeholder="z.B. 4900"
                                        min={0}
                                        max={2147483647}
                                        step={1}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-end">
                                    <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                                        Kein numerischer Preis erforderlich.
                                    </div>
                                </div>
                            )}

                            <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900 md:col-span-2">
                                Preisvorschau: <span className="font-semibold">{previewPrice}</span>
                            </div>

                            <details className="group md:col-span-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-slate-800 select-none">
                                    <span>Beschreibung & Medien</span>
                                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180 duration-200" />
                                </summary>
                                <div className="mt-4 grid gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Ausfuehrliche Beschreibung</label>
                                        <textarea
                                            className={textareaClassName}
                                            rows={6}
                                            value={formState.longDescription}
                                            onChange={(e) => updateField("longDescription", e.target.value)}
                                            placeholder="Inhalt fuer die Detailseite"
                                        />
                                    </div>

                                    <div className="space-y-1">
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
                            </details>
                        </div>
                    </section>

                    <section className={sectionClassName}>
                        <div>
                            <h2 className="text-base font-semibold">Bilder & Cover</h2>
                            <p className="text-sm text-neutral-600">
                                Titelbild, Upload und Reihenfolge direkt bei den wichtigsten Produktdaten.
                            </p>
                        </div>
                        {mode === "create" ? (
                            <ImagePanel initialImages={[]} onChangeLocal={setLocalImages} />
                        ) : itemId ? (
                            <ImagePanel itemId={itemId} initialImages={props.initialImages ?? []} />
                        ) : null}
                    </section>

                    <details className={sectionClassName}>
                        <summary className="flex cursor-pointer items-center justify-between list-none select-none">
                            <div>
                                <h2 className="text-base font-semibold">Preis & Zusatzkosten</h2>
                                <p className="text-sm text-neutral-600">
                                    Preisdarstellung plus pflegbare Hinweise zu Kaution und Nebenkosten.
                                </p>
                            </div>
                            <ChevronDown className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-180 duration-200" />
                        </summary>

                        <div className="grid gap-4 md:grid-cols-2">
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
                    </details>

                    <details className={sectionClassName}>
                        <summary className="flex cursor-pointer items-center justify-between list-none select-none">
                            <div>
                                <h2 className="text-base font-semibold">Lieferung, Abholung & Anforderungen</h2>
                                <p className="text-sm text-neutral-600">
                                    Verfuegbarkeit und Hinweise fuer Logistik, Nutzung und Aufbau.
                                </p>
                            </div>
                            <ChevronDown className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-180 duration-200" />
                        </summary>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Liefer- & Abholungsoptionen</label>
                                <select
                                    value={formState.pickupAvailable && formState.deliveryAvailable ? "both" : formState.pickupAvailable ? "pickup" : formState.deliveryAvailable ? "delivery" : "both"}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "pickup") {
                                            updateField("pickupAvailable", true);
                                            updateField("deliveryAvailable", false);
                                        } else if (val === "delivery") {
                                            updateField("pickupAvailable", false);
                                            updateField("deliveryAvailable", true);
                                        } else {
                                            updateField("pickupAvailable", true);
                                            updateField("deliveryAvailable", true);
                                        }
                                    }}
                                    className="w-full rounded-md border px-3 py-2 bg-white"
                                >
                                    <option value="both">Beides (Abholung & Lieferung)</option>
                                    <option value="pickup">Nur Selbstabholung</option>
                                    <option value="delivery">Nur Lieferung</option>
                                </select>
                            </div>

                            {formState.deliveryAvailable && (
                                <div className="space-y-1 flex flex-col justify-end">
                                    <label className="flex items-center gap-2 rounded-md border px-3 py-3 text-sm h-[42px] bg-white cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={formState.requiresDeliveryAddress}
                                            onChange={(e) => updateField("requiresDeliveryAddress", e.target.checked)}
                                        />
                                        Lieferadresse erforderlich
                                    </label>
                                </div>
                            )}
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
                    </details>

                    <details className={sectionClassName}>
                        <summary className="flex cursor-pointer items-center justify-between list-none select-none">
                            <div>
                                <h2 className="text-base font-semibold">Bestand</h2>
                                <p className="text-sm text-neutral-600">
                                    Definiert, wie viele Einheiten dieses Produkts gleichzeitig für denselben Zeitraum angefragt werden dürfen.
                                </p>
                            </div>
                            <ChevronDown className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-180 duration-200" />
                        </summary>

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
                    </details>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex gap-2">
                        <button
                            disabled={saving || !canSave || categories.length === 0}
                            className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Speichert..." : "Speichern"}
                        </button>

                        {mode === "edit" && (
                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={deleting}
                                className="h-10 rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                            >
                                {deleting ? "Löscht..." : "Löschen"}
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}
