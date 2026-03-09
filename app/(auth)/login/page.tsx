"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Car, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          <CardTitle className="text-2xl">{t.login.title}</CardTitle>
          <CardDescription>
            {t.login.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 animate-fade-in" role="alert">
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

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{t.login.noAccount}</span>{" "}
            <Link href="/register" className="font-medium text-primary-600 hover:underline">
              {t.login.createAccount}
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/register/driver"
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              {t.login.driverLink}
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Payment methods */}
      <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
        <span>{t.login.securePayments}</span>
        <div className="flex gap-2">
          <span className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-black">
            MTN MoMo
          </span>
          <span className="rounded bg-orange-500 px-2 py-1 text-xs font-bold text-white">
            Orange Money
          </span>
        </div>
      </div>
    </div>
  );
}
