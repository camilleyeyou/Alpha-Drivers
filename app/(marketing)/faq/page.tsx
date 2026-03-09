import { Metadata } from "next";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServerDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "FAQ - Alpha-Drivers",
  description: "Questions fréquemment posées sur Alpha-Drivers. Trouvez des réponses sur nos services de chauffeur au Cameroun.",
};

export default async function FaqPage() {
  const t = await getServerDictionary();

  const faqs = [
    { q: t.faqPage.q1, a: t.faqPage.a1 },
    { q: t.faqPage.q2, a: t.faqPage.a2 },
    { q: t.faqPage.q3, a: t.faqPage.a3 },
    { q: t.faqPage.q4, a: t.faqPage.a4 },
    { q: t.faqPage.q5, a: t.faqPage.a5 },
    { q: t.faqPage.q6, a: t.faqPage.a6 },
    { q: t.faqPage.q7, a: t.faqPage.a7 },
    { q: t.faqPage.q8, a: t.faqPage.a8 },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-dark-900 relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] h-[400px] w-[400px] rounded-full bg-primary-500/15 blur-[100px]" />
          <div className="container-app py-20 text-center relative z-10">
            <h1 className="font-display text-5xl font-extrabold text-white sm:text-6xl">
              {t.faqPage.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              {t.faqPage.subtitle}
            </p>
          </div>
          <div className="h-16 bg-white" style={{ clipPath: "polygon(0 60%, 100% 0%, 100% 100%, 0% 100%)" }} />
        </section>

        {/* FAQs */}
        <section className="section-padding bg-white">
          <div className="container-app max-w-3xl">
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.q}>
                  <CardContent className="p-6">
                    <h3 className="font-display font-bold text-gray-900">{faq.q}</h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-50 section-padding">
          <div className="container-app text-center">
            <h2 className="font-display text-2xl font-extrabold text-gray-900">
              {t.faqPage.ctaTitle}
            </h2>
            <p className="mt-4 text-gray-600">{t.faqPage.ctaSubtitle}</p>
            <Link href="/contact" className="mt-6 inline-block">
              <Button size="lg">{t.faqPage.contactUs}</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
