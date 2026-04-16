import Link from "next/link";
import { DisplayArea } from "@/lib/display-area";
import { listGlobalImages } from "@/lib/repositories/global-images";
import AdminPageHeader from "../_components/admin-page-header";
import ImagesSortableList from "./images-sortable-list";

function parseArea(value?: string) {
    if (value && Object.values(DisplayArea).includes(value as DisplayArea)) {
        return value as DisplayArea;
    }

    return undefined;
}

function parsePublished(value?: string) {
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
}

export default async function GlobalImagesPage({
    searchParams,
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
    const resolvedSearchParams = (await searchParams) ?? {};
    const areaParam = Array.isArray(resolvedSearchParams.area) ? resolvedSearchParams.area[0] : resolvedSearchParams.area;
    const publishedParam = Array.isArray(resolvedSearchParams.published)
        ? resolvedSearchParams.published[0]
        : resolvedSearchParams.published;

    const area = parseArea(areaParam);
    const published = parsePublished(publishedParam);
    const images = await listGlobalImages({ area, published });

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Bilder"
                description="Drag-and-drop sortierbar, mit klaren Filtern fuer Bereich und Status."
                action={{ href: "/admin/images/new", label: "Neues Bild" }}
            />

            <form className="admin-surface rounded-[28px] p-4 sm:p-5 flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Bereich</label>
                    <select
                        name="area"
                        defaultValue={area ?? ""}
                        className="min-w-44 rounded-xl px-3 py-2.5 text-sm"
                    >
                        <option value="">Alle Bereiche</option>
                        {Object.values(DisplayArea).map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</label>
                    <select
                        name="published"
                        defaultValue={
                            typeof published === "boolean" ? (published ? "true" : "false") : ""
                        }
                        className="min-w-40 rounded-xl px-3 py-2.5 text-sm"
                    >
                        <option value="">Alle Status</option>
                        <option value="true">Online</option>
                        <option value="false">Offline</option>
                    </select>
                </div>

                <button className="admin-action-primary px-4 py-2.5 text-sm">Filter anwenden</button>

                <Link href="/admin/images" className="admin-action-secondary px-4 py-2.5 text-sm">
                    Zuruecksetzen
                </Link>
            </form>

            <div className="admin-surface rounded-[28px] p-4 sm:p-5">
                <ImagesSortableList initialImages={images} />
            </div>
        </div>
    );
}
