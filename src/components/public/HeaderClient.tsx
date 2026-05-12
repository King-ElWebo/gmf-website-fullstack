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
      active: "border-[#8b1d10] bg-[#f13c20] text-white shadow-[3px_3px_0_#8b1d10]",
      idle: "border-[#f13c20]/35 bg-[#fff8d8] text-[#8b1d10] hover:border-[#8b1d10] hover:bg-[#ffe1d9] hover:shadow-[3px_3px_0_#8b1d10]",
    },
    {
      active: "border-[#7c5a00] bg-[#fcd01b] text-[#332600] shadow-[3px_3px_0_#7c5a00]",
      idle: "border-[#f0c000]/45 bg-[#fff8d8] text-[#6e5300] hover:border-[#7c5a00] hover:bg-[#fff1a8] hover:shadow-[3px_3px_0_#7c5a00]",
    },
    {
      active: "border-[#064f86] bg-[#066bb7] text-white shadow-[3px_3px_0_#064f86]",
      idle: "border-[#066bb7]/35 bg-[#fff8d8] text-[#064f86] hover:border-[#064f86] hover:bg-[#dff0ff] hover:shadow-[3px_3px_0_#064f86]",
    },
    {
      active: "border-[#3e6d28] bg-[#619a45] text-white shadow-[3px_3px_0_#3e6d28]",
      idle: "border-[#619a45]/35 bg-[#fff8d8] text-[#3e6d28] hover:border-[#3e6d28] hover:bg-[#e7f7dd] hover:shadow-[3px_3px_0_#3e6d28]",
    },
    {
      active: "border-[#762068] bg-[#a43292] text-white shadow-[3px_3px_0_#762068]",
      idle: "border-[#a43292]/35 bg-[#fff8d8] text-[#762068] hover:border-[#762068] hover:bg-[#ffe2f8] hover:shadow-[3px_3px_0_#762068]",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-[#1a202c] bg-[linear-gradient(180deg,#fff7a8_0%,#ffe65c_52%,#ffd43b_100%)] shadow-[0_6px_0_rgba(26,32,44,0.10),0_14px_28px_rgba(15,23,42,0.12)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[86px] items-center justify-between sm:h-[98px]">

          {/* Logo */}
          <Link
            href="/"
            className="group relative flex items-center rounded-[24px] border-2 border-[#1a202c] bg-[#fffef2] px-3 py-2 shadow-[5px_5px_0_#1a202c] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1a202c]"
            aria-label="GMF Eventmodule Startseite"
          >
            <span className="absolute -left-2 -top-2 h-5 w-5 rounded-full border-2 border-[#1a202c] bg-[#f13c20]" />
            <span className="absolute -bottom-2 right-3 h-4 w-4 rounded-full border-2 border-[#1a202c] bg-[#3b82f6]" />
            <Image
              src="/Logo.png"
              alt="GMF Eventmodule Logo"
              width={2520}
              height={1696}
              priority
              sizes="(max-width: 640px) 130px, 160px"
              className="relative h-[56px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03] sm:h-[68px]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 rounded-full border-2 border-[#1a202c] bg-white/55 px-2.5 py-2 shadow-[4px_4px_0_rgba(26,32,44,0.22)] backdrop-blur-sm lg:flex xl:gap-3">
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
                  className={`rounded-full border-2 px-4 py-2 text-[16px] font-bold transition-all duration-200 hover:-translate-y-0.5 ${linkClassName}`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/anfragekorb"
              className="group relative ml-1 flex h-[48px] w-[48px] items-center justify-center rounded-full border-2 border-[#1a202c] bg-[#f13c20] text-white shadow-[4px_4px_0_#1a202c] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d93018] hover:shadow-[5px_5px_0_#1a202c]"
              aria-label="Anfragekorb"
            >
              <ShoppingCart size={22} className="transition-transform group-hover:scale-110" />
              {hasHydrated && itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex min-h-[24px] min-w-[24px] items-center justify-center rounded-full border-2 border-[#1a202c] bg-[#fcd01b] px-1 text-[12px] font-bold text-[#1a202c] shadow-[2px_2px_0_#1a202c] transition-transform group-hover:scale-110">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-[18px] border-2 border-[#1a202c] bg-[#fffef2] text-[#1a202c] shadow-[4px_4px_0_#1a202c] transition-all hover:-translate-y-0.5 hover:bg-white active:translate-y-0 lg:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Menue schliessen" : "Menue oeffnen"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden -mx-4 flex max-h-[calc(100vh-86px)] flex-col gap-3 overflow-y-auto border-t-2 border-[#1a202c] bg-[#fff7a8] px-4 py-5 shadow-[inset_0_8px_18px_rgba(26,32,44,0.10)] sm:-mx-6 sm:max-h-[calc(100vh-98px)] sm:px-6">
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
                  className={`rounded-[18px] border-2 px-5 py-3.5 text-[17px] font-bold transition-all ${mobileLinkClassName}`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/anfragekorb"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-4 rounded-[18px] border-2 border-[#1a202c] bg-[#f13c20] px-5 py-3.5 text-[17px] font-bold text-white shadow-[4px_4px_0_#1a202c] transition-all hover:-translate-y-0.5 hover:bg-[#d93018]"
              style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
            >
              <div className="relative">
                <ShoppingCart size={22} />
                {hasHydrated && itemCount > 0 && (
                  <span className="absolute -right-3 -top-3 flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full border-2 border-[#1a202c] bg-[#fcd01b] px-1 text-[11px] text-[#1a202c] shadow-[2px_2px_0_#1a202c]">
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
