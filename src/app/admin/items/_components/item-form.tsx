"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { slugify } from "@/lib/slug";
import { getItemPriceDisplay } from "@/lib/items/price";
import ImagePanel from "./image-panel";
import { readErrorMessageFromResponse } from "@/lib/http/error-response";
import { validateItemUploadFiles } from "@/lib/uploads/item-upload-limits";
import { clientOptimizeImage } from "@/lib/images/client-optimize";
import { AdminCard } from "../../_components/ui/AdminCard";
import { AdminField, AdminInput, AdminTextarea, AdminCheckbox, AdminSelect } from "../../_components/ui/AdminInputs";
import { AdminButton } from "../../_components/ui/AdminButton";

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
                    if (image.file) {
                        const optimized = await clientOptimizeImage(image.file);
                        fd.append("files", optimized);
                    }
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
            const data = await res.json().catch(() => null);
            const msg = data?.error || `Delete failed (${res.status})`;
            setError(msg);
            return;
        }

        router.push("/admin/items");
        router.refresh();
    }

    return (
        <div className="max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">{mode === "create" ? "New Item" : "Edit Item"}</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Produktdaten, Preise, Bilder und Bestand für dieses Eventmodul verwalten.
                </p>
            </div>

            {categories.length === 0 ? (
                <div className="rounded-md border p-4 text-sm text-neutral-700">
                    You need at least one category before creating items.
                </div>
            ) : (
                <form onSubmit={onSave} className="space-y-4">
                    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                        <div className="space-y-6">
                    <AdminCard title="Stammdaten & Darstellung" description="Inhalte fuer Karten, Listen und Produktdetailseiten.">
                        <div className="space-y-5">
                            <AdminField label="Titel" htmlFor="title">
                                <AdminInput
                                    id="title"
                                    value={formState.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                    autoFocus={mode === "create"}
                                />
                            </AdminField>

                            <div className="grid gap-4 md:grid-cols-2">
                                <AdminField label="Katalogtyp" htmlFor="catalogType">
                                    <AdminSelect
                                        id="catalogType"
                                        value={selectedCatalogTypeId}
                                        onChange={(e) => handleCatalogTypeChange(e.target.value)}
                                    >
                                        {props.catalogTypes.map((ct) => (
                                            <option key={ct.id} value={ct.id}>
                                                {ct.name}
                                            </option>
                                        ))}
                                    </AdminSelect>
                                </AdminField>

                                <AdminField label="Kategorie" htmlFor="category">
                                    <AdminSelect
                                        id="category"
                                        value={formState.categoryId}
                                        onChange={(e) => updateField("categoryId", e.target.value)}
                                    >
                                        {filteredCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name} ({category.slug})
                                            </option>
                                        ))}
                                    </AdminSelect>
                                </AdminField>
                            </div>

                            <AdminField label="Kurzbeschreibung" htmlFor="shortDescription">
                                <AdminTextarea
                                    id="shortDescription"
                                    rows={3}
                                    value={formState.shortDescription}
                                    onChange={(e) => updateField("shortDescription", e.target.value)}
                                    placeholder="Kurzer Teaser fuer Karten, Listen oder Vorschauen"
                                />
                            </AdminField>
                            
                            <AdminField label="Ausführliche Beschreibung" htmlFor="longDescription">
                                <AdminTextarea
                                    id="longDescription"
                                    rows={6}
                                    value={formState.longDescription}
                                    onChange={(e) => updateField("longDescription", e.target.value)}
                                    placeholder="Inhalt fuer die Detailseite"
                                />
                            </AdminField>

                            <AdminField label="Produktvideo-URL" htmlFor="videoUrl">
                                <AdminInput
                                    id="videoUrl"
                                    type="url"
                                    value={formState.videoUrl}
                                    onChange={(e) => updateField("videoUrl", e.target.value)}
                                    placeholder="https://..."
                                />
                            </AdminField>
                        </div>
                    </AdminCard>

                    <AdminCard title="Preis & Zusatzkosten" description="Preisdarstellung plus pflegbare Hinweise zu Kaution und Nebenkosten.">
                        <div className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <AdminField label="Preisstatus" htmlFor="priceType">
                                    <AdminSelect
                                        id="priceType"
                                        value={formState.priceType}
                                        onChange={(e) => updateField("priceType", e.target.value as PriceType)}
                                    >
                                        <option value="FIXED">Fixed price</option>
                                        <option value="FROM_PRICE">From price</option>
                                        <option value="ON_REQUEST">Price on request</option>
                                    </AdminSelect>
                                </AdminField>

                                {formState.priceType !== "ON_REQUEST" ? (
                                    <AdminField 
                                        label={formState.priceType === "FROM_PRICE" ? "Startpreis (Cent)" : "Fixpreis (Cent)"} 
                                        htmlFor="basePriceCents"
                                    >
                                        <AdminInput
                                            id="basePriceCents"
                                            type="number"
                                            value={formState.basePriceCents}
                                            onChange={(e) => updateField("basePriceCents", e.target.value)}
                                            placeholder="z.B. 4900"
                                            min={0}
                                            max={2147483647}
                                            step={1}
                                        />
                                    </AdminField>
                                ) : (
                                    <div className="flex items-end">
                                        <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                                            Kein numerischer Preis erforderlich.
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                                Preisvorschau: <span className="font-semibold">{previewPrice}</span>
                            </div>

                            <AdminField label="Custom price label (optional)" htmlFor="priceLabel" helperText="If set, this label overrides the automatic frontend display.">
                                <AdminInput
                                    id="priceLabel"
                                    value={formState.priceLabel}
                                    onChange={(e) => updateField("priceLabel", e.target.value)}
                                    placeholder='z.B. "ab 49 EUR" oder "Preis auf Anfrage"'
                                />
                            </AdminField>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                    <AdminCheckbox
                                        checked={formState.depositRequired}
                                        onChange={(e) => updateField("depositRequired", e.target.checked)}
                                        label="Kaution erforderlich"
                                    />
                                    <AdminField label="Kautions-Label" htmlFor="depositLabel">
                                        <AdminInput
                                            id="depositLabel"
                                            value={formState.depositLabel}
                                            onChange={(e) => updateField("depositLabel", e.target.value)}
                                            placeholder="z.B. Kaution zzgl."
                                        />
                                    </AdminField>
                                    <AdminField label="Kautions-Hinweis" htmlFor="depositInfo">
                                        <AdminTextarea
                                            id="depositInfo"
                                            rows={3}
                                            value={formState.depositInfo}
                                            onChange={(e) => updateField("depositInfo", e.target.value)}
                                            placeholder="Freitext fuer Kaution und Rueckgabehinweise"
                                        />
                                    </AdminField>
                                </div>

                                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                    <AdminCheckbox
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
                                        label="Reinigungskosten relevant"
                                    />
                                    <AdminField label="Reinigungs-Label" htmlFor="cleaningFeeLabel">
                                        <AdminInput
                                            id="cleaningFeeLabel"
                                            value={formState.cleaningFeeLabel}
                                            onChange={(e) => updateField("cleaningFeeLabel", e.target.value)}
                                            placeholder="z.B. Reinigung optional"
                                        />
                                    </AdminField>
                                    <AdminField label="Reinigungs-Hinweis" htmlFor="cleaningFeeInfo">
                                        <AdminTextarea
                                            id="cleaningFeeInfo"
                                            rows={3}
                                            value={formState.cleaningFeeInfo}
                                            onChange={(e) => updateField("cleaningFeeInfo", e.target.value)}
                                            placeholder="Freitext fuer Reinigungskosten"
                                        />
                                    </AdminField>
                                </div>

                                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                    <AdminCheckbox
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
                                        label="Trocknungskosten relevant"
                                    />
                                    <AdminField label="Trocknungs-Label" htmlFor="dryingFeeLabel">
                                        <AdminInput
                                            id="dryingFeeLabel"
                                            value={formState.dryingFeeLabel}
                                            onChange={(e) => updateField("dryingFeeLabel", e.target.value)}
                                            placeholder="z.B. Trocknung nach Aufwand"
                                        />
                                    </AdminField>
                                    <AdminField label="Trocknungs-Hinweis" htmlFor="dryingFeeInfo">
                                        <AdminTextarea
                                            id="dryingFeeInfo"
                                            rows={3}
                                            value={formState.dryingFeeInfo}
                                            onChange={(e) => updateField("dryingFeeInfo", e.target.value)}
                                            placeholder="Freitext fuer Trocknungskosten"
                                        />
                                    </AdminField>
                                </div>
                                
                                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                                    <AdminField label="Allgemeine Zusatzkosten-Hinweise" htmlFor="additionalCostsInfo">
                                        <AdminTextarea
                                            id="additionalCostsInfo"
                                            rows={9}
                                            value={formState.additionalCostsInfo}
                                            onChange={(e) => updateField("additionalCostsInfo", e.target.value)}
                                            placeholder="Allgemeine Hinweise zu weiteren moeglichen Kosten"
                                        />
                                    </AdminField>
                                </div>
                            </div>
                        </div>
                    </AdminCard>
                </div>

                <div className="space-y-6">
                    <AdminCard title="Bilder & Cover" description="Titelbild, Upload und Reihenfolge direkt bei den wichtigsten Produktdaten.">
                        {mode === "create" ? (
                            <ImagePanel initialImages={[]} onChangeLocal={setLocalImages} />
                        ) : itemId ? (
                            <ImagePanel itemId={itemId} initialImages={props.initialImages ?? []} />
                        ) : null}
                    </AdminCard>
                    <AdminCard title="Lieferung, Abholung & Anforderungen" description="Verfuegbarkeit und Hinweise fuer Logistik, Nutzung und Aufbau.">
                        <div className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <AdminField label="Liefer- & Abholungsoptionen" htmlFor="deliveryOption">
                                    <AdminSelect
                                        id="deliveryOption"
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
                                    >
                                        <option value="both">Beides (Abholung & Lieferung)</option>
                                        <option value="pickup">Nur Selbstabholung</option>
                                        <option value="delivery">Nur Lieferung</option>
                                    </AdminSelect>
                                </AdminField>

                                {formState.deliveryAvailable && (
                                    <div className="flex items-end">
                                        <div className="h-10 border border-slate-200 bg-slate-50 flex items-center px-4 rounded-xl w-full">
                                            <AdminCheckbox
                                                checked={formState.requiresDeliveryAddress}
                                                onChange={(e) => updateField("requiresDeliveryAddress", e.target.checked)}
                                                label="Lieferadresse erforderlich"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <AdminField label="Lieferhinweise" htmlFor="deliveryInfo">
                                <AdminTextarea
                                    id="deliveryInfo"
                                    rows={3}
                                    value={formState.deliveryInfo}
                                    onChange={(e) => updateField("deliveryInfo", e.target.value)}
                                    placeholder="Infos zu Lieferung, Abholung oder Zeitfenstern"
                                />
                            </AdminField>

                            <AdminField label="Nutzungshinweise" htmlFor="usageInfo">
                                <AdminTextarea
                                    id="usageInfo"
                                    rows={4}
                                    value={formState.usageInfo}
                                    onChange={(e) => updateField("usageInfo", e.target.value)}
                                    placeholder="Wichtige Informationen fuer Nutzung oder Einsatz"
                                />
                            </AdminField>

                            <AdminField label="Mietnotizen" htmlFor="rentalNotes">
                                <AdminTextarea
                                    id="rentalNotes"
                                    rows={4}
                                    value={formState.rentalNotes}
                                    onChange={(e) => updateField("rentalNotes", e.target.value)}
                                    placeholder="Zusatznotizen fuer Anfrage- oder Checkout-Prozesse"
                                />
                            </AdminField>

                            <AdminField label="Aufstellanforderungen" htmlFor="setupRequirements">
                                <AdminTextarea
                                    id="setupRequirements"
                                    rows={4}
                                    value={formState.setupRequirements}
                                    onChange={(e) => updateField("setupRequirements", e.target.value)}
                                    placeholder="Platzbedarf, Aufbau oder technische Voraussetzungen"
                                />
                            </AdminField>

                            <AdminField label="Zugangsanforderungen" htmlFor="accessRequirements">
                                <AdminTextarea
                                    id="accessRequirements"
                                    rows={4}
                                    value={formState.accessRequirements}
                                    onChange={(e) => updateField("accessRequirements", e.target.value)}
                                    placeholder="Lift, Einfahrt, Traglast, Anlieferung etc."
                                />
                            </AdminField>
                        </div>
                    </AdminCard>

                    <AdminCard title="Bestand" description="Definiert, wie viele Einheiten dieses Produkts gleichzeitig für denselben Zeitraum angefragt werden dürfen.">
                        <div className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center">
                                    <AdminCheckbox
                                        checked={formState.trackInventory}
                                        onChange={(e) => updateField("trackInventory", e.target.checked)}
                                        label="Bestand aktiv verwalten"
                                    />
                                </div>

                                <AdminField 
                                    label="Maximaler Bestand" 
                                    htmlFor="totalStock"
                                    helperText={formState.trackInventory ? "0 bedeutet: aktuell keine verfügbare Einheit." : "Wenn deaktiviert, wird die Menge nicht bestandsbegrenzt."}
                                >
                                    <AdminInput
                                        id="totalStock"
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={formState.totalStock}
                                        onChange={(e) => updateField("totalStock", e.target.value)}
                                        disabled={!formState.trackInventory}
                                    />
                                </AdminField>
                            </div>
                        </div>
                    </AdminCard>
                </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="sticky bottom-6 z-10 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-lg backdrop-blur-md">
                <p className="text-sm text-slate-500">Ihre Änderungen sind noch nicht gespeichert.</p>
                <div className="flex items-center gap-3">
                    {mode === "edit" && (
                        <AdminButton
                            type="button"
                            variant="danger"
                            onClick={onDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Löscht..." : "Löschen"}
                        </AdminButton>
                    )}
                    <AdminButton 
                        type="submit" 
                        disabled={saving || !canSave || categories.length === 0}
                    >
                        {saving ? "Speichert..." : "Speichern"}
                    </AdminButton>
                </div>
            </div>
        </form>
            )}
        </div>
    );
}
