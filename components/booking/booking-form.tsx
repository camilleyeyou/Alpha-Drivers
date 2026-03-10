"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n/context";
import { CITIES, type City } from "@/types";

interface BookingFormProps {
  driverId: string;
  hourlyRate: number;
  commissionPercent: number;
  driverCities: string[];
}

export function BookingForm({
  driverId,
  hourlyRate,
  commissionPercent,
  driverCities,
}: BookingFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [hours, setHours] = useState(1);
  const [pickupCity, setPickupCity] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const driverFee = hourlyRate * hours;
  const platformFee = Math.round((driverFee * commissionPercent) / 100);
  const total = driverFee + platformFee;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", minimumFractionDigits: 0 }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!date || !startTime || !pickupCity || !pickupLocation) {
      setError(t.booking.fillRequired);
      setIsLoading(false);
      return;
    }

    const startDate = new Date(`${date}T${startTime}`);
    const endDate = new Date(startDate.getTime() + hours * 60 * 60 * 1000);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          hoursBooked: hours,
          pickupLocation,
          pickupCity,
          dropoffLocation: dropoffLocation || undefined,
          specialRequests: specialRequests || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || t.booking.errorGeneric);
        return;
      }

      router.push(`/dashboard?booking=created`);
      router.refresh();
    } catch {
      setError(t.booking.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Date & Time */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-gray-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
            <Calendar className="h-4 w-4 text-primary-600" />
          </div>
          {t.booking.dateTime}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.booking.date}</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
            />
          </div>
          <div className="space-y-2">
            <Label>{t.booking.startTime}</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t.booking.duration}</Label>
          <div className="flex items-center gap-2 sm:gap-3">
            <Clock className="h-5 w-5 text-gray-400 shrink-0 hidden sm:block" />
            <button
              type="button"
              onClick={() => setHours(Math.max(1, hours - 1))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 text-lg font-bold text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              -
            </button>
            <Input
              type="number"
              min={1}
              max={24}
              value={hours}
              onChange={(e) => setHours(Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
              className="w-20 text-center"
            />
            <button
              type="button"
              onClick={() => setHours(Math.min(24, hours + 1))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 text-lg font-bold text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              +
            </button>
            <span className="text-sm text-gray-500">{t.booking.hours}</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-gray-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
            <MapPin className="h-4 w-4 text-primary-600" />
          </div>
          {t.booking.location}
        </h3>

        <div className="space-y-2">
          <Label>{t.booking.pickupCity}</Label>
          <Select onValueChange={setPickupCity}>
            <SelectTrigger>
              <SelectValue placeholder={t.booking.selectCity} />
            </SelectTrigger>
            <SelectContent>
              {driverCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {CITIES[city as City]?.name || city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.booking.pickupAddress}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t.booking.pickupPlaceholder}
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t.booking.dropoffAddress} <span className="text-gray-400 font-normal">({t.booking.optional})</span></Label>
          <Input
            placeholder={t.booking.dropoffPlaceholder}
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
          />
        </div>
      </div>

      {/* Special requests */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-gray-400" />
          {t.booking.specialRequests} <span className="text-gray-400 font-normal">({t.booking.optional})</span>
        </Label>
        <textarea
          placeholder={t.booking.specialRequestsPlaceholder}
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          maxLength={500}
          className="flex min-h-[80px] w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        />
      </div>

      {/* Price breakdown */}
      <div className="rounded-xl bg-gray-50 p-6 space-y-3">
        <h3 className="font-display font-bold text-gray-900">{t.booking.priceBreakdown}</h3>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t.booking.driverFee} ({hours}h x {formatPrice(hourlyRate)})</span>
          <span className="font-medium">{formatPrice(driverFee)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t.booking.platformFee} ({commissionPercent}%)</span>
          <span className="font-medium">{formatPrice(platformFee)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-display font-bold text-gray-900">{t.booking.total}</span>
          <span className="font-display text-xl font-black text-primary-600">{formatPrice(total)}</span>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? t.common.loading : t.booking.confirm}
      </Button>
    </form>
  );
}
