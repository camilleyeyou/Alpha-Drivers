import Link from "next/link";
import { Star, MapPin, Clock, Languages } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getInitials } from "@/lib/utils";
import { DriverCard as DriverCardType, CITIES } from "@/types";

interface DriverCardProps {
  driver: DriverCardType;
  citySlug?: string;
}

export function DriverCard({ driver, citySlug = "douala" }: DriverCardProps) {
  const rating = Number(driver.avgRating) || 0;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Avatar Section */}
          <div className="relative flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-6 sm:w-48">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={driver.avatarUrl || undefined} alt={driver.firstName} />
              <AvatarFallback className="text-2xl">
                {getInitials(driver.firstName, driver.lastName)}
              </AvatarFallback>
            </Avatar>
            {driver.totalTrips >= 10 && (
              <Badge className="absolute bottom-4 right-4" variant="success">
                Vérifié
              </Badge>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-1 flex-col p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {driver.firstName} {driver.lastName?.charAt(0)}.
                </h3>
                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                  <span className="text-gray-500">({driver.totalTrips} trajets)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(driver.hourlyRate)}
                </p>
                <p className="text-sm text-gray-500">par heure</p>
              </div>
            </div>

            {driver.bio && (
              <p className="mt-3 line-clamp-2 text-sm text-gray-600">{driver.bio}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              {driver.experienceYears && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{driver.experienceYears} ans d'expérience</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Languages className="h-4 w-4" />
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
                  Voir le profil
                </Button>
              </Link>
              <Link href={`/bookings/new?driver=${driver.id}`} className="flex-1">
                <Button className="w-full">Réserver</Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
