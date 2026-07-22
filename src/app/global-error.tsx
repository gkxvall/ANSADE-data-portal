"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center justify-center bg-slate-100 p-6 font-sans text-slate-900">
        <main className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-semibold">
            L’application est momentanément indisponible
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Rechargez l’application. Si le problème persiste, réessayez dans
            quelques instants.
          </p>
          <button
            className="mt-6 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
            onClick={reset}
            type="button"
          >
            Recharger
          </button>
        </main>
      </body>
    </html>
  );
}
