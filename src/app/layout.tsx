import type { Metadata } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fredoka",
});

const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ogImageUrl = process.env.NEXT_PUBLIC_OG_IMAGE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    template: "%s | GMF Eventmodule",
    default: "GMF Eventmodule",
  },
  description: "Hüpfburgen und Eventmodule für Ihre Feier. Einfach buchen, sicher aufbauen, Spaß haben.",
  openGraph: {
    title: "GMF Eventmodule",
    description: "Hüpfburgen und Eventmodule für Ihre Feier. Einfach buchen, sicher aufbauen, Spaß haben.",
    url: appUrl,
    siteName: "GMF Eventmodule",
    images: ogImageUrl ? [{ url: ogImageUrl }] : [],
    locale: "de_AT",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${nunito.variable} ${fredoka.variable}`}>
      <body

        className="antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
