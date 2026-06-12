"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { useInquiryCart } from '@/components/public/InquiryCartProvider';

export type NavCatalogType = {
  slug: string;
  label: string;
  isDefault: boolean;
};

type HeaderClientProps = {
  navCatalogTypes: NavCatalogType[];
};

export function HeaderClient({ navCatalogTypes }: HeaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount, hasHydrated } = useInquiryCart();

  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  // Build the navigation links dynamically
  const staticLinksBefore = [
    { href: '/', label: 'Start' },
  ];

  // The default catalog type maps to /produkte, others to /katalog/[slug]
  const catalogLinks = navCatalogTypes.map((ct) => ({
    href: ct.isDefault ? '/produkte' : `/katalog/${ct.slug}`,
    label: ct.label,
  }));

  const staticLinksAfter = [
    { href: '/faq', label: 'FAQ' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  const navLinks = [...staticLinksBefore, ...catalogLinks, ...staticLinksAfter];

  const navColors = [
    {
      active: "bg-[#f13c20] text-white shadow-md shadow-red-500/20",
      idle: "bg-transparent text-[#4a5568] hover:bg-[#ffe1d9] hover:text-[#8b1d10]",
    },
    {
      active: "bg-[#fcd01b] text-[#332600] shadow-md shadow-yellow-500/20",
      idle: "bg-transparent text-[#4a5568] hover:bg-[#fff1a8] hover:text-[#6e5300]",
    },
    {
      active: "bg-[#066bb7] text-white shadow-md shadow-blue-500/20",
      idle: "bg-transparent text-[#4a5568] hover:bg-[#dff0ff] hover:text-[#064f86]",
    },
    {
      active: "bg-[#619a45] text-white shadow-md shadow-green-500/20",
      idle: "bg-transparent text-[#4a5568] hover:bg-[#e7f7dd] hover:text-[#3e6d28]",
    },
    {
      active: "bg-[#a43292] text-white shadow-md shadow-pink-500/20",
      idle: "bg-transparent text-[#4a5568] hover:bg-[#ffe2f8] hover:text-[#762068]",
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#fffdf5]/96 backdrop-blur-md shadow-md shadow-[#1a3a52]/5 border-b border-orange-100/50">
      <div className="h-[3px] w-full bg-gradient-to-r from-[#f13c20] via-[#fcd01b] to-[#066bb7]" />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[86px] items-center justify-between sm:h-[98px]">

          {/* Logo */}
          <Link
            href="/"
            className="group relative flex items-center px-3.5 py-1.5 bg-white rounded-2xl border border-orange-100/80 shadow-sm transition-[transform,opacity,box-shadow] duration-200 ease-out-strong hover:-translate-y-0.5 hover:shadow-md hover:border-orange-200/80 active:scale-[0.97]"
            aria-label="GMF Eventmodule Startseite"
          >
            <Image
              src="/Logo.png"
              alt="GMF Eventmodule Logo"
              width={2520}
              height={1696}
              sizes="(max-width: 640px) 120px, 140px"
              className="relative h-[44px] w-auto object-contain transition-transform duration-200 ease-out-strong group-hover:scale-[1.02] sm:h-[50px]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 rounded-full border border-[#fcd01b]/40 bg-white/90 px-2.5 py-2 shadow-sm backdrop-blur-sm lg:flex xl:gap-3">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              const color = navColors[index % navColors.length];

              const linkClassName = isActive
                ? color.active
                : color.idle;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
                  className={`rounded-full px-4 py-2 text-[16px] font-bold transition-[transform,background-color,box-shadow] duration-150 ease-out-strong active:scale-[0.97] hover:-translate-y-0.5 ${linkClassName}`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/anfragekorb"
              className="group relative ml-1 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gradient-to-br from-[#f13c20] to-[#d93018] text-white shadow-md shadow-red-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/40 active:scale-[0.97]"
              aria-label="Anfragekorb"
            >
              <ShoppingCart size={22} className="transition-transform duration-150 ease-out-strong group-hover:scale-110" />
              {hasHydrated && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#fcd01b] px-1 text-[12px] font-bold text-[#332600] shadow-sm transition-transform duration-150 ease-out-strong group-hover:scale-110">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Navigation controls (Cart icon next to Burger menu) */}
          <div className="flex items-center gap-3 lg:hidden">
            <Link
              href="/anfragekorb"
              className="group relative flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#f13c20] to-[#d93018] text-white shadow-md shadow-red-500/20 transition-all duration-150 active:scale-[0.95] transform-gpu hover:-translate-y-0.5"
              aria-label="Anfragekorb"
            >
              <ShoppingCart size={22} className="transition-transform duration-150 ease-out-strong group-hover:scale-110" />
              {hasHydrated && itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#fcd01b] px-1 text-[11px] font-bold text-[#332600] shadow-sm transition-transform duration-150 ease-out-strong group-hover:scale-110 border border-white/20">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#f7f8fa] text-[#1a202c] shadow-sm transition-[transform,background-color,box-shadow] duration-150 ease-out-strong hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-[0.97]"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Menue schliessen" : "Menue oeffnen"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden -mx-4 flex max-h-[calc(100vh-86px)] flex-col gap-3 overflow-y-auto border-t border-[#fcd01b]/30 bg-[#fffdf8] px-4 py-5 shadow-inner sm:-mx-6 sm:max-h-[calc(100vh-98px)] sm:px-6">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              const color = navColors[index % navColors.length];

              const mobileLinkClassName = isActive
                ? color.active
                : color.idle;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
                  className={`rounded-[18px] px-5 py-3.5 text-[17px] font-bold transition-[transform,background-color,box-shadow] duration-150 ease-out-strong active:scale-[0.97] ${mobileLinkClassName}`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/anfragekorb"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-4 rounded-[18px] bg-[#f13c20] px-5 py-3.5 text-[17px] font-bold text-white shadow-md shadow-red-500/30 transition-[transform,background-color,box-shadow] duration-150 ease-out-strong hover:-translate-y-0.5 hover:bg-[#d93018] active:scale-[0.97]"
              style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
            >
              <div className="relative">
                <ShoppingCart size={22} />
                {hasHydrated && itemCount > 0 && (
                  <span className="absolute -right-3 -top-3 flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#fcd01b] px-1 text-[11px] text-[#332600] shadow-sm">
                    {itemCount}
                  </span>
                )}
              </div>
              <span>Anfragekorb</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
