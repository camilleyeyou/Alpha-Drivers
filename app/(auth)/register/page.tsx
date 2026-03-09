"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Car, User, Phone, Mail, Lock, Eye, EyeOff, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerSchema, RegisterInput } from "@/lib/validators";
import { CITIES } from "@/types";
import { useTranslation } from "@/lib/i18n/context";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || t.register.errorGeneric);
        return;
      }

      // Auto-sign-in after successful registration
      const signInResult = await signIn("credentials", {
        phone: data.phone,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed
        router.push("/login?registered=true");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t.register.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
          <Car className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">
          Alpha<span className="text-primary-600">Drivers</span>
        </span>
      </Link>

      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t.register.title}</CardTitle>
          <CardDescription>
            {t.register.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 animate-fade-in" role="alert">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t.register.firstName} <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="firstName"
                    placeholder={t.register.firstNamePlaceholder}
                    className="pl-10"
                    {...register("firstName")}
                    error={errors.firstName?.message}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t.register.lastName} <span className="text-red-500">*</span></Label>
                <Input
                  id="lastName"
                  placeholder={t.register.lastNamePlaceholder}
                  {...register("lastName")}
                  error={errors.lastName?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t.register.phone} <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t.register.phonePlaceholder}
                  className="pl-10"
                  {...register("phone")}
                  error={errors.phone?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t.register.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t.register.emailPlaceholder}
                  className="pl-10"
                  {...register("email")}
                  error={errors.email?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t.register.city} <span className="text-red-500">*</span></Label>
              <Select onValueChange={(value) => setValue("city", value as any)}>
                <SelectTrigger error={!!errors.city}>
                  <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                  <SelectValue placeholder={t.register.cityPlaceholder} />
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

            <div className="space-y-2">
              <Label htmlFor="password">{t.register.password} <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.register.passwordPlaceholder}
                  className="pl-10 pr-10"
                  {...register("password")}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.register.confirmPassword} <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.register.passwordPlaceholder}
                  className="pl-10"
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              {t.register.submit}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{t.register.hasAccount}</span>{" "}
            <Link href="/login" className="font-medium text-primary-600 hover:underline">
              {t.register.loginLink}
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/register/driver"
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              {t.register.driverLink}
            </Link>
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
            {t.register.terms}{" "}
            <Link href="/terms" className="underline">
              {t.register.termsOfUse}
            </Link>{" "}
            {t.register.and}{" "}
            <Link href="/privacy" className="underline">
              {t.register.privacyPolicy}
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
