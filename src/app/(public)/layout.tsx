import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { ScrollToTop } from '@/components/public/ScrollToTop';
import '@/styles/public-animations.css';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <ScrollToTop />
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
