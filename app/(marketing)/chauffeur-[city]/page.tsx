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
import { getMockDriversByCity, CITY_STATS } from "@/lib/mock-data";

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

// Static params for build time
export function generateStaticParams() {
  return Object.keys(cityData).map((city) => ({ city }));
}

// Dynamic metadata
export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const data = cityData[params.city];
  if (!data) return { title: "Page non trouvée" };

  const cityName = CITIES[data.city].name;

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

export default function CityLandingPage({ params }: { params: { city: string } }) {
  const data = cityData[params.city];
  if (!data) notFound();

  const cityName = CITIES[data.city].name;
  // Use centralized mock data
  const drivers = getMockDriversByCity(data.city).slice(0, 3); // Show only 3 on landing page
  const stats = CITY_STATS[data.city];

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
                Chauffeurs vérifiés
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/30">
                <Star className="mr-1 h-4 w-4" />
                4.8/5 Note moyenne
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/30">
                {stats.driverCount}+ chauffeurs disponibles
              </Badge>
            </div>
          </div>
        </section>

        {/* Drivers List */}
        <section className="section-padding">
          <div className="container-app">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="heading-3">Chauffeurs disponibles à {cityName}</h2>
                <p className="mt-1 text-gray-600">{drivers.length} chauffeurs vérifiés</p>
              </div>
              <Link href={`/drivers/${params.city}`}>
                <Button variant="outline" className="gap-2">
                  Voir tous les chauffeurs
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
              <h2>Pourquoi choisir Alpha-Drivers à {cityName} ?</h2>
              <p>
                Alpha-Drivers est la plateforme de référence pour trouver un chauffeur professionnel 
                à {cityName}. Que vous ayez besoin d'un chauffeur pour vos déplacements quotidiens, 
                vos rendez-vous d'affaires ou vos événements spéciaux, nos chauffeurs vérifiés sont 
                à votre disposition.
              </p>
              <h3>Service de chauffeur privé à {cityName}</h3>
              <p>
                Nos chauffeurs connaissent parfaitement {cityName} et ses environs. Ils vous garantissent 
                un service ponctuel, sécurisé et professionnel. Tous nos chauffeurs passent par un 
                processus de vérification rigoureux incluant la validation de leur CNI et permis de conduire.
              </p>
              <h3>Tarifs transparents</h3>
              <p>
                Sur Alpha-Drivers, les chauffeurs fixent leurs propres tarifs horaires. Vous pouvez 
                comparer les prix et choisir le chauffeur qui correspond à votre budget. Pas de frais 
                cachés, vous savez exactement ce que vous payez.
              </p>
              <h3>Paiement sécurisé par Mobile Money</h3>
              <p>
                Payez facilement par MTN Mobile Money ou Orange Money. Vos fonds sont protégés par 
                notre système d'escrow jusqu'à la fin de votre service. Votre satisfaction est notre priorité.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding">
          <div className="container-app text-center">
            <h2 className="heading-2">Prêt à réserver votre chauffeur à {cityName} ?</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-600">
              Créez votre compte gratuitement et réservez votre premier chauffeur en quelques minutes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg">Créer un compte gratuit</Button>
              </Link>
              <Link href={`/drivers/${params.city}`}>
                <Button size="lg" variant="outline">
                  Voir tous les chauffeurs
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
