import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { DemoBanner } from "@/components/layout/demo-banner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "Alpha-Drivers | Chauffeur Privé au Cameroun",
    template: "%s | Alpha-Drivers",
  },
  description:
    "Trouvez un chauffeur professionnel à Douala, Yaoundé, Limbe et Buea. Service fiable, prix transparents, paiement sécurisé par Mobile Money.",
  keywords: [
    "chauffeur",
    "chauffeur privé",
    "driver",
    "Cameroun",
    "Douala",
    "Yaoundé",
    "Limbe",
    "Buea",
    "transport",
    "location chauffeur",
  ],
  authors: [{ name: "Alpha-Drivers" }],
  creator: "Alpha-Drivers",
  openGraph: {
    type: "website",
    locale: "fr_CM",
    url: "https://alpha-drivers.cm",
    title: "Alpha-Drivers | Chauffeur Privé au Cameroun",
    description:
      "Trouvez un chauffeur professionnel à Douala, Yaoundé, Limbe et Buea.",
    siteName: "Alpha-Drivers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alpha-Drivers | Chauffeur Privé au Cameroun",
    description:
      "Trouvez un chauffeur professionnel à Douala, Yaoundé, Limbe et Buea.",
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
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
