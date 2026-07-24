import { ArrowRight, BarChart3, Database, Layers3, Search } from "lucide-react";
import Link from "next/link";

import { getCatalogueHomeModel } from "@/application/catalogue/queries";
import { CatalogueCard } from "@/components/catalogue/catalogue-card";
import { RecentlyViewedDatasets } from "@/components/catalogue/recently-viewed-datasets";

export default async function HomePage() {
  const { statistics, categories, featuredDatasets } =
    await getCatalogueHomeModel();

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <section className="bg-navy-900 shadow-card relative overflow-hidden rounded-[1.75rem] px-6 py-10 text-white sm:px-9 sm:py-12 lg:px-12">
        <div
          className="bg-brand-400/20 absolute -top-16 right-0 h-64 w-64 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.9fr)] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-brand-100 mb-4 inline-flex rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase">
              Étape 5 · Catalogue et recherche
            </p>
            <h1 className="max-w-2xl text-3xl leading-tight font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">
              Explorez les catégories, thèmes et jeux de données ANSADE dans un
              catalogue cohérent.
            </h1>
            <p className="text-navy-200 mt-5 max-w-2xl text-base leading-7 sm:text-lg">
              Le site navigue maintenant sur les données PostgreSQL normalisées,
              avec recherche globale, navigation par hiérarchie et pages de
              détail partageables.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                className="bg-brand-400 text-navy-950 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
                href="/search"
              >
                Rechercher
                <Search aria-hidden="true" size={16} />
              </Link>
              <Link
                className="text-navy-100 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold"
                href="/datasets"
              >
                Parcourir les jeux de données
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                label: "Catégories",
                value: statistics.categories,
                icon: Layers3,
              },
              {
                label: "Jeux de données",
                value: statistics.datasets,
                icon: Database,
              },
              {
                label: "Observations",
                value: statistics.observations,
                icon: BarChart3,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur"
              >
                <span className="text-brand-200 flex size-9 items-center justify-center rounded-xl bg-white/10">
                  <Icon aria-hidden="true" size={18} />
                </span>
                <p className="text-navy-200 mt-4 text-xs font-semibold tracking-[0.16em] uppercase">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {value.toLocaleString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Architecture isolée",
            description:
              "L’interface n’importe jamais Prisma directement et passe par des services applicatifs.",
            icon: Layers3,
          },
          {
            title: "Catalogue connecté",
            description:
              "Les pages lisent le snapshot PostgreSQL importé et peuvent évoluer vers une API live.",
            icon: Database,
          },
          {
            title: "Recherche orientée usage",
            description:
              "Les filtres et le texte de recherche couvrent les titres, sources, thèmes et métadonnées.",
            icon: Search,
          },
        ].map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="rounded-card border-navy-100 shadow-card border bg-white p-5 sm:p-6"
          >
            <span className="bg-brand-50 text-brand-700 flex size-11 items-center justify-center rounded-2xl">
              <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
            </span>
            <h2 className="text-navy-900 mt-5 text-base font-semibold">
              {title}
            </h2>
            <p className="text-navy-500 mt-2 text-sm leading-6">
              {description}
            </p>
          </article>
        ))}
      </section>

      <section aria-labelledby="categories-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
              Navigation rapide
            </p>
            <h2
              id="categories-heading"
              className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]"
            >
              Catégories mises en avant
            </h2>
          </div>
          <Link
            className="text-brand-700 text-sm font-semibold"
            href="/categories"
          >
            Voir toutes les catégories
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CatalogueCard
              key={category.id}
              href={`/categories/${category.slug}`}
              eyebrow={category.sourceSystem}
              title={category.name}
              description={`Identifiant source ${category.sourceId}`}
              footer={category.isActive ? "Actif" : "Inactif"}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="datasets-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
              Actualité des données
            </p>
            <h2
              id="datasets-heading"
              className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]"
            >
              Jeux de données récents
            </h2>
          </div>
          <Link
            className="text-brand-700 text-sm font-semibold"
            href="/datasets"
          >
            Ouvrir le catalogue
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredDatasets.map((dataset) => (
            <CatalogueCard
              key={dataset.id}
              href={`/datasets/${dataset.slug}`}
              eyebrow={`${dataset.categoryName} · ${dataset.themeName}`}
              title={dataset.title}
              description={dataset.description ?? "Description indisponible."}
              footer={`${dataset.observationCount.toLocaleString("fr-FR")} observations`}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
            Historique local
          </p>
          <h2 className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]">
            Jeux de données récemment consultés
          </h2>
        </div>
        <RecentlyViewedDatasets datasets={featuredDatasets} />
      </section>
    </div>
  );
}
