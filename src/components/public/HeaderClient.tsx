"use client";

import { useEffect, useState } from 'react';
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
    { active: "bg-[#f13c20] border-2 border-black text-white shadow-[3px_3px_0_#000]", hover: "hover:border-black hover:bg-[#f13c20]/10 hover:text-black hover:shadow-[3px_3px_0_#000]" },
    { active: "bg-[#fcd01b] border-2 border-black text-black shadow-[3px_3px_0_#000]", hover: "hover:border-black hover:bg-[#fcd01b]/20 hover:text-black hover:shadow-[3px_3px_0_#000]" },
    { active: "bg-[#066bb7] border-2 border-black text-white shadow-[3px_3px_0_#000]", hover: "hover:border-black hover:bg-[#066bb7]/10 hover:text-black hover:shadow-[3px_3px_0_#000]" },
    { active: "bg-[#619a45] border-2 border-black text-white shadow-[3px_3px_0_#000]", hover: "hover:border-black hover:bg-[#619a45]/10 hover:text-black hover:shadow-[3px_3px_0_#000]" },
    { active: "bg-[#a43292] border-2 border-black text-white shadow-[3px_3px_0_#000]", hover: "hover:border-black hover:bg-[#a43292]/10 hover:text-black hover:shadow-[3px_3px_0_#000]" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-4 border-black bg-[#e7ff19] shadow-[0_4px_0_rgba(0,0,0,0.1)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] sm:h-[80px]">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/Logo.png" alt="Logo" className="h-[70px]" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              const color = navColors[index % navColors.length];
              const linkClassName = isActive
                ? `font-bold ${color.active}`
                : `font-bold text-[#1a202c] border-2 border-transparent ${color.hover}`;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
                  className={`rounded-full px-4 py-2 text-[17px] transition-all duration-200 ${linkClassName}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/anfragekorb"
              className="relative inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border-2 border-black bg-[#f13c20] text-white shadow-[3px_3px_0_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] transition-all"
              aria-label="Anfragekorb"
            >
              <ShoppingCart size={22} />
              {hasHydrated && itemCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex min-h-[24px] min-w-[24px] items-center justify-center rounded-full border-2 border-black bg-[#fcd01b] px-1 text-[13px] font-bold text-black shadow-[2px_2px_0_#000]">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-full border-2 border-black bg-white p-2 text-[#2d3748] shadow-[3px_3px_0_#000]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Menue schliessen" : "Menue oeffnen"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t-4 border-black bg-[#e7ff19] py-4 flex max-h-[calc(100vh-72px)] flex-col gap-3 overflow-y-auto px-4 shadow-inner">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              const color = navColors[index % navColors.length];
              const mobileLinkClassName = isActive
                ? `font-bold ${color.active}`
                : `font-bold text-[#1a202c] border-2 border-transparent ${color.hover} bg-white/50`;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontFamily: 'var(--font-fredoka), sans-serif' }}
                  className={`rounded-xl px-4 py-3 text-[18px] transition-all ${mobileLinkClassName}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/anfragekorb"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 font-['Nunito'] font-bold text-[18px] text-[#2d3748] transition-colors py-2"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-[#f13c20] text-white shadow-[2px_2px_0_#000]">
                <ShoppingCart size={20} />
              </div>
              <span>Anfragekorb{hasHydrated && itemCount > 0 ? ` (${itemCount})` : ''}</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
