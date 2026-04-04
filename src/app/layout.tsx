import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "GMF Eventmodule",
  description: "Hüpfburgen und Eventmodule für Ihre Feier. Einfach buchen, sicher aufbauen, Spaß haben.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
