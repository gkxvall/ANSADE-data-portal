import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center p-6 text-center">
      <section>
        <p className="text-brand-700 text-sm font-semibold tracking-[0.14em] uppercase">
          Erreur 404
        </p>
        <h1 className="text-navy-900 mt-3 text-3xl font-semibold tracking-tight">
          Cette page n’existe pas
        </h1>
        <p className="text-navy-500 mt-3">
          Le lien est peut-être incomplet ou la page n’est pas encore
          disponible.
        </p>
        <Link
          className="bg-navy-900 hover:bg-navy-800 mt-7 inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          href="/"
        >
          Retour à l’accueil
        </Link>
      </section>
    </div>
  );
}
