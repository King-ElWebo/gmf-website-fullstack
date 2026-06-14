import { Footer } from '@/components/public/Footer';
import { HeaderClient, type NavCatalogType } from '@/components/public/HeaderClient';
import { InquiryCartProvider } from '@/components/public/InquiryCartProvider';
import { ScrollToTop } from '@/components/public/ScrollToTop';
import { ConsentProvider } from '@/components/public/ConsentContext';
import { CookieBanner } from '@/components/public/CookieBanner';
import { AnalyticsScripts } from '@/components/public/AnalyticsScripts';
import { getPublicSiteSettings } from '@/lib/repositories/site-settings';
import { listNavCatalogTypes } from '@/lib/repositories/catalog-types';
import Script from 'next/script';
import './public-globals.css';
import '@/styles/public-animations.css';

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [settings, navCatalogTypes] = await Promise.all([
        getPublicSiteSettings(),
        listNavCatalogTypes(),
    ]);

    // Build the same nav link structure for the Footer
    const footerNavLinks = [
        { href: '/', label: 'Startseite' },
        ...navCatalogTypes.map((ct) => ({
            href: ct.isDefault ? '/produkte' : `/katalog/${ct.slug}`,
            label: ct.navLabel?.trim() || ct.name,
        })),
        { href: '/faq', label: 'FAQ' },
        { href: '/kontakt', label: 'Kontakt' },
    ];
    const footerLegalLinks = [
        { href: '/impressum', label: 'Impressum' },
        { href: '/datenschutz', label: 'Datenschutz' },
        { href: '/agb', label: 'AGB' },
        { href: '/widerruf', label: 'Widerruf' },
    ];
    const headerNavCatalogTypes: NavCatalogType[] = navCatalogTypes.map((ct) => ({
        slug: ct.slug,
        label: ct.navLabel?.trim() || ct.name,
        isDefault: ct.isDefault,
    }));

    return (
        <ConsentProvider>
            <InquiryCartProvider>
                <div className="public-site flex flex-col min-h-screen">
                    <Script
                        id="google-consent-default"
                        strategy="beforeInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('consent', 'default', {
                                    'analytics_storage': 'denied',
                                    'ad_storage': 'denied',
                                    'ad_user_data': 'denied',
                                    'ad_personalization': 'denied'
                                });
                            `,
                        }}
                    />
                    <ScrollToTop />
                    <HeaderClient navCatalogTypes={headerNavCatalogTypes} />
                    <main className="flex-1">
                        {children}
                    </main>
                    <Footer
                        phone={settings.phone}
                        email={settings.email}
                        address={settings.address}
                        socialLinks={settings.socialLinks}
                        navLinks={footerNavLinks}
                        legalLinks={footerLegalLinks}
                    />
                    <CookieBanner />
                    <AnalyticsScripts />
                </div>
            </InquiryCartProvider>
        </ConsentProvider>
    );
}
