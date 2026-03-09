import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DriverCard } from "@/components/driver/driver-card";
import { CITIES, CITY_SLUGS, City } from "@/types";
import prisma from "@/lib/db/prisma";
import { getServerDictionary } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = CITY_SLUGS[params.city];
  if (!city) return { title: "Page not found" };

  const cityName = CITIES[city].name;

  return {
    title: `Chauffeurs à ${cityName}`,
    description: `Trouvez et réservez un chauffeur professionnel à ${cityName}. Comparez les profils, les tarifs et les avis.`,
  };
}

export default async function DriversListPage({
  params,
}: {
  params: { city: string };
}) {
  const city = CITY_SLUGS[params.city];
  if (!city) notFound();

  const cityName = CITIES[city].name;
  const t = await getServerDictionary();

  const driversRaw = await prisma.driver.findMany({
    where: {
      cities: { has: city },
      status: "VERIFIED",
      user: { isActive: true },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          city: true,
        },
      },
    },
    orderBy: { avgRating: "desc" },
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-white border-b">
          <div className="container-app py-8">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Link href="/" className="hover:text-primary-600">
                {t.driversList.breadcrumbHome}
              </Link>
              <span>/</span>
              <span>{t.driversList.title.replace("{city}", cityName)}</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              {t.driversList.subtitle.replace("{city}", cityName)}
            </h1>
            <p className="mt-2 text-gray-600">
              {t.driversList.count.replace("{count}", String(drivers.length))}
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
                  {t.driversList.filters}
                </h2>
                <div className="mt-6 space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t.driversList.search}
                    </label>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder={t.driversList.searchPlaceholder}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t.driversList.hourlyRate}
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Input placeholder={t.driversList.min} type="number" />
                      <Input placeholder={t.driversList.max} type="number" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{t.driversList.inFcfa}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t.driversList.languages}
                    </label>
                    <div className="mt-2 space-y-2">
                      {[t.driversList.french, t.driversList.english, t.driversList.pidgin].map((lang) => (
                        <label key={lang} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-600">{lang}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t.driversList.minRating}
                    </label>
                    <div className="mt-2 space-y-2">
                      {[4.5, 4.0, 3.5].map((rating) => (
                        <label
                          key={rating}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="radio"
                            name="rating"
                            className="border-gray-300"
                          />
                          <span className="text-sm text-gray-600">
                            {rating}+ {t.driversList.stars}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">{t.driversList.applyFilters}</Button>
                </div>
              </div>
            </aside>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">
                    {drivers.length}
                  </span>{" "}
                  {t.driversList.found}
                </p>
                <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors duration-150 hover:border-primary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none">
                  <option>{t.driversList.sortRecommended}</option>
                  <option>{t.driversList.sortPriceAsc}</option>
                  <option>{t.driversList.sortPriceDesc}</option>
                  <option>{t.driversList.sortTopRated}</option>
                  <option>{t.driversList.sortMostExperience}</option>
                </select>
              </div>
              <div className="grid gap-6">
                {drivers.map((driver) => (
                  <DriverCard
                    key={driver.id}
                    driver={driver}
                    citySlug={params.city}
                  />
                ))}
              </div>
              {drivers.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <MapPin className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-lg font-medium text-gray-600">{t.driversList.noDrivers}</p>
                  <p className="mt-1 text-sm">{t.driversList.noDriversDesc}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
