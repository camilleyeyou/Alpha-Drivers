"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!isDemoMode || dismissed) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium relative">
      <div className="flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>
          <strong>Mode Démo</strong> — Les données affichées sont fictives. 
          La base de données n'est pas connectée.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-amber-600/20 rounded p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
