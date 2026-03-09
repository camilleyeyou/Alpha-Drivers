import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Star, Shield, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DriverCard } from "@/components/driver/driver-card";
import { CITIES, CITY_SLUGS, City } from "@/types";
import prisma from "@/lib/db/prisma";
import { getServerDictionary } from "@/lib/i18n";

// City data for SEO
const cityData: Record<string, {
  city: City;
  titleFr: string;
  descriptionFr: string;
  metaDescFr: string;
  latitude: number;
  longitude: number;
}> = {
  douala: {
    city: "DOUALA",
    titleFr: "Chauffeur Privé à Douala",
    descriptionFr: "Trouvez les meilleurs chauffeurs professionnels à Douala. Service fiable pour vos déplacements dans la capitale économique du Cameroun.",
    metaDescFr: "Réservez un chauffeur privé à Douala. Chauffeurs vérifiés, tarifs transparents, paiement Mobile Money. Service disponible 24h/24.",
    latitude: 4.0511,
    longitude: 9.7679,
  },
  yaounde: {
    city: "YAOUNDE",
    titleFr: "Chauffeur Privé à Yaoundé",
    descriptionFr: "Découvrez nos chauffeurs professionnels à Yaoundé. Transport sécurisé dans la capitale politique du Cameroun.",
    metaDescFr: "Réservez un chauffeur privé à Yaoundé. Service professionnel, chauffeurs vérifiés, paiement sécurisé par Mobile Money.",
    latitude: 3.8480,
    longitude: 11.5021,
  },
  limbe: {
    city: "LIMBE",
    titleFr: "Chauffeur Privé à Limbe",
    descriptionFr: "Chauffeurs professionnels disponibles à Limbe. Idéal pour vos déplacements touristiques et professionnels.",
    metaDescFr: "Trouvez un chauffeur privé à Limbe. Service fiable pour visiter la ville balnéaire du Cameroun.",
    latitude: 4.0186,
    longitude: 9.2042,
  },
  buea: {
    city: "BUEA",
    titleFr: "Chauffeur Privé à Buea",
    descriptionFr: "Réservez un chauffeur professionnel à Buea. Service adapté pour la ville au pied du Mont Cameroun.",
    metaDescFr: "Chauffeur privé à Buea. Idéal pour vos déplacements vers le Mont Cameroun et ses environs.",
    latitude: 4.1527,
    longitude: 9.2400,
  },
};

// Render dynamically — these pages query live driver data from the DB
export const dynamic = "force-dynamic";

// Provide known city slugs for routing hints (won't prerender)
export function generateStaticParams() {
  return Object.keys(cityData).map((city) => ({ city }));
}

// Dynamic metadata
export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const data = cityData[params.city];
  if (!data) return { title: "Page non trouvée" };

  return {
    title: data.titleFr,
    description: data.metaDescFr,
    openGraph: {
      title: data.titleFr,
      description: data.metaDescFr,
      url: `https://alpha-drivers.cm/chauffeur-${params.city}`,
      type: "website",
    },
    alternates: {
      canonical: `https://alpha-drivers.cm/chauffeur-${params.city}`,
      languages: {
        "fr-CM": `/chauffeur-${params.city}`,
        "en-CM": `/driver-${params.city}`,
      },
    },
  };
}

export default async function CityLandingPage({ params }: { params: { city: string } }) {
  const data = cityData[params.city];
  if (!data) notFound();

  const cityName = CITIES[data.city].name;
  const t = await getServerDictionary();

  const driversRaw = await prisma.driver.findMany({
    where: {
      cities: { has: data.city },
      status: "VERIFIED",
      user: { isActive: true },
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
    },
    orderBy: { avgRating: "desc" },
    take: 3,
  });

  const drivers = driversRaw.map((d) => ({
    id: d.id,
    slug: d.slug || d.id,
    firstName: d.user.firstName || "",
    lastName: d.user.lastName || "",
    avatarUrl: d.user.avatarUrl,
    hourlyRate: d.hourlyRate,
    avgRating: Number(d.avgRating),
    totalTrips: d.totalTrips,
    experienceYears: d.experienceYears,
    languages: d.languages,
    cities: d.cities as City[],
    bio: d.bio,
  }));

  const driverCount = await prisma.driver.count({
    where: { cities: { has: data.city }, status: "VERIFIED" },
  });
  const stats = { driverCount };

  // Schema.org markup for SEO
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Alpha-Drivers ${cityName}`,
    description: data.descriptionFr,
    url: `https://alpha-drivers.cm/chauffeur-${params.city}`,
    telephone: "+237-6XX-XXX-XXX",
    address: {
      "@type": "PostalAddress",
      addressLocality: cityName,
      addressCountry: "CM",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: data.latitude,
      longitude: data.longitude,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: String(drivers.reduce((acc, d) => acc + d.totalTrips, 0)),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="container-app py-16 sm:py-24">
            <div className="flex items-center gap-2 text-primary-200">
              <MapPin className="h-5 w-5" />
              <span>{cityName}, Cameroun</span>
            </div>
            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{data.titleFr}</h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-100">{data.descriptionFr}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Badge className="bg-white/20 text-white hover:bg-white/30">
                <Shield className="mr-1 h-4 w-4" />
                {t.chauffeur.verifiedDrivers}
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/30">
                <Star className="mr-1 h-4 w-4" />
                {t.chauffeur.avgRating}
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/30">
                {t.chauffeur.driversAvailable.replace("{count}", String(stats.driverCount))}
              </Badge>
            </div>
          </div>
        </section>

        {/* Drivers List */}
        <section className="section-padding">
          <div className="container-app">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="heading-3">{t.chauffeur.availableIn.replace("{city}", cityName)}</h2>
                <p className="mt-1 text-gray-600">{t.chauffeur.verifiedCount.replace("{count}", String(drivers.length))}</p>
              </div>
              <Link href={`/drivers/${params.city}`}>
                <Button variant="outline" className="gap-2">
                  {t.chauffeur.seeAllDrivers}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid gap-6">
              {drivers.map((driver) => (
                <DriverCard key={driver.id} driver={driver} citySlug={params.city} />
              ))}
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="bg-gray-50 section-padding">
          <div className="container-app">
            <div className="prose prose-lg mx-auto max-w-3xl">
              <h2>{t.chauffeur.whyChoose.replace("{city}", cityName)}</h2>
              <p>{t.chauffeur.whyChooseDesc.replace(/\{city\}/g, cityName)}</p>
              <h3>{t.chauffeur.serviceTitle.replace("{city}", cityName)}</h3>
              <p>{t.chauffeur.serviceDesc.replace(/\{city\}/g, cityName)}</p>
              <h3>{t.chauffeur.transparentPricing}</h3>
              <p>{t.chauffeur.transparentPricingDesc}</p>
              <h3>{t.chauffeur.securePayment}</h3>
              <p>{t.chauffeur.securePaymentDesc}</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding">
          <div className="container-app text-center">
            <h2 className="heading-2">{t.chauffeur.ctaTitle.replace("{city}", cityName)}</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-600">
              {t.chauffeur.ctaSubtitle}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg">{t.common.createFreeAccount}</Button>
              </Link>
              <Link href={`/drivers/${params.city}`}>
                <Button size="lg" variant="outline">
                  {t.chauffeur.seeAllDrivers}
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
