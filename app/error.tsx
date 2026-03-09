"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an error reporting service
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-red-600">Erreur</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900">
        Quelque chose s&apos;est mal passé
      </h2>
      <p className="mt-2 text-gray-600">
        Une erreur inattendue est survenue. Veuillez réessayer.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary-600 px-6 py-3 text-white transition-colors hover:bg-primary-700"
      >
        Réessayer
      </button>
    </div>
  );
}
