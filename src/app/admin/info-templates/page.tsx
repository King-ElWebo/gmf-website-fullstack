import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { AdminHeader } from "../_components/ui/AdminHeader";
import { AdminButton } from "../_components/ui/AdminButton";
import { AdminBadge } from "../_components/ui/AdminBadge";

export const metadata: Metadata = {
    title: "Hinweis-Vorlagen | GMF Admin",
};

export const dynamic = "force-dynamic";

export default async function InfoTemplatesPage() {
    const templates = await db.infoTemplate.findMany({
        orderBy: { internalName: "asc" },
        include: {
            _count: {
                select: { items: true },
            },
        },
    });

    return (
        <div className="space-y-6">
            <AdminHeader
                title="Hinweis-Vorlagen"
                description="Verwalte die Vorlagen für die 'Wichtige Infos'-Boxen auf der Produktdetailseite."
                actions={
                    <Link href="/admin/info-templates/new">
                        <AdminButton variant="primary">Neue Vorlage</AdminButton>
                    </Link>
                }
            />

            <div className="admin-table rounded-[26px]">
                <div className="hidden px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:grid md:grid-cols-[2fr_2fr_1fr_1fr_120px] md:gap-3">
                    <div>Interner Name</div>
                    <div>Anzeige-Titel</div>
                    <div>Verknüpfte Produkte</div>
                    <div>Status</div>
                    <div className="text-right">Aktionen</div>
                </div>

                <div className="divide-y divide-slate-200/70">
                    {templates.length === 0 ? (
                        <div className="admin-surface rounded-b-[24px] p-6 text-sm text-slate-600">
                            Noch keine Vorlagen vorhanden.
                        </div>
                    ) : (
                        templates.map((template) => (
                            <div
                                key={template.id}
                                className="grid items-center gap-3 bg-white/90 px-4 py-4 text-sm transition-colors hover:bg-slate-50 md:grid-cols-[2fr_2fr_1fr_1fr_120px]"
                            >
                                <div className="font-semibold text-slate-900">{template.internalName}</div>
                                <div className="text-slate-600">{template.title}</div>
                                <div className="text-slate-500">{template._count.items} Produkte</div>
                                <div>
                                    {template.isActive ? (
                                        <AdminBadge variant="green">Aktiv</AdminBadge>
                                    ) : (
                                        <AdminBadge variant="gray">Inaktiv</AdminBadge>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Link href={`/admin/info-templates/${template.id}/edit`}>
                                        <AdminButton variant="secondary" size="sm">
                                            Bearbeiten
                                        </AdminButton>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
