"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type NavItem = {
    href: string;
    label: string;
    icon: ReactNode;
};

const catalogItems: NavItem[] = [
    { href: "/admin", label: "Overview", icon: <HomeIcon /> },
    { href: "/admin/site-settings", label: "Site Settings", icon: <SettingsIcon /> },
    { href: "/admin/catalog-types", label: "Catalog Types", icon: <GridIcon /> },
    { href: "/admin/categories", label: "Categories", icon: <FolderIcon /> },
    { href: "/admin/items", label: "Items", icon: <CubeIcon /> },
    { href: "/admin/faqs", label: "FAQs", icon: <HelpIcon /> },
    { href: "/admin/images", label: "Media", icon: <ImageIcon /> },
];

const operationsItems: NavItem[] = [
    { href: "/admin/bookings/dashboard", label: "Booking Dashboard", icon: <ChartIcon /> },
    { href: "/admin/bookings", label: "Bookings", icon: <CalendarIcon /> },
    { href: "/admin/resources", label: "Resources", icon: <LayersIcon /> },
    { href: "/admin/emails", label: "Emails", icon: <MailIcon /> },
    { href: "/admin/calendar", label: "Calendar", icon: <ScheduleIcon /> },
];

function isActive(pathname: string, href: string) {
    if (href === "/admin") return pathname === href;
    
    // Explicit match for dashboard to avoid it being caught by general bookings
    if (href === "/admin/bookings/dashboard") return pathname === href;
    
    // For general bookings, match exactly or match sub-paths (like /admin/bookings/cl...)
    // BUT ignore the dashboard sub-path here
    if (href === "/admin/bookings") {
        return pathname === href || (pathname.startsWith("/admin/bookings/") && !pathname.startsWith("/admin/bookings/dashboard"));
    }
    
    return pathname === href || pathname.startsWith(`${href}/`);
}

function NavGroup({
    title,
    items,
    pathname,
}: {
    title: string;
    items: NavItem[];
    pathname: string;
}) {
    return (
        <div className="space-y-2">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
            <div className="space-y-1">
                {items.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all ${
                                active
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                            }`}
                        >
                            <span
                                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                                    active
                                        ? "border-white/20 bg-white/15 text-white"
                                        : "border-slate-200 bg-white text-slate-500 group-hover:border-blue-100 group-hover:text-blue-600"
                                }`}
                            >
                                {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default function AdminShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        setMobileNavOpen(false);
    }, [pathname]);

    return (
        <div data-admin-shell className="admin-app-shell relative lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
            {mobileNavOpen && (
                <button
                    type="button"
                    aria-label="Navigation schliessen"
                    onClick={() => setMobileNavOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[1px] lg:hidden"
                />
            )}

            <aside
                className={`admin-sidebar fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[320px] border-r px-4 py-4 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:max-w-none lg:translate-x-0 lg:border-r lg:px-5 lg:py-6 ${
                    mobileNavOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="admin-surface rounded-[28px] p-4 lg:p-5">
                    <div className="mb-3 flex justify-end lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileNavOpen(false)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700"
                            aria-label="Navigation schliessen"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                    <div className="mb-6 flex items-center gap-3 border-b border-slate-200/70 pb-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                            <SparkIcon />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Admin Suite</p>
                            <p className="text-lg font-semibold text-slate-900">Control Center</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <NavGroup title="Catalog" items={catalogItems} pathname={pathname} />
                        <NavGroup title="Operations" items={operationsItems} pathname={pathname} />
                    </div>

                    <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">Modern admin workspace</p>
                        <p className="mt-1 leading-6">Klare Navigation, fokussierte Oberflaechen und sichtbare Aktionen fuer den taeglichen Betrieb.</p>
                    </div>
                </div>
            </aside>

            <div className="min-w-0">
                <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setMobileNavOpen(true)}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
                                aria-label="Navigation oeffnen"
                            >
                                <MenuBarsIcon />
                            </button>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Workspace</p>
                                <p className="hidden truncate text-sm text-slate-500 sm:block">Professionelles Admin-Backend fuer Katalog, Inhalte und Prozesse</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm md:flex">
                                {pathname.replace("/admin", "Admin") || "Admin"}
                            </div>
                            <form action="/api/admin/logout?redirectTo=/admin/login" method="post">
                                <button className="admin-action-secondary px-4 py-2.5 text-sm">Logout</button>
                            </form>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
            </div>
        </div>
    );
}

function SvgWrap({ children }: { children: ReactNode }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            {children}
        </svg>
    );
}

function HomeIcon() {
    return <SvgWrap><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></SvgWrap>;
}
function SettingsIcon() {
    return <SvgWrap><path d="M12 3v3" /><path d="M12 18v3" /><path d="m4.93 4.93 2.12 2.12" /><path d="m16.95 16.95 2.12 2.12" /><path d="M3 12h3" /><path d="M18 12h3" /><path d="m4.93 19.07 2.12-2.12" /><path d="m16.95 7.05 2.12-2.12" /><circle cx="12" cy="12" r="3.5" /></SvgWrap>;
}
function GridIcon() {
    return <SvgWrap><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></SvgWrap>;
}
function FolderIcon() {
    return <SvgWrap><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" /></SvgWrap>;
}
function CubeIcon() {
    return <SvgWrap><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 12 4 7.5" /><path d="M12 12l8-4.5" /><path d="M12 12v9" /></SvgWrap>;
}
function HelpIcon() {
    return <SvgWrap><circle cx="12" cy="12" r="9" /><path d="M9.25 9.25a2.75 2.75 0 1 1 4.67 2l-.92.92a2 2 0 0 0-.58 1.41V14" /><path d="M12 17h.01" /></SvgWrap>;
}
function ImageIcon() {
    return <SvgWrap><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-4.5-4.5L7 20" /></SvgWrap>;
}
function ChartIcon() {
    return <SvgWrap><path d="M4 19h16" /><path d="M7 16V9" /><path d="M12 16V5" /><path d="M17 16v-6" /></SvgWrap>;
}
function CalendarIcon() {
    return <SvgWrap><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M3 10h18" /></SvgWrap>;
}
function LayersIcon() {
    return <SvgWrap><path d="m12 3 9 4.5-9 4.5-9-4.5z" /><path d="m3 12 9 4.5 9-4.5" /><path d="m3 16.5 9 4.5 9-4.5" /></SvgWrap>;
}
function MailIcon() {
    return <SvgWrap><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></SvgWrap>;
}
function ScheduleIcon() {
    return <SvgWrap><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></SvgWrap>;
}
function SparkIcon() {
    return <SvgWrap><path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" /><path d="M5 19h.01" /><path d="M19 5h.01" /><path d="M19 19h.01" /></SvgWrap>;
}
function MenuBarsIcon() {
    return <SvgWrap><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></SvgWrap>;
}
function CloseIcon() {
    return <SvgWrap><path d="m7 7 10 10" /><path d="m17 7-10 10" /></SvgWrap>;
}
