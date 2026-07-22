"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center p-6">
      <section
        className="rounded-card shadow-card w-full border border-red-100 bg-white p-8 text-center"
        role="alert"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
          <AlertTriangle aria-hidden="true" size={23} />
        </span>
        <h1 className="text-navy-900 mt-5 text-2xl font-semibold">
          Le contenu n’a pas pu être chargé
        </h1>
        <p className="text-navy-500 mx-auto mt-2 max-w-lg text-sm leading-6">
          Un problème inattendu est survenu. Vous pouvez relancer cette partie
          de l’application.
        </p>
        <button
          className="bg-navy-900 hover:bg-navy-800 mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          onClick={reset}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={16} />
          Réessayer
        </button>
      </section>
    </div>
  );
}
