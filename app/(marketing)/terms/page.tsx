import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getServerDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Conditions d'utilisation - Alpha-Drivers",
  description: "Conditions générales d'utilisation de la plateforme Alpha-Drivers.",
};

export default async function TermsPage() {
  const t = await getServerDictionary();

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="bg-dark-900 relative overflow-hidden">
          <div className="container-app py-16 relative z-10">
            <h1 className="font-display text-4xl font-extrabold text-white sm:text-5xl">
              {t.legal.termsTitle}
            </h1>
            <p className="mt-4 text-gray-400">{t.legal.lastUpdated}</p>
          </div>
          <div className="h-12 bg-white" style={{ clipPath: "polygon(0 60%, 100% 0%, 100% 100%, 0% 100%)" }} />
        </section>

        <section className="section-padding bg-white">
          <div className="container-app max-w-3xl">
            <div className="prose prose-lg prose-headings:font-display prose-headings:font-extrabold prose-a:text-primary-600">
              <h2>{t.legal.termsSection1Title}</h2>
              <p>{t.legal.termsSection1}</p>
              <h2>{t.legal.termsSection2Title}</h2>
              <p>{t.legal.termsSection2}</p>
              <h2>{t.legal.termsSection3Title}</h2>
              <p>{t.legal.termsSection3}</p>
              <h2>{t.legal.termsSection4Title}</h2>
              <p>{t.legal.termsSection4}</p>
              <h2>{t.legal.termsSection5Title}</h2>
              <p>{t.legal.termsSection5}</p>
              <h2>{t.legal.termsSection6Title}</h2>
              <p>{t.legal.termsSection6}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
