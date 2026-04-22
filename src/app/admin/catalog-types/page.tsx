import { listCatalogTypes } from "@/lib/repositories/catalog-types";
import AdminPageHeader from "../_components/admin-page-header";
import CatalogTypesSortableList from "./catalog-types-sortable-list";

export default async function AdminCatalogTypesPage() {
    const catalogTypes = await listCatalogTypes();

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Catalog Types"
                description="Verwalte wiederverwendbare Katalogbereiche mit klarer Struktur und ruhiger Datenansicht."
                action={{ href: "/admin/catalog-types/new", label: "New Catalog Type" }}
            />

            <div className="admin-surface rounded-[28px] p-4 sm:p-5">
                <CatalogTypesSortableList initialCatalogTypes={catalogTypes} />
            </div>
        </div>
    );
}
