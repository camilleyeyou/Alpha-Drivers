import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Shield, Calendar, Clock, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CITIES, City } from "@/types";
import { formatCurrency, getInitials } from "@/lib/utils";
import prisma from "@/lib/db/prisma";
import { getServerDictionary } from "@/lib/i18n";
import { auth } from "@/lib/auth";
import { BookingForm } from "@/components/booking/booking-form";

export const metadata: Metadata = {
  title: "Réserver un chauffeur",
  description: "Réservez votre chauffeur professionnel en quelques clics.",
};

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: { driver?: string; city?: string };
}) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/bookings/new" + (searchParams.driver ? `?driver=${searchParams.driver}` : ""));

  const t = await getServerDictionary();

  if (!searchParams.driver) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <section className="bg-dark-900 relative overflow-hidden">
            <div className="container-app py-16 text-center relative z-10">
              <h1 className="font-display text-3xl font-extrabold text-white">{t.booking.title}</h1>
              <p className="mt-4 text-gray-400">{t.booking.selectDriverFirst}</p>
              <Link href="/drivers/douala" className="mt-6 inline-block">
                <Badge className="bg-primary-500 text-white px-4 py-2 text-sm cursor-pointer hover:bg-primary-600 transition-colors">
                  {t.common.seeDrivers}
                </Badge>
              </Link>
            </div>
            <div className="h-12 bg-gray-50" style={{ clipPath: "polygon(0 60%, 100% 0%, 100% 100%, 0% 100%)" }} />
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const driver = await prisma.driver.findUnique({
    where: { id: searchParams.driver },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!driver || driver.status !== "VERIFIED") notFound();

  const rating = Number(driver.avgRating) || 0;
  const citySlug = searchParams.city || "douala";
  const commissionPercent = parseInt(process.env.PLATFORM_COMMISSION_PERCENT || "15");

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="bg-dark-900 relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] h-[400px] w-[400px] rounded-full bg-primary-500/15 blur-[100px]" />
          <div className="container-app py-10 relative z-10">
            <Link
              href={`/drivers/${citySlug}/${driver.slug}`}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.common.back}
            </Link>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-white sm:text-4xl">
              {t.booking.title}
            </h1>
          </div>
          <div className="h-12 bg-gray-50" style={{ clipPath: "polygon(0 60%, 100% 0%, 100% 100%, 0% 100%)" }} />
        </section>

        <section className="section-padding bg-gray-50">
          <div className="container-app max-w-4xl">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Booking form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-card-lift">
                  <CardContent className="p-8">
                    <BookingForm
                      driverId={driver.id}
                      hourlyRate={driver.hourlyRate}
                      commissionPercent={commissionPercent}
                      driverCities={driver.cities as string[]}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Driver summary sidebar */}
              <div>
                <Card className="border-0 shadow-card-lift sticky top-24">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary-500/20">
                        <AvatarImage src={driver.user.avatarUrl || undefined} />
                        <AvatarFallback className="bg-dark-700 text-lg font-bold text-white">
                          {getInitials(driver.user.firstName, driver.user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-display font-bold text-gray-900">
                          {driver.user.firstName} {driver.user.lastName?.charAt(0)}.
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-accent-500 text-accent-500" />
                          <span className="text-sm font-bold">{rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({driver.totalTrips} {t.common.trips})</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Badge className="bg-primary-50 text-primary-700">
                        <Shield className="mr-1 h-3 w-3" />
                        {t.common.verified}
                      </Badge>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">{t.booking.rate}</span>
                        <span className="font-display text-2xl font-black text-primary-600">
                          {formatCurrency(driver.hourlyRate)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 text-right">{t.common.perHour}</p>
                    </div>

                    <p className="mt-4 text-xs text-gray-500">
                      {t.booking.commissionNote.replace("{percent}", String(commissionPercent))}
                    </p>
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
