import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getServerDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Politique de confidentialité - Alpha-Drivers",
  description: "Politique de confidentialité et protection des données personnelles sur Alpha-Drivers.",
};

export default async function PrivacyPage() {
  const t = await getServerDictionary();

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="bg-dark-900 relative overflow-hidden">
          <div className="container-app py-16 relative z-10">
            <h1 className="font-display text-4xl font-extrabold text-white sm:text-5xl">
              {t.legal.privacyTitle}
            </h1>
            <p className="mt-4 text-gray-400">{t.legal.lastUpdated}</p>
          </div>
          <div className="h-12 bg-white" style={{ clipPath: "polygon(0 60%, 100% 0%, 100% 100%, 0% 100%)" }} />
        </section>

        <section className="section-padding bg-white">
          <div className="container-app max-w-3xl">
            <div className="prose prose-lg prose-headings:font-display prose-headings:font-extrabold prose-a:text-primary-600">
              <h2>{t.legal.privacySection1Title}</h2>
              <p>{t.legal.privacySection1}</p>
              <h2>{t.legal.privacySection2Title}</h2>
              <p>{t.legal.privacySection2}</p>
              <h2>{t.legal.privacySection3Title}</h2>
              <p>{t.legal.privacySection3}</p>
              <h2>{t.legal.privacySection4Title}</h2>
              <p>{t.legal.privacySection4}</p>
              <h2>{t.legal.privacySection5Title}</h2>
              <p>{t.legal.privacySection5}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
