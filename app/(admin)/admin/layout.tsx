import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, Car, LogOut, LayoutDashboard, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-dark-900 border-b border-white/10 relative">
        <div className="container-app flex items-center justify-between py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary-500 shadow-glow-green">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden xs:block">
                <span className="font-display text-lg sm:text-xl font-bold text-white">
                  Alpha<span className="text-primary-400">Drivers</span>
                </span>
                <span className="ml-2 text-xs font-medium text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
            </Link>
            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-white/10 gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Tableau de bord
                </Button>
              </Link>
              <Link href="/admin?tab=drivers">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-white/10 gap-2"
                >
                  <Car className="h-4 w-4" />
                  Chauffeurs
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-white/10 gap-2"
                >
                  <Users className="h-4 w-4" />
                  Utilisateurs
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-sm text-gray-300">
              {session.user.firstName} {session.user.lastName}
            </span>
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Quitter</span>
              </Button>
            </Link>
            {/* Mobile nav toggle */}
            <AdminMobileNav />
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
