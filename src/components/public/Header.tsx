"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { useInquiryCart } from '@/components/public/InquiryCartProvider';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount, hasHydrated } = useInquiryCart();

  const navLinks = [
    { href: '/', label: 'Start' },
    { href: '/produkte', label: 'Produkte' },
    { href: '/licht-tontechnik', label: 'Licht & Ton' },
    { href: '/faq', label: 'FAQ' },
    { href: '/kontakt', label: 'Kontakt' }
  ];

  return (
    <header className="bg-white border-b border-[#cbd5e1] sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="font-['Inter'] font-semibold text-[24px] text-[#1a3a52]">
              Event-Vermietung
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="font-['Inter'] font-medium text-[16px] text-[#2d3748] hover:text-[#1a3a52] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/anfragekorb"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cbd5e1] text-[#1a3a52] transition-colors hover:border-[#1a3a52] hover:bg-[#f7f8fa]"
              aria-label="Anfragekorb"
            >
              <ShoppingCart size={20} />
              {hasHydrated && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#fbbf24] px-1 text-[11px] font-semibold text-[#1a3a52]">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#2d3748]"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-['Inter'] font-medium text-[16px] text-[#2d3748] hover:text-[#1a3a52] transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/anfragekorb"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 font-['Inter'] font-medium text-[16px] text-[#2d3748] hover:text-[#1a3a52] transition-colors py-2"
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
