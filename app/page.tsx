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

const cities = [
  { name: "Douala", slug: "douala", drivers: 45 },
  { name: "Yaoundé", slug: "yaounde", drivers: 38 },
  { name: "Limbe", slug: "limbe", drivers: 12 },
  { name: "Buea", slug: "buea", drivers: 15 },
];

const features = [
  {
    icon: Shield,
    title: "Chauffeurs Vérifiés",
    description: "Tous nos chauffeurs sont vérifiés avec CNI et permis de conduire validés.",
  },
  {
    icon: CreditCard,
    title: "Paiement Sécurisé",
    description: "Payez par MTN MoMo ou Orange Money. Fonds protégés par escrow.",
  },
  {
    icon: Clock,
    title: "Tarifs Flexibles",
    description: "Réservez à l'heure selon vos besoins. Prix transparents.",
  },
  {
    icon: Users,
    title: "Service Personnalisé",
    description: "Communication directe avec votre chauffeur.",
  },
];

const steps = [
  { number: "1", title: "Choisissez", description: "Parcourez les profils et sélectionnez votre chauffeur." },
  { number: "2", title: "Réservez", description: "Indiquez vos dates et lieu de prise en charge." },
  { number: "3", title: "Payez", description: "Réglez par Mobile Money en toute sécurité." },
  { number: "4", title: "Partez", description: "Votre chauffeur vous rejoint à l'heure convenue." },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden hero-pattern">
          <div className="container-app section-padding">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6" variant="secondary">
                <Zap className="mr-1 h-3 w-3" />
                Nouveau au Cameroun
              </Badge>
              <h1 className="heading-1 text-balance">
                Trouvez votre{" "}
                <span className="gradient-text">chauffeur professionnel</span>{" "}
                au Cameroun
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
                Alpha-Drivers connecte les clients avec des chauffeurs vérifiés à Douala, 
                Yaoundé, Limbe et Buea. Service fiable, prix transparents.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/drivers/douala">
                  <Button size="lg" className="gap-2">
                    <Car className="h-5 w-5" />
                    Trouver un chauffeur
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register/driver">
                  <Button size="lg" variant="outline">
                    Devenir chauffeur
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>100+ Chauffeurs vérifiés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span>4.8/5 Note moyenne</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary-500" />
                  <span>Paiement sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cities */}
        <section className="bg-gray-50 section-padding">
          <div className="container-app">
            <div className="text-center">
              <h2 className="heading-2">Nos villes</h2>
              <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                Trouvez un chauffeur dans les principales villes du Cameroun
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cities.map((city) => (
                <Link key={city.slug} href={`/chauffeur-${city.slug}`}>
                  <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-bold">{city.name}</h3>
                        <p className="text-sm opacity-90">{city.drivers} chauffeurs</p>
                      </div>
                      <MapPin className="absolute top-4 right-4 h-6 w-6 text-white/80" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Voir les chauffeurs</span>
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
              <h2 className="heading-2">Pourquoi Alpha-Drivers ?</h2>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100">
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
              <h2 className="text-3xl font-bold sm:text-4xl">Comment ça marche ?</h2>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold">
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
              <h2 className="text-3xl font-bold sm:text-4xl">Prêt à trouver votre chauffeur ?</h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-100">
                Rejoignez des centaines de clients satisfaits
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    Créer un compte gratuit
                  </Button>
                </Link>
                <Link href="/drivers/douala">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Voir les chauffeurs
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
                <Badge variant="secondary" className="mb-4">Pour les chauffeurs</Badge>
                <h2 className="heading-2">Devenez chauffeur Alpha-Drivers</h2>
                <p className="mt-4 text-gray-600">
                  Fixez vos tarifs, choisissez vos horaires et développez votre clientèle.
                </p>
                <ul className="mt-6 space-y-3 text-left">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary-600" />
                    <span>Tarifs libres - vous décidez de votre prix</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary-600" />
                    <span>Paiements rapides sur Mobile Money</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-secondary-600" />
                    <span>Support dédié et assistance</span>
                  </li>
                </ul>
                <Link href="/register/driver" className="mt-8 inline-block">
                  <Button size="lg" variant="secondary">
                    Commencer l'inscription
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
