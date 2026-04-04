import Link from "next/link";
import { listCatalogTypes } from "@/lib/repositories/catalog-types";
import AdminPageHeader from "../_components/admin-page-header";

export default async function AdminCatalogTypesPage() {
    const catalogTypes = await listCatalogTypes();

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Catalog Types"
                description="Verwalte wiederverwendbare Katalogbereiche mit klarer Struktur und ruhiger Datenansicht."
                action={{ href: "/admin/catalog-types/new", label: "New Catalog Type" }}
            />

            <div className="admin-table rounded-[28px]">
                <table className="w-full text-sm">
                    <thead className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Sort</th>
                            <th className="p-4">Categories</th>
                            <th className="w-32 p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70">
                        {catalogTypes.map((type) => (
                            <tr key={type.id}>
                                <td className="p-4">
                                    <div className="font-semibold text-slate-900">{type.name}</div>
                                    {type.description && <div className="mt-1 text-xs leading-5 text-slate-500">{type.description}</div>}
                                </td>
                                <td className="p-4 text-slate-500">{type.slug}</td>
                                <td className="p-4">
                                    <span className={`admin-badge ${type.isActive ? "admin-badge-green" : "admin-badge-neutral"}`}>
                                        {type.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="p-4 font-medium text-slate-700">{type.sortOrder}</td>
                                <td className="p-4 text-slate-600">{type._count.categories}</td>
                                <td className="p-4 text-right">
                                    <Link className="font-medium text-blue-600 hover:text-blue-800" href={`/admin/catalog-types/${type.id}/edit`}>
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {catalogTypes.length === 0 && (
                            <tr>
                                <td className="p-8 text-center text-slate-500" colSpan={6}>
                                    No catalog types yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
