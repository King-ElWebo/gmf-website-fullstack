import Link from "next/link";
import { Plus } from "lucide-react";
import { listResources } from "@/lib/repositories/resources";
import { AdminCard } from "../_components/ui/AdminCard";
import { AdminButton } from "../_components/ui/AdminButton";

export default async function ResourcesPage() {
    const resources = await listResources();

    return (
        <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Verfügbarkeitsregeln</h1>
                    <p className="mt-1 text-sm text-slate-500">Operative Ressourcen wie Lieferteams oder Fahrzeuge verwalten.</p>
                </div>
                <Link href="/admin/resources/new">
                    <AdminButton>
                        <Plus className="mr-2 h-4 w-4" />
                        Neue Ressource
                    </AdminButton>
                </Link>
            </div>

            <AdminCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Kapazität pro Tag</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {resources.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        Keine Ressourcen gefunden.
                                    </td>
                                </tr>
                            ) : (
                                resources.map((resource) => (
                                    <tr key={resource.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {resource.name}
                                        </td>
                                        <td className="px-6 py-4">{resource.capacityPerDay}</td>
                                        <td className="px-6 py-4">
                                            {resource.isActive ? (
                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                    Aktiv
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                                    Inaktiv
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/resources/${resource.id}/edit`}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Bearbeiten
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </AdminCard>
        </div>
    );
}
