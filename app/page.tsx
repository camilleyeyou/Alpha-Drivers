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
import { auth } from "@/lib/auth";

const cities = [
  { name: "Douala", slug: "douala", drivers: 45 },
  { name: "Yaoundé", slug: "yaounde", drivers: 38 },
  { name: "Limbe", slug: "limbe", drivers: 12 },
  { name: "Buea", slug: "buea", drivers: 15 },
];

const featureIcons = [Shield, CreditCard, Clock, Users];

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session;
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
        {/* Hero — Dark with gradient blobs */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-dark-900">
          {/* Decorative blobs */}
          <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary-500/20 blur-[120px] animate-float" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-accent-500/15 blur-[120px] animate-float [animation-delay:3s]" />
          <div className="absolute top-[40%] right-[20%] h-[300px] w-[300px] rounded-full bg-primary-500/10 blur-[80px]" />

          <div className="container-app relative z-10 py-20 sm:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-8 animate-fade-in bg-primary-500/10 text-primary-400 border-primary-500/20 px-4 py-2 text-sm">
                <Zap className="mr-1.5 h-4 w-4" />
                {t.hero.badge}
              </Badge>
              <h1 className="font-display text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl text-balance animate-fade-in-up">
                {t.hero.title}
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-400 animate-fade-in-up [animation-delay:100ms] sm:text-xl">
                {t.hero.description}
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up [animation-delay:200ms]">
                <Link href="/drivers/douala">
                  <Button size="lg" className="gap-2 text-base px-8 py-4 h-auto">
                    <Car className="h-5 w-5" />
                    {t.hero.findDriver}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register/driver">
                  <Button size="lg" variant="accent" className="text-base px-8 py-4 h-auto">
                    {t.hero.becomeDriver}
                  </Button>
                </Link>
              </div>
              <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400 animate-fade-in-up [animation-delay:400ms]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary-500" />
                  <span>{t.hero.stat1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent-500" />
                  <span>{t.hero.stat2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary-500" />
                  <span>{t.hero.stat3}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Angled bottom divider */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gray-50" style={{ clipPath: "polygon(0 60%, 100% 0%, 100% 100%, 0% 100%)" }} />
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
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cities.map((city, i) => (
                <Link key={city.slug} href={`/chauffeur-${city.slug}`}>
                  <Card className="group overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="aspect-[4/3] bg-gradient-to-br from-dark-800 to-dark-900 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                      <div className="absolute inset-0 bg-primary-500/10 transition-opacity duration-300 group-hover:bg-primary-500/20" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-display text-xl font-bold">{city.name}</h3>
                        <p className="text-sm text-gray-300">{city.drivers} {t.common.drivers}</p>
                      </div>
                      <MapPin className="absolute top-4 right-4 h-6 w-6 text-primary-400 transition-transform duration-300 group-hover:scale-125" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">{t.cities.seeDrivers}</span>
                        <ChevronRight className="h-4 w-4 text-primary-500 transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding bg-white">
          <div className="container-app">
            <div className="text-center">
              <h2 className="heading-2">{t.features.title}</h2>
            </div>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <div key={i} className="group text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 transition-all duration-300 group-hover:bg-primary-500 group-hover:shadow-glow-green group-hover:scale-110">
                    <feature.icon className="h-8 w-8 text-primary-600 transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-dark-900 text-white section-padding">
          <div className="container-app">
            <div className="text-center">
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">{t.howItWorks.title}</h2>
            </div>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.number} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 font-display text-3xl font-black transition-all duration-300 hover:shadow-glow-green-lg hover:scale-110">
                    {step.number}
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-white">
          <div className="container-app">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 px-8 py-20 text-center text-white">
              {/* Decorative blob */}
              <div className="absolute top-[-50%] right-[-20%] h-[500px] w-[500px] rounded-full bg-accent-500/20 blur-[100px]" />
              <div className="relative z-10">
                <h2 className="font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">{t.cta.title}</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-primary-100">
                  {t.cta.subtitle}
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                    <Button size="lg" variant="accent" className="text-base px-8 py-4 h-auto">
                      {isLoggedIn ? t.nav.myAccount : t.common.createFreeAccount}
                    </Button>
                  </Link>
                  <Link href="/drivers/douala">
                    <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/60 text-base px-8 py-4 h-auto">
                      {t.common.seeDrivers}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Driver CTA */}
        <section className="bg-dark-950 text-white section-padding">
          <div className="container-app">
            <div className="flex flex-col items-center gap-12 lg:flex-row lg:justify-between">
              <div className="max-w-xl text-center lg:text-left">
                <Badge className="mb-6 bg-accent-500/10 text-accent-400 border-accent-500/20">{t.driverCta.badge}</Badge>
                <h2 className="font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">{t.driverCta.title}</h2>
                <p className="mt-4 text-gray-400 text-lg">
                  {t.driverCta.description}
                </p>
                <ul className="mt-8 space-y-4 text-left">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-primary-500 shrink-0" />
                    <span className="text-gray-300">{t.driverCta.benefit1}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-primary-500 shrink-0" />
                    <span className="text-gray-300">{t.driverCta.benefit2}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-primary-500 shrink-0" />
                    <span className="text-gray-300">{t.driverCta.benefit3}</span>
                  </li>
                </ul>
                <Link href="/register/driver" className="mt-10 inline-block">
                  <Button size="lg" variant="accent" className="text-base px-8 py-4 h-auto">
                    {t.driverCta.startRegistration}
                  </Button>
                </Link>
              </div>
              <div className="flex h-72 w-full max-w-md items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500/20 to-accent-500/10 border border-white/10">
                <Car className="h-28 w-28 text-primary-400" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
