"use client";

import Link from "next/link";
import { Star, MapPin, Clock, Languages } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getInitials } from "@/lib/utils";
import { DriverCard as DriverCardType, CITIES } from "@/types";
import { useTranslation } from "@/lib/i18n/context";

interface DriverCardProps {
  driver: DriverCardType;
  citySlug?: string;
}

export function DriverCard({ driver, citySlug = "douala" }: DriverCardProps) {
  const rating = Number(driver.avgRating) || 0;
  const { t } = useTranslation();

  return (
    <Card className="group cursor-pointer overflow-hidden rounded-2xl border-0 shadow-card-lift transition-all duration-300 ease-spring hover:-translate-y-2 hover:shadow-card-hover">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Avatar Section */}
          <div className="relative flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900 p-8 sm:w-52">
            {/* Subtle green glow behind avatar */}
            <div className="absolute inset-0 bg-primary-500/5" />
            <Avatar className="h-28 w-28 border-4 border-primary-500/20 shadow-lg transition-all duration-300 group-hover:border-primary-500/50 group-hover:shadow-glow-green">
              <AvatarImage src={driver.avatarUrl || undefined} alt={driver.firstName} />
              <AvatarFallback className="bg-dark-700 text-2xl font-bold text-white">
                {getInitials(driver.firstName, driver.lastName)}
              </AvatarFallback>
            </Avatar>
            {driver.totalTrips >= 10 && (
              <Badge className="absolute bottom-4 right-4 animate-fade-in bg-primary-500 text-white" variant="default">
                {t.common.verified}
              </Badge>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-1 flex-col p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900">
                  {driver.firstName} {driver.lastName?.charAt(0)}.
                </h3>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Star className="h-5 w-5 fill-accent-500 text-accent-500" />
                  <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
                  <span className="text-gray-500">({driver.totalTrips} {t.common.trips})</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-black text-primary-600">
                  {formatCurrency(driver.hourlyRate)}
                </p>
                <p className="text-sm text-gray-500">{t.common.perHour}</p>
              </div>
            </div>

            {driver.bio && (
              <p className="mt-3 line-clamp-2 text-sm text-gray-600 leading-relaxed">{driver.bio}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
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

            <div className="mt-3 flex flex-wrap gap-2">
              {driver.cities.slice(0, 3).map((city) => (
                <Badge key={city} variant="secondary" className="text-xs">
                  <MapPin className="mr-1 h-3 w-3" />
                  {CITIES[city]?.name || city}
                </Badge>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Link href={`/drivers/${citySlug}/${driver.slug}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  {t.common.viewProfile}
                </Button>
              </Link>
              <Link href={`/bookings/new?driver=${driver.id}`} className="flex-1">
                <Button className="w-full">{t.common.book}</Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
