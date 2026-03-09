import { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  Shield,
  CreditCard,
  CheckCircle,
  Car,
  HelpCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Tarifs transparents pour la location de chauffeur au Cameroun. Paiement sécurisé par Mobile Money.",
};

export default async function TarifsPage() {
  const t = await getServerDictionary();

  const pricingInfo = [
    {
      title: t.tarifs.hourlyRate,
      description: t.tarifs.hourlyRateDesc,
      range: t.tarifs.hourlyRateRange,
      detail: t.tarifs.hourlyRateNote,
    },
    {
      title: t.tarifs.commission,
      description: t.tarifs.commissionDesc,
      range: t.tarifs.commissionPercent,
      detail: t.tarifs.commissionNote,
    },
    {
      title: t.tarifs.registrationFee,
      description: t.tarifs.registrationFeeDesc,
      range: t.tarifs.registrationFeeAmount,
      detail: t.tarifs.registrationFeeNote,
    },
  ];

  const paymentMethods = [
    {
      name: t.tarifs.mtnMomo,
      description: t.tarifs.mtnDesc,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      name: t.tarifs.orangeMoney,
      description: t.tarifs.orangeDesc,
      color: "bg-orange-100 text-orange-800",
    },
  ];

  const stepsData = [
    { icon: Car, title: t.tarifs.step1Title, desc: t.tarifs.step1Desc },
    { icon: Clock, title: t.tarifs.step2Title, desc: t.tarifs.step2Desc },
    { icon: CreditCard, title: t.tarifs.step3Title, desc: t.tarifs.step3Desc },
    { icon: Shield, title: t.tarifs.step4Title, desc: t.tarifs.step4Desc },
  ];

  const faqs = [
    { question: t.tarifs.faq1Q, answer: t.tarifs.faq1A },
    { question: t.tarifs.faq2Q, answer: t.tarifs.faq2A },
    { question: t.tarifs.faq3Q, answer: t.tarifs.faq3A },
    { question: t.tarifs.faq4Q, answer: t.tarifs.faq4A },
    { question: t.tarifs.faq5Q, answer: t.tarifs.faq5A },
  ];

  return (
    <>
      <Navbar />
      <main id="main" className="min-h-screen">
        {/* Hero */}
        <section className="bg-white border-b">
          <div className="container-app py-16 text-center">
            <h1 className="heading-1">{t.tarifs.title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              {t.tarifs.subtitle}
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="section-padding">
          <div className="container-app">
            <div className="grid gap-8 md:grid-cols-3">
              {pricingInfo.map((item) => (
                <Card key={item.title} className="text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary-200">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary-600">
                      {item.range}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      {item.description}
                    </p>
                    <p className="mt-4 text-xs text-gray-500">{item.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How Pricing Works */}
        <section className="bg-gray-50 section-padding">
          <div className="container-app">
            <h2 className="heading-2 text-center">{t.tarifs.howItWorks}</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-4">
              {stepsData.map((step) => (
                <div key={step.title} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100">
                    <step.icon className="h-7 w-7 text-primary-600" />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="section-padding">
          <div className="container-app">
            <h2 className="heading-2 text-center">{t.tarifs.paymentMethods}</h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-gray-600">
              {t.tarifs.paymentMethodsDesc}
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
              {paymentMethods.map((method) => (
                <Card key={method.name}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${method.color}`}
                    >
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {method.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {method.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Example Calculation */}
        <section className="bg-gray-50 section-padding">
          <div className="container-app max-w-2xl">
            <h2 className="heading-2 text-center">{t.tarifs.example}</h2>
            <Card className="mt-8">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>{t.tarifs.exampleRate}</span>
                  <span className="font-medium">{t.tarifs.exampleRateValue}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>{t.tarifs.exampleDuration}</span>
                  <span className="font-medium">{t.tarifs.exampleDurationValue}</span>
                </div>
                <hr />
                <div className="flex justify-between text-gray-700">
                  <span>{t.tarifs.exampleSubtotal}</span>
                  <span className="font-medium">{t.tarifs.exampleSubtotalValue}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>{t.tarifs.exampleCommission}</span>
                  <span className="font-medium">{t.tarifs.exampleCommissionValue}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold text-gray-900 rounded-lg bg-primary-50 p-3 -mx-1">
                  <span>{t.tarifs.exampleTotal}</span>
                  <span className="text-primary-600">{t.tarifs.exampleTotalValue}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{t.tarifs.exampleDriverReceives}</span>
                  <span>{t.tarifs.exampleDriverReceivesValue}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding">
          <div className="container-app max-w-3xl">
            <h2 className="heading-2 text-center">
              <HelpCircle className="inline-block mr-2 h-8 w-8" />
              {t.tarifs.faqTitle}
            </h2>
            <div className="mt-8 space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.question} className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <p className="mt-2 text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-600 text-white section-padding">
          <div className="container-app text-center">
            <h2 className="text-3xl font-bold">
              {t.tarifs.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-100">
              {t.tarifs.ctaSubtitle}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {t.common.createFreeAccount}
                </Button>
              </Link>
              <Link href="/drivers/douala">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  {t.common.seeDrivers}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
