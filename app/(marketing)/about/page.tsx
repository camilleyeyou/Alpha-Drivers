import { Metadata } from "next";
import Link from "next/link";
import { Shield, Users, MapPin, Heart, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServerDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "À propos - Alpha-Drivers",
  description: "Découvrez Alpha-Drivers, la plateforme de mise en relation avec des chauffeurs professionnels au Cameroun.",
};

export default async function AboutPage() {
  const t = await getServerDictionary();

  const values = [
    {
      icon: Shield,
      title: t.about.value1Title,
      description: t.about.value1Desc,
    },
    {
      icon: Users,
      title: t.about.value2Title,
      description: t.about.value2Desc,
    },
    {
      icon: Heart,
      title: t.about.value3Title,
      description: t.about.value3Desc,
    },
    {
      icon: MapPin,
      title: t.about.value4Title,
      description: t.about.value4Desc,
    },
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
              {t.about.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              {t.about.subtitle}
            </p>
          </div>
          <div className="h-16 bg-white" style={{ clipPath: "polygon(0 60%, 100% 0%, 100% 100%, 0% 100%)" }} />
        </section>

        {/* Mission */}
        <section className="section-padding bg-white">
          <div className="container-app max-w-3xl">
            <h2 className="heading-2 text-center">{t.about.missionTitle}</h2>
            <p className="mt-6 text-gray-600 leading-relaxed text-center text-lg">
              {t.about.missionDesc}
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="bg-gray-50 section-padding">
          <div className="container-app">
            <h2 className="heading-2 text-center">{t.about.valuesTitle}</h2>
            <div className="mt-14 grid gap-8 md:grid-cols-2">
              {values.map((value) => (
                <Card key={value.title} className="border-0">
                  <CardContent className="p-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                      <value.icon className="h-7 w-7 text-primary-600" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold text-gray-900">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-dark-900 text-white section-padding relative overflow-hidden">
          <div className="absolute top-[-30%] left-[-10%] h-[400px] w-[400px] rounded-full bg-primary-500/15 blur-[100px]" />
          <div className="container-app text-center relative z-10">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              {t.about.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-400">{t.about.ctaSubtitle}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" variant="accent" className="text-base px-8 py-4 h-auto">
                  {t.common.createFreeAccount}
                </Button>
              </Link>
              <Link href="/drivers/douala">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/60 text-base px-8 py-4 h-auto">
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
