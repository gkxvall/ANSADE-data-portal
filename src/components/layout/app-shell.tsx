"use client";

import {
  BarChart3,
  BookOpenText,
  ChevronRight,
  Database,
  GitCompareArrows,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navigation = [
  { label: "Vue d’ensemble", icon: BarChart3, available: true },
  { label: "Catalogue", icon: BookOpenText, available: false },
  { label: "Jeux de données", icon: Database, available: false },
  { label: "Comparer", icon: GitCompareArrows, available: false },
] as const;

function Brand({ appName }: { appName: string }) {
  return (
    <Link
      className="flex min-w-0 items-center gap-3 rounded-xl"
      href="/"
      aria-label={`${appName} — Accueil`}
    >
      <span
        className="bg-brand-600 grid size-10 shrink-0 grid-cols-2 gap-0.5 rounded-xl p-2 shadow-sm"
        aria-hidden="true"
      >
        <span className="rounded-sm bg-white" />
        <span className="bg-sand-400 rounded-sm" />
        <span className="bg-brand-200 col-span-2 rounded-sm" />
      </span>
      <span className="min-w-0">
        <span className="text-navy-900 block truncate text-sm font-bold tracking-[0.12em]">
          ANSADE
        </span>
        <span className="text-navy-500 block truncate text-[11px]">
          Explorateur statistique
        </span>
      </span>
    </Link>
  );
}

function SidebarContent({
  appName,
  onNavigate,
}: {
  appName: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="border-navy-100 border-b px-5 py-5">
        <Brand appName={appName} />
      </div>

      <nav className="flex-1 px-3 py-5" aria-label="Navigation principale">
        <p className="text-navy-400 px-3 text-[10px] font-semibold tracking-[0.16em] uppercase">
          Explorer
        </p>
        <ul className="mt-3 space-y-1">
          {navigation.map(({ label, icon: Icon, available }) => (
            <li key={label}>
              {available ? (
                <Link
                  className="bg-brand-50 text-brand-800 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold"
                  href="/"
                  onClick={onNavigate}
                  aria-current="page"
                >
                  <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                  <span className="flex-1">{label}</span>
                  <ChevronRight aria-hidden="true" size={15} />
                </Link>
              ) : (
                <span
                  className="text-navy-400 flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
                  aria-disabled="true"
                  title="Disponible dans une prochaine étape"
                >
                  <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                  <span className="flex-1">{label}</span>
                  <span className="bg-navy-100 text-navy-500 rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase">
                    Bientôt
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="bg-navy-900 m-3 rounded-2xl p-4 text-white">
        <span className="text-brand-200 flex size-8 items-center justify-center rounded-xl bg-white/10">
          <ShieldCheck aria-hidden="true" size={17} />
        </span>
        <p className="mt-3 text-xs font-semibold">Source protégée</p>
        <p className="text-navy-300 mt-1 text-[11px] leading-5">
          Aucun identifiant ni format source n’est exposé à l’interface.
        </p>
      </div>
    </>
  );
}

export function AppShell({
  appName,
  children,
}: {
  appName: string;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="border-navy-100 sticky top-0 hidden h-screen flex-col border-r bg-white/95 backdrop-blur lg:flex">
        <SidebarContent appName={appName} />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="bg-navy-900/45 absolute inset-0 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            type="button"
            aria-label="Fermer la navigation"
          />
          <aside
            className="relative flex h-full w-[min(19rem,86vw)] flex-col bg-white shadow-2xl"
            aria-label="Navigation mobile"
          >
            <button
              className="text-navy-500 hover:bg-navy-50 absolute top-5 right-4 z-10 flex size-9 items-center justify-center rounded-xl"
              onClick={() => setMenuOpen(false)}
              type="button"
              aria-label="Fermer le menu"
            >
              <X aria-hidden="true" size={20} />
            </button>
            <SidebarContent
              appName={appName}
              onNavigate={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="border-navy-100 sticky top-0 z-40 flex h-[4.5rem] items-center gap-3 border-b bg-white/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            className="border-navy-100 text-navy-700 flex size-10 shrink-0 items-center justify-center rounded-xl border bg-white shadow-sm lg:hidden"
            onClick={() => setMenuOpen(true)}
            type="button"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
          >
            <Menu aria-hidden="true" size={20} />
          </button>

          <div className="min-w-0 flex-1 lg:hidden">
            <Brand appName={appName} />
          </div>

          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="text-navy-900 truncate text-sm font-semibold">
              Vue d’ensemble
            </p>
            <p className="text-navy-500 mt-0.5 text-xs">
              Fondations de l’explorateur
            </p>
          </div>

          <div
            className="border-navy-100 bg-navy-50/70 text-navy-400 hidden w-full max-w-sm items-center gap-2 rounded-xl border px-3 py-2.5 sm:flex"
            aria-label="Recherche indisponible avant l’étape 5"
          >
            <Search aria-hidden="true" size={17} />
            <span className="flex-1 text-sm">Rechercher dans les données</span>
            <span className="border-navy-200 rounded-md border bg-white px-1.5 py-0.5 text-[10px] font-semibold">
              Étape 5
            </span>
          </div>

          <span className="bg-brand-50 text-brand-800 hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold xl:flex">
            <span
              className="bg-brand-500 size-2 rounded-full"
              aria-hidden="true"
            />
            Modèle prêt
          </span>
        </header>

        <main id="contenu-principal">{children}</main>
      </div>
    </div>
  );
}
