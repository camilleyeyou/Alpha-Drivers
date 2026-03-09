import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { LanguageProvider } from "@/lib/i18n/context";
import { getLocale } from "@/lib/i18n";
import "./globals.css";

const inter = localFont({
  src: "../public/fonts/Inter.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const outfit = localFont({
  src: "../public/fonts/Outfit.woff2",
  variable: "--font-outfit",
  display: "swap",
  weight: "100 900",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans antialiased" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        <AuthSessionProvider>
          <LanguageProvider initialLocale={locale}>
            <NavigationProgress />
            {children}
          </LanguageProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
