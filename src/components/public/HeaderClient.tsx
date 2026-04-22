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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  return (
    <header className="bg-white border-b border-[#cbd5e1] sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] sm:h-[80px]">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="font-['Nunito'] font-semibold text-[clamp(1.05rem,4.8vw,1.5rem)] text-[#1a3a52]">
              Event-Vermietung
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
            {navLinks.map(link => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-['Nunito'] transition-colors text-[16px] ${isActive ? 'font-semibold text-[#1a3a52] bg-[#f7f8fa] py-2 px-3 rounded' : 'font-medium text-[#4a5568] hover:text-[#1a3a52] hover:bg-[#f7f8fa] py-2 px-3 rounded'}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/anfragekorb"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cbd5e1] text-[#1a3a52] transition-colors hover:border-[#1a3a52] hover:bg-[#f7f8fa]"
              aria-label="Anfragekorb"
            >
              <ShoppingCart size={20} />
              {hasHydrated && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#3b82f6] px-1 text-[11px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#2d3748]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Menue schliessen" : "Menue oeffnen"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-[#e2e8f0] py-4 flex max-h-[calc(100vh-72px)] flex-col gap-3 overflow-y-auto">
            {navLinks.map(link => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-['Nunito'] transition-colors text-[16px] ${isActive ? 'font-semibold text-[#1a3a52] bg-[#f7f8fa] py-2.5 px-3 rounded-xl' : 'font-medium text-[#4a5568] hover:text-[#1a3a52] hover:bg-[#f7f8fa] py-2.5 px-3 rounded-xl'}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/anfragekorb"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 font-['Nunito'] font-medium text-[16px] text-[#2d3748] hover:text-[#1a3a52] transition-colors py-2"
            >
              <ShoppingCart size={18} />
              <span>Anfragekorb{hasHydrated && itemCount > 0 ? ` (${itemCount})` : ''}</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
