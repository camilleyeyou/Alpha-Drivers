"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, Car, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-300 hover:text-white hover:bg-white/10 p-2"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 bg-dark-900 border-b border-white/10 px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1">
            <Link href="/admin" onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Tableau de bord
              </Button>
            </Link>
            <Link href="/admin?tab=drivers" onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 gap-2"
              >
                <Car className="h-4 w-4" />
                Chauffeurs
              </Button>
            </Link>
            <Link href="/admin/users" onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 gap-2"
              >
                <Users className="h-4 w-4" />
                Utilisateurs
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
