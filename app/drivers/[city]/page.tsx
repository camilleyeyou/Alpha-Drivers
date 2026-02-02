import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DriverCard } from "@/components/driver/driver-card";
import { CITIES, CITY_SLUGS } from "@/types";
import { getMockDriversByCity } from "@/lib/mock-data";

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = CITY_SLUGS[params.city];
  if (!city) return { title: "Page non trouvée" };

  const cityName = CITIES[city].name;

  return {
    title: `Chauffeurs à ${cityName}`,
    description: `Trouvez et réservez un chauffeur professionnel à ${cityName}. Comparez les profils, les tarifs et les avis.`,
  };
}

export default function DriversListPage({ params }: { params: { city: string } }) {
  const city = CITY_SLUGS[params.city];
  if (!city) notFound();

  const cityName = CITIES[city].name;
  const drivers = getMockDriversByCity(city);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-white border-b">
          <div className="container-app py-8">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Link href="/" className="hover:text-primary-600">Accueil</Link>
              <span>/</span>
              <span>Chauffeurs à {cityName}</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              Chauffeurs disponibles à {cityName}
            </h1>
            <p className="mt-2 text-gray-600">
              {drivers.length} chauffeurs vérifiés prêts à vous servir
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {Object.entries(CITIES).map(([key, c]) => (
                <Link key={key} href={`/drivers/${key.toLowerCase()}`}>
                  <Button
                    variant={city === key ? "default" : "outline"}
                    size="sm"
                    className="gap-1"
                  >
                    <MapPin className="h-4 w-4" />
                    {c.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="container-app py-8">
          <div className="flex flex-col gap-6 lg:flex-row">
            <aside className="w-full lg:w-64 shrink-0">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filtres
                </h2>
                <div className="mt-6 space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rechercher</label>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input placeholder="Nom du chauffeur..." className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tarif horaire</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Input placeholder="Min" type="number" />
                      <Input placeholder="Max" type="number" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">en FCFA</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Langues</label>
                    <div className="mt-2 space-y-2">
                      {["Français", "Anglais", "Pidgin"].map((lang) => (
                        <label key={lang} className="flex items-center gap-2">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm text-gray-600">{lang}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Note minimum</label>
                    <div className="mt-2 space-y-2">
                      {[4.5, 4.0, 3.5].map((rating) => (
                        <label key={rating} className="flex items-center gap-2">
                          <input type="radio" name="rating" className="border-gray-300" />
                          <span className="text-sm text-gray-600">{rating}+ étoiles</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">Appliquer les filtres</Button>
                </div>
              </div>
            </aside>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">{drivers.length}</span> chauffeurs trouvés
                </p>
                <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  <option>Trier par: Recommandés</option>
                  <option>Prix croissant</option>
                  <option>Prix décroissant</option>
                  <option>Mieux notés</option>
                  <option>Plus d&apos;expérience</option>
                </select>
              </div>
              <div className="grid gap-6">
                {drivers.map((driver) => (
                  <DriverCard key={driver.id} driver={driver} citySlug={params.city} />
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Précédent
                  </Button>
                  <Button variant="default" size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">
                    Suivant
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
