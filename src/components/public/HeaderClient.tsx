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
    <header className="sticky top-0 z-50 border-b border-[#dbe3ee] bg-white/95 shadow-[0_1px_0_#eef2f7] backdrop-blur">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] sm:h-[80px]">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="font-['Nunito'] font-semibold text-[clamp(1.05rem,4.8vw,1.5rem)] text-[#1a3a52]">
              Event-Vermietung
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map(link => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              const linkClassName = isActive
                ? "font-semibold text-[#16324a] bg-[#e8f1ff] border border-[#bfd3f4]"
                : "font-medium text-[#40566f] border border-transparent hover:text-[#16324a] hover:bg-[#f5f8fc] hover:border-[#d8e2ef]";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-['Nunito'] rounded-full px-3.5 py-2 text-[16px] transition-colors ${linkClassName}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/anfragekorb"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#bfd3f4] bg-[#f7fbff] text-[#1a3a52] transition-colors hover:bg-[#e8f1ff]"
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
            className="lg:hidden rounded-full border border-[#dbe3ee] p-2 text-[#2d3748]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Menue schliessen" : "Menue oeffnen"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-[#e2e8f0] bg-white py-4 flex max-h-[calc(100vh-72px)] flex-col gap-3 overflow-y-auto">
            {navLinks.map(link => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              const mobileLinkClassName = isActive
                ? "font-semibold text-[#16324a] bg-[#e8f1ff] border border-[#bfd3f4]"
                : "font-medium text-[#40566f] border border-transparent hover:text-[#16324a] hover:bg-[#f5f8fc] hover:border-[#d8e2ef]";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-['Nunito'] rounded-xl px-3 py-2.5 text-[16px] transition-colors ${mobileLinkClassName}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/anfragekorb"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 font-['Nunito'] font-medium text-[16px] text-[#2d3748] transition-colors py-2"
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
