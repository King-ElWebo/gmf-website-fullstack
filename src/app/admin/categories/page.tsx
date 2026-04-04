import { listCategories } from "@/lib/repositories/categories";
import AdminPageHeader from "../_components/admin-page-header";
import CategoriesSortableList from "./categories-sortable-list";

export default async function AdminCategoriesPage() {
    const categories = await listCategories();

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Categories"
                description="Strukturiere den Katalog mit klaren Bereichen und schneller Bearbeitung."
                action={{ href: "/admin/categories/new", label: "New Category" }}
            />

            <div className="admin-surface rounded-[28px] p-4 sm:p-5">
                <CategoriesSortableList initialCategories={categories} />
            </div>
        </div>
    );
}
