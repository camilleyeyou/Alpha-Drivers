import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, Clock, Languages, Shield, Phone, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactDriverButton } from "@/components/chat/contact-driver-button";
import { CITIES, CITY_SLUGS, City } from "@/types";
import { formatCurrency, getInitials } from "@/lib/utils";
import prisma from "@/lib/db/prisma";
import { getServerDictionary } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: { city: string; slug: string };
}): Promise<Metadata> {
  const driver = await prisma.driver.findUnique({
    where: { slug: params.slug },
    include: { user: { select: { firstName: true, lastName: true } } },
  });

  if (!driver) return { title: "Chauffeur non trouvé" };

  const name = `${driver.user.firstName} ${driver.user.lastName}`;
  return {
    title: `${name} - Chauffeur professionnel`,
    description: `Réservez ${name}, chauffeur professionnel. ${driver.bio || ""}`.slice(0, 160),
  };
}

export default async function DriverProfilePage({
  params,
}: {
  params: { city: string; slug: string };
}) {
  const cityKey = CITY_SLUGS[params.city];
  if (!cityKey) notFound();

  const t = await getServerDictionary();

  const driver = await prisma.driver.findUnique({
    where: { slug: params.slug },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          city: true,
          createdAt: true,
        },
      },
    },
  });

  if (!driver || driver.status !== "VERIFIED") notFound();

  // Fetch reviews where this driver's user is the reviewee
  const reviews = await prisma.review.findMany({
    where: {
      revieweeId: driver.user.id,
      isPublic: true,
    },
    include: {
      reviewer: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const rating = Number(driver.avgRating) || 0;
  const memberSince = driver.user.createdAt.toLocaleDateString("fr-CM", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-dark-900 relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] h-[400px] w-[400px] rounded-full bg-primary-500/15 blur-[100px]" />
          <div className="container-app py-10 relative z-10">
            <Link
              href={`/drivers/${params.city}`}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.common.back}
            </Link>

            <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-start">
              <Avatar className="h-36 w-36 border-4 border-primary-500/30 shadow-glow-green">
                <AvatarImage src={driver.user.avatarUrl || undefined} alt={driver.user.firstName || ""} />
                <AvatarFallback className="bg-dark-700 text-4xl font-bold text-white">
                  {getInitials(driver.user.firstName, driver.user.lastName)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                    {driver.user.firstName} {driver.user.lastName?.charAt(0)}.
                  </h1>
                  <Badge className="bg-primary-500 text-white">
                    <Shield className="mr-1 h-3 w-3" />
                    {t.common.verified}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-5 w-5 fill-accent-500 text-accent-500" />
                    <span className="font-bold text-white">{rating.toFixed(1)}</span>
                    <span>({driver.totalTrips} {t.common.trips})</span>
                  </div>
                  {driver.experienceYears && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary-500" />
                      <span>{driver.experienceYears} {t.common.yearsExperience}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Languages className="h-4 w-4 text-primary-500" />
                    <span>{driver.languages.join(", ")}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                  {driver.cities.map((city) => (
                    <Badge key={city} variant="secondary" className="text-xs bg-white/10 text-gray-300 border-white/20">
                      <MapPin className="mr-1 h-3 w-3" />
                      {CITIES[city as City]?.name || city}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-center sm:text-right shrink-0">
                <p className="font-display text-4xl font-black text-primary-400">
                  {formatCurrency(driver.hourlyRate)}
                </p>
                <p className="text-gray-400">{t.common.perHour}</p>
                <Link href={`/bookings/new?driver=${driver.id}&city=${params.city}`} className="mt-4 block">
                  <Button size="lg" className="w-full px-8">
                    {t.common.book}
                  </Button>
                </Link>
                <ContactDriverButton driverId={driver.id} className="w-full mt-2 border-white/20 text-white hover:bg-white/10" />
              </div>
            </div>
          </div>
          <div className="h-12 bg-gray-50" style={{ clipPath: "polygon(0 60%, 100% 0%, 100% 100%, 0% 100%)" }} />
        </section>

        <section className="section-padding bg-gray-50">
          <div className="container-app max-w-4xl">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Bio */}
                {driver.bio && (
                  <Card className="border-0 shadow-card-lift">
                    <CardContent className="p-8">
                      <h2 className="font-display text-xl font-bold text-gray-900">
                        {t.driverProfile.about}
                      </h2>
                      <p className="mt-4 text-gray-600 leading-relaxed whitespace-pre-line">
                        {driver.bio}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Reviews */}
                <Card className="border-0 shadow-card-lift">
                  <CardContent className="p-8">
                    <h2 className="font-display text-xl font-bold text-gray-900">
                      {t.driverProfile.reviews} ({driver.totalTrips})
                    </h2>
                    {reviews.length > 0 ? (
                      <div className="mt-6 space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900">
                                {review.reviewer.firstName} {review.reviewer.lastName?.charAt(0)}.
                              </p>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? "fill-accent-500 text-accent-500" : "text-gray-200"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-gray-500">{t.driverProfile.noReviews}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-0 shadow-card-lift">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-display font-bold text-gray-900">
                      {t.driverProfile.quickInfo}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t.driverProfile.rate}</span>
                        <span className="font-bold text-primary-600">{formatCurrency(driver.hourlyRate)}/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t.driverProfile.rating}</span>
                        <span className="font-bold">{rating.toFixed(1)} / 5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t.driverProfile.completedTrips}</span>
                        <span className="font-bold">{driver.totalTrips}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t.driverProfile.memberSince}</span>
                        <span className="font-bold">{memberSince}</span>
                      </div>
                    </div>
                    <Link href={`/bookings/new?driver=${driver.id}&city=${params.city}`} className="block pt-2">
                      <Button className="w-full" size="lg">
                        {t.common.book}
                      </Button>
                    </Link>
                    <ContactDriverButton driverId={driver.id} className="w-full mt-2" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
