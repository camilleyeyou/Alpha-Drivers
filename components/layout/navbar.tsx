"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LogOut, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const user = session?.user;
  const { t } = useTranslation();

  const navigation = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.drivers, href: "/drivers/douala" },
    { name: t.nav.pricing, href: "/tarifs" },
    { name: t.nav.becomeDriver, href: "/register/driver" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-dark-900/95 backdrop-blur-xl border-b border-white/10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-transform duration-200 hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 shadow-glow-green">
            <Car className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">
            Alpha<span className="text-primary-400">Drivers</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative text-sm font-medium transition-colors py-1",
                pathname === item.href ? "text-primary-400" : "text-gray-300 hover:text-white",
                "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:bg-primary-400 after:transition-all after:duration-300",
                pathname === item.href ? "after:w-full" : "after:w-0 hover:after:w-full"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons + Language Toggle */}
        <div className="hidden md:flex md:items-center md:gap-3">
          <LanguageToggle />
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                  <User className="mr-2 h-4 w-4" />
                  {user?.firstName || t.nav.myAccount}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/40"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t.nav.logout}
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t.nav.register}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <button
            type="button"
            className="rounded-lg p-2 text-gray-300 hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden border-t border-white/10 bg-dark-900 overflow-hidden transition-all duration-300 ease-spring",
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <div className="space-y-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-xl px-4 py-3 text-base font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary-500/10 text-primary-400"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <hr className="my-4 border-white/10" />
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="block rounded-xl px-4 py-3 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.nav.myAccount}
                </Link>
                <button
                  className="w-full rounded-xl px-4 py-3 text-left text-base font-medium text-red-400 hover:bg-red-500/10"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <div className="flex gap-4 px-4 pt-2">
                <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">{t.nav.register}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
    </header>
  );
}
