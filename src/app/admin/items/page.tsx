import { listItems } from "@/lib/repositories/items";
import AdminPageHeader from "../_components/admin-page-header";
import ItemsSortableList from "./items-sortable-list";

export default async function AdminItemsPage() {
    const items = await listItems();

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Items"
                description="Pflege Produkte, Inhalte und Preise in einer klaren, sortierbaren Uebersicht."
                action={{ href: "/admin/items/new", label: "New Item" }}
            />

            <div className="admin-surface rounded-[28px] p-4 sm:p-5">
                <ItemsSortableList initialItems={items} />
            </div>
        </div>
    );
}
