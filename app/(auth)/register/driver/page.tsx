"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import {
  Car,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Languages,
  Wallet,
  FileText,
  Briefcase,
} from "lucide-react";
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
import { driverRegisterSchema, type DriverRegisterInput } from "@/lib/validators";
import { CITIES } from "@/types";
import { useTranslation } from "@/lib/i18n/context";

export default function DriverRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const { t } = useTranslation();

  const LANGUAGES_MAP = [
    { value: "Français", label: t.registerDriver.langFrench },
    { value: "Anglais", label: t.registerDriver.langEnglish },
    { value: "Pidgin", label: t.registerDriver.langPidgin },
    { value: "Ewondo", label: t.registerDriver.langEwondo },
    { value: "Douala", label: t.registerDriver.langDouala },
    { value: "Bamiléké", label: t.registerDriver.langBamileke },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DriverRegisterInput>({
    resolver: zodResolver(driverRegisterSchema),
    defaultValues: {
      languages: [],
      cities: [],
    },
  });

  const toggleLanguage = (lang: string) => {
    const updated = selectedLanguages.includes(lang)
      ? selectedLanguages.filter((l) => l !== lang)
      : [...selectedLanguages, lang];
    setSelectedLanguages(updated);
    setValue("languages", updated, { shouldValidate: true });
  };

  const toggleCity = (city: string) => {
    const updated = selectedCities.includes(city)
      ? selectedCities.filter((c) => c !== city)
      : [...selectedCities, city];
    setSelectedCities(updated);
    setValue("cities", updated as any, { shouldValidate: true });
  };

  const onSubmit = async (data: DriverRegisterInput) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register/driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || t.registerDriver.errorGeneric);
        return;
      }

      const signInResult = await signIn("credentials", {
        phone: data.phone,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login?registered=true");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t.registerDriver.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Top bar with logo */}
      <div className="border-b border-white/10 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 shadow-glow-green">
            <Car className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">
            Alpha<span className="text-primary-400">Drivers</span>
          </span>
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">{t.registerDriver.title}</h1>
          <p className="mt-3 text-gray-400 text-lg">{t.registerDriver.subtitle}</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-card-lift animate-fade-in-up">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 animate-fade-in" role="alert">
                {error}
              </div>
            )}

            {/* Section 1: Personal Info */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-gray-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                {t.registerDriver.personalInfo}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t.registerDriver.firstName}</Label>
                  <Input
                    id="firstName"
                    placeholder={t.registerDriver.firstNamePlaceholder}
                    {...register("firstName")}
                    error={errors.firstName?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t.registerDriver.lastName}</Label>
                  <Input
                    id="lastName"
                    placeholder={t.registerDriver.lastNamePlaceholder}
                    {...register("lastName")}
                    error={errors.lastName?.message}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t.registerDriver.phone}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t.registerDriver.phonePlaceholder}
                    className="pl-10"
                    {...register("phone")}
                    error={errors.phone?.message}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.registerDriver.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.registerDriver.emailPlaceholder}
                    className="pl-10"
                    {...register("email")}
                    error={errors.email?.message}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t.registerDriver.city}</Label>
                <Select onValueChange={(value) => setValue("city", value as any)}>
                  <SelectTrigger error={!!errors.city}>
                    <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                    <SelectValue placeholder={t.registerDriver.cityPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CITIES).map(([key, city]) => (
                      <SelectItem key={key} value={key}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>
            </div>

            {/* Section 2: Driver Profile */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-gray-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                  <Briefcase className="h-4 w-4 text-primary-600" />
                </div>
                {t.registerDriver.driverProfile}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">{t.registerDriver.hourlyRate}</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder={t.registerDriver.hourlyRatePlaceholder}
                      className="pl-10"
                      {...register("hourlyRate", { valueAsNumber: true })}
                      error={errors.hourlyRate?.message}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{t.registerDriver.hourlyRateHint}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceYears">{t.registerDriver.experience}</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="experienceYears"
                      type="number"
                      placeholder={t.registerDriver.experiencePlaceholder}
                      className="pl-10"
                      {...register("experienceYears", { valueAsNumber: true })}
                      error={errors.experienceYears?.message}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  <span className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-gray-400" />
                    {t.registerDriver.languages}
                  </span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LANGUAGES_MAP.map((lang) => (
                    <label
                      key={lang.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        selectedLanguages.includes(lang.value)
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 hover:border-primary-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedLanguages.includes(lang.value)}
                        onChange={() => toggleLanguage(lang.value)}
                      />
                      {lang.label}
                    </label>
                  ))}
                </div>
                {errors.languages && (
                  <p className="text-sm text-red-500">{errors.languages.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {t.registerDriver.activeCities}
                  </span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CITIES).map(([key, city]) => (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        selectedCities.includes(key)
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 hover:border-primary-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedCities.includes(key)}
                        onChange={() => toggleCity(key)}
                      />
                      {city.name} ({city.region})
                    </label>
                  ))}
                </div>
                {errors.cities && (
                  <p className="text-sm text-red-500">{errors.cities.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t.registerDriver.bio}</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    id="bio"
                    placeholder={t.registerDriver.bioPlaceholder}
                    className="flex min-h-[100px] w-full rounded-xl border-2 border-input bg-background px-4 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    maxLength={500}
                    {...register("bio")}
                  />
                </div>
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>
            </div>

            {/* Section 3: Mobile Money */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-gray-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50">
                  <Wallet className="h-4 w-4 text-accent-700" />
                </div>
                {t.registerDriver.mobileMoneyPayment}
              </h3>

              <div className="space-y-2">
                <Label htmlFor="momoProvider">{t.registerDriver.operator}</Label>
                <Select onValueChange={(value) => setValue("momoProvider", value as any)}>
                  <SelectTrigger error={!!errors.momoProvider}>
                    <SelectValue placeholder={t.registerDriver.operatorPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN">{t.registerDriver.mtnMomo}</SelectItem>
                    <SelectItem value="ORANGE">{t.registerDriver.orangeMoney}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.momoProvider && (
                  <p className="text-sm text-red-500">{errors.momoProvider.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="momoNumber">{t.registerDriver.momoNumber}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="momoNumber"
                    type="tel"
                    placeholder={t.registerDriver.momoPlaceholder}
                    className="pl-10"
                    {...register("momoNumber")}
                    error={errors.momoNumber?.message}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Password */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-gray-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                  <Lock className="h-4 w-4 text-primary-600" />
                </div>
                {t.registerDriver.security}
              </h3>

              <div className="space-y-2">
                <Label htmlFor="password">{t.registerDriver.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.registerDriver.passwordPlaceholder}
                    className="pl-10 pr-10"
                    {...register("password")}
                    error={errors.password?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.registerDriver.confirmPassword}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.registerDriver.passwordPlaceholder}
                    className="pl-10"
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                  />
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-5 text-sm text-primary-800">
              <p className="font-bold">{t.registerDriver.nextSteps}</p>
              <ol className="mt-2 list-decimal list-inside space-y-1.5">
                <li>{t.registerDriver.nextStep1.replace("{fee}", (parseInt(process.env.NEXT_PUBLIC_DRIVER_REGISTRATION_FEE || "2000")).toLocaleString("fr-FR"))}</li>
                <li>{t.registerDriver.nextStep2}</li>
                <li>{t.registerDriver.nextStep3}</li>
              </ol>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              {t.registerDriver.submit}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-600">{t.registerDriver.hasAccount}</span>{" "}
            <Link
              href="/login"
              className="font-semibold text-primary-600 hover:underline"
            >
              {t.registerDriver.loginLink}
            </Link>
          </div>

          <div className="mt-3 text-center">
            <Link
              href="/register"
              className="text-sm text-gray-500 hover:text-primary-600"
            >
              {t.registerDriver.clientLink}
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            {t.registerDriver.terms}{" "}
            <Link href="/terms" className="underline">
              {t.registerDriver.termsOfUse}
            </Link>{" "}
            {t.registerDriver.and}{" "}
            <Link href="/privacy" className="underline">
              {t.registerDriver.privacyPolicy}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
