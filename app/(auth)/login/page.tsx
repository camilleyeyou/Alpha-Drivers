"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Car, Phone, Lock, Eye, EyeOff, Shield, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, LoginInput } from "@/lib/validators";
import { useTranslation } from "@/lib/i18n/context";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        phone: data.phone,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.login.errorInvalid);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t.login.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Dark branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative blobs */}
        <div className="absolute top-[-20%] left-[-10%] h-[400px] w-[400px] rounded-full bg-primary-500/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-accent-500/15 blur-[80px]" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 shadow-glow-green">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">
              Alpha<span className="text-primary-400">Drivers</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="font-display text-4xl font-extrabold text-white leading-tight">
            {t.hero.title}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <Shield className="h-5 w-5 text-primary-400 shrink-0" />
              <span>{t.hero.stat3}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Star className="h-5 w-5 text-accent-400 shrink-0" />
              <span>{t.hero.stat2}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <CheckCircle className="h-5 w-5 text-primary-400 shrink-0" />
              <span>{t.hero.stat1}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-2">
          <div className="rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-bold text-dark-900">
            MTN MoMo
          </div>
          <div className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white">
            Orange Money
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-4 py-12">
        {/* Mobile logo */}
        <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500">
            <Car className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-gray-900">
            Alpha<span className="text-primary-500">Drivers</span>
          </span>
        </Link>

        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-extrabold text-gray-900">{t.login.title}</h1>
            <p className="mt-2 text-gray-500">{t.login.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 animate-fade-in" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">{t.login.phone} <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t.login.phonePlaceholder}
                  className="pl-10"
                  {...register("phone")}
                  error={errors.phone?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.login.password} <span className="text-red-500">*</span></Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:underline"
                >
                  {t.login.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.login.passwordPlaceholder}
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

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              {t.login.submit}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-600">{t.login.noAccount}</span>{" "}
            <Link href="/register" className="font-semibold text-primary-600 hover:underline">
              {t.login.createAccount}
            </Link>
          </div>

          <div className="mt-3 text-center">
            <Link
              href="/register/driver"
              className="text-sm text-gray-500 hover:text-primary-600"
            >
              {t.login.driverLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
