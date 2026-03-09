"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/context";
import { CITIES, type City } from "@/types";

interface ProfileData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string;
  city: string | null;
  role: string;
  driver: {
    id: string;
    hourlyRate: number;
    bio: string | null;
    experienceYears: number | null;
    languages: string[];
    cities: string[];
    momoNumber: string | null;
    momoProvider: string | null;
    status: string;
  } | null;
}

const LANGUAGE_OPTIONS = [
  { value: "Français", label: "Français" },
  { value: "English", label: "English" },
  { value: "Pidgin", label: "Pidgin" },
  { value: "Ewondo", label: "Ewondo" },
  { value: "Douala", label: "Douala" },
  { value: "Bamiléké", label: "Bamiléké" },
];

const CITY_OPTIONS = Object.entries(CITIES).map(([key, val]) => ({
  value: key,
  label: val.name,
}));

export function ProfileEditForm({ initialData }: { initialData: ProfileData }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isDriver = initialData.role === "DRIVER" && initialData.driver;

  const [firstName, setFirstName] = useState(initialData.firstName || "");
  const [lastName, setLastName] = useState(initialData.lastName || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [city, setCity] = useState(initialData.city || "");

  // Driver fields
  const [hourlyRate, setHourlyRate] = useState(initialData.driver?.hourlyRate || 2000);
  const [bio, setBio] = useState(initialData.driver?.bio || "");
  const [experienceYears, setExperienceYears] = useState(initialData.driver?.experienceYears || 0);
  const [languages, setLanguages] = useState<string[]>(initialData.driver?.languages || []);
  const [cities, setCities] = useState<string[]>(initialData.driver?.cities || []);
  const [momoNumber, setMomoNumber] = useState(initialData.driver?.momoNumber || "");
  const [momoProvider, setMomoProvider] = useState(initialData.driver?.momoProvider || "");

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleCity = (c: string) => {
    setCities((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const body: Record<string, unknown> = { firstName, lastName, email, city };

      if (isDriver) {
        body.hourlyRate = hourlyRate;
        body.bio = bio;
        body.experienceYears = experienceYears;
        body.languages = languages;
        body.cities = cities;
        if (momoNumber) body.momoNumber = momoNumber;
        if (momoProvider) body.momoProvider = momoProvider;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || t.editProfile.errorGeneric);
        return;
      }

      setSuccess(t.editProfile.success);
      router.refresh();
    } catch {
      setError(t.editProfile.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-600">
          {success}
        </div>
      )}

      {/* Personal Info */}
      <Card className="border-0 shadow-card-lift">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            {t.editProfile.personalInfo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.register.firstName}</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t.register.firstNamePlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.register.lastName}</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t.register.lastNamePlaceholder}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.register.email}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.register.emailPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.register.phone}</Label>
            <Input value={initialData.phone} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500">{t.editProfile.phoneCannotChange}</p>
          </div>

          <div className="space-y-2">
            <Label>{t.register.city}</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder={t.register.cityPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {CITY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Driver Profile */}
      {isDriver && (
        <>
          <Card className="border-0 shadow-card-lift">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                {t.editProfile.driverProfile}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.registerDriver.hourlyRate}</Label>
                  <Input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                    min={500}
                    max={50000}
                  />
                  <p className="text-xs text-gray-500">{t.registerDriver.hourlyRateHint}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t.registerDriver.experience}</Label>
                  <Input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    min={0}
                    max={50}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.registerDriver.bio}</Label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  placeholder={t.registerDriver.bioPlaceholder}
                  className="flex min-h-[100px] w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                />
                <p className="text-xs text-gray-500 text-right">{bio.length}/500</p>
              </div>

              <div className="space-y-2">
                <Label>{t.registerDriver.languages}</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <Badge
                      key={lang.value}
                      variant={languages.includes(lang.value) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        languages.includes(lang.value)
                          ? "bg-primary-500 text-white hover:bg-primary-600"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => toggleLanguage(lang.value)}
                    >
                      {lang.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.registerDriver.activeCities}</Label>
                <div className="flex flex-wrap gap-2">
                  {CITY_OPTIONS.map((c) => (
                    <Badge
                      key={c.value}
                      variant={cities.includes(c.value) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        cities.includes(c.value)
                          ? "bg-primary-500 text-white hover:bg-primary-600"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => toggleCity(c.value)}
                    >
                      {c.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card-lift">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                {t.editProfile.paymentInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t.registerDriver.operator}</Label>
                <Select value={momoProvider} onValueChange={setMomoProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.registerDriver.operatorPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN">{t.registerDriver.mtnMomo}</SelectItem>
                    <SelectItem value="ORANGE">{t.registerDriver.orangeMoney}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.registerDriver.momoNumber}</Label>
                <Input
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  placeholder={t.registerDriver.momoPlaceholder}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        {t.editProfile.save}
      </Button>
    </form>
  );
}
