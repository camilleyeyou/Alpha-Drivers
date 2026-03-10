import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, Car, LogOut, LayoutDashboard, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

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
      <header className="bg-dark-900 border-b border-white/10">
        <div className="container-app flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 shadow-glow-green">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-display text-xl font-bold text-white">
                  Alpha<span className="text-primary-400">Drivers</span>
                </span>
                <span className="ml-2 text-xs font-medium text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
            </Link>
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              {session.user.firstName} {session.user.lastName}
            </span>
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Quitter
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
