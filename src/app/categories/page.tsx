import Link from "next/link";

import { getCategoriesPageModel } from "@/application/catalogue/queries";
import { CatalogueCard } from "@/components/catalogue/catalogue-card";

export default async function CategoriesPage() {
  const { categories, featuredDatasets, statistics } =
    await getCategoriesPageModel();

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <section className="border-sand-100 shadow-card rounded-[1.75rem] border bg-white p-6 sm:p-8">
        <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
          Catalogue
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-navy-900 text-3xl font-semibold tracking-[-0.03em]">
              Toutes les catégories
            </h1>
            <p className="text-navy-500 mt-3 max-w-2xl text-base leading-7">
              Les catégories sont la première porte d’entrée du catalogue et
              regroupent les thèmes et jeux de données importés.
            </p>
          </div>
          <Link
            className="bg-brand-600 text-navy-950 rounded-full px-4 py-2.5 text-sm font-semibold"
            href="/search"
          >
            Rechercher
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Catégories", value: statistics.categories },
          { label: "Thèmes", value: statistics.themes },
          { label: "Jeux de données", value: statistics.datasets },
        ].map(({ label, value }) => (
          <article
            key={label}
            className="rounded-card border-navy-100 shadow-card border bg-white p-5"
          >
            <p className="text-navy-500 text-xs font-semibold tracking-[0.14em] uppercase">
              {label}
            </p>
            <p className="text-navy-900 mt-2 text-2xl font-semibold">
              {value.toLocaleString("fr-FR")}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <CatalogueCard
            key={category.id}
            href={`/categories/${category.slug}`}
            eyebrow={category.sourceSystem}
            title={category.name}
            description={`Identifiant source ${category.sourceId}`}
            footer={
              category.isActive ? "Catégorie active" : "Catégorie inactive"
            }
          />
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
            Derniers jeux de données
          </p>
          <h2 className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]">
            Parcours rapide
          </h2>
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
    </div>
  );
}
