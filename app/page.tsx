import Link from "next/link";
import {
  Car,
  Shield,
  CreditCard,
  Clock,
  Star,
  MapPin,
  ChevronRight,
  CheckCircle,
  Users,
  Zap
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServerDictionary } from "@/lib/i18n";

const cities = [
  { name: "Douala", slug: "douala", drivers: 45 },
  { name: "Yaoundé", slug: "yaounde", drivers: 38 },
  { name: "Limbe", slug: "limbe", drivers: 12 },
  { name: "Buea", slug: "buea", drivers: 15 },
];

const featureIcons = [Shield, CreditCard, Clock, Users];

export default async function HomePage() {
  const t = await getServerDictionary();

  const features = [
    { icon: featureIcons[0], title: t.features.verified.title, description: t.features.verified.description },
    { icon: featureIcons[1], title: t.features.payment.title, description: t.features.payment.description },
    { icon: featureIcons[2], title: t.features.pricing.title, description: t.features.pricing.description },
    { icon: featureIcons[3], title: t.features.service.title, description: t.features.service.description },
  ];

  const steps = [
    { number: "1", title: t.howItWorks.step1.title, description: t.howItWorks.step1.description },
    { number: "2", title: t.howItWorks.step2.title, description: t.howItWorks.step2.description },
    { number: "3", title: t.howItWorks.step3.title, description: t.howItWorks.step3.description },
    { number: "4", title: t.howItWorks.step4.title, description: t.howItWorks.step4.description },
  ];

  return (
    <>
      <Navbar />
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden hero-pattern">
          <div className="container-app section-padding">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 animate-fade-in" variant="secondary">
                <Zap className="mr-1 h-3 w-3" />
                {t.hero.badge}
              </Badge>
              <h1 className="heading-1 text-balance animate-fade-in-up">
                {t.hero.title}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 animate-fade-in-up [animation-delay:100ms]">
                {t.hero.description}
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up [animation-delay:200ms]">
                <Link href="/drivers/douala">
                  <Button size="lg" className="gap-2">
                    <Car className="h-5 w-5" />
                    {t.hero.findDriver}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register/driver">
                  <Button size="lg" variant="outline">
                    {t.hero.becomeDriver}
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>{t.hero.stat1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span>{t.hero.stat2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary-500" />
                  <span>{t.hero.stat3}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cities */}
        <section className="bg-gray-50 section-padding">
          <div className="container-app">
            <div className="text-center">
              <h2 className="heading-2">{t.cities.title}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                {t.cities.subtitle}
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cities.map((city) => (
                <Link key={city.slug} href={`/chauffeur-${city.slug}`}>
                  <Card className="group overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-2">
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-200 group-hover:from-black/70" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-bold">{city.name}</h3>
                        <p className="text-sm opacity-90">{city.drivers} {t.common.drivers}</p>
                      </div>
                      <MapPin className="absolute top-4 right-4 h-6 w-6 text-white/80 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t.cities.seeDrivers}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding">
          <div className="container-app">
            <div className="text-center">
              <h2 className="heading-2">{t.features.title}</h2>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 transition-all duration-200 hover:bg-primary-200 hover:scale-110">
                    <feature.icon className="h-7 w-7 text-primary-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-gray-900 text-white section-padding">
          <div className="container-app">
            <div className="text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">{t.howItWorks.title}</h2>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.number} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold transition-all duration-200 hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/30">
                    {step.number}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding">
          <div className="container-app">
            <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-16 text-center text-white">
              <h2 className="text-3xl font-bold sm:text-4xl">{t.cta.title}</h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-100">
                {t.cta.subtitle}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    {t.common.createFreeAccount}
                  </Button>
                </Link>
                <Link href="/drivers/douala">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    {t.common.seeDrivers}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Driver CTA */}
        <section className="bg-secondary-50 section-padding">
          <div className="container-app">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
              <div className="max-w-xl text-center lg:text-left">
                <Badge variant="secondary" className="mb-4">{t.driverCta.badge}</Badge>
                <h2 className="heading-2">{t.driverCta.title}</h2>
                <p className="mt-4 text-gray-600">
                  {t.driverCta.description}
                </p>
                <ul className="mt-6 space-y-3 text-left">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary-600" />
                    <span>{t.driverCta.benefit1}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary-600" />
                    <span>{t.driverCta.benefit2}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary-600" />
                    <span>{t.driverCta.benefit3}</span>
                  </li>
                </ul>
                <Link href="/register/driver" className="mt-8 inline-block">
                  <Button size="lg" variant="secondary">
                    {t.driverCta.startRegistration}
                  </Button>
                </Link>
              </div>
              <div className="flex h-64 w-full max-w-md items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-200 to-secondary-300">
                <Car className="h-24 w-24 text-secondary-600" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
