import Link from "next/link";

import { getDatasetListPageModel } from "@/application/catalogue/queries";
import { PaginationControls } from "@/components/catalogue/pagination";

export default async function DatasetsPage({
  searchParams,
}: {
  readonly searchParams: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}) {
  const params = await searchParams;
  const model = await getDatasetListPageModel(params);

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <section className="border-sand-100 shadow-card rounded-[1.75rem] border bg-white p-6 sm:p-8">
        <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
          Catalogue des jeux de données
        </p>
        <h1 className="text-navy-900 mt-3 text-3xl font-semibold tracking-[-0.03em]">
          Parcourir et trier les jeux de données
        </h1>
        <p className="text-navy-500 mt-3 max-w-2xl text-base leading-7">
          Utilisez la recherche, le tri et la pagination pour naviguer dans le
          snapshot PostgreSQL importé.
        </p>
      </section>

      <section className="rounded-card border-navy-100 shadow-card border bg-white p-5">
        <form
          className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]"
          action="/datasets"
          method="get"
        >
          <label className="text-navy-800 flex flex-col gap-1 text-sm font-semibold">
            Recherche
            <input
              className="border-sand-200 rounded-xl border px-3 py-2.5 text-sm font-normal"
              defaultValue={model.query}
              name="q"
              placeholder="Titre, thème, source, métadonnées..."
            />
          </label>
          <label className="text-navy-800 flex flex-col gap-1 text-sm font-semibold">
            Trier par
            <select
              className="border-sand-200 rounded-xl border px-3 py-2.5 text-sm font-normal"
              defaultValue={model.sortBy}
              name="sort"
            >
              <option value="updatedAt">Mise à jour</option>
              <option value="publishedAt">Publication</option>
              <option value="title">Titre</option>
            </select>
          </label>
          <label className="text-navy-800 flex flex-col gap-1 text-sm font-semibold">
            Sens
            <select
              className="border-sand-200 rounded-xl border px-3 py-2.5 text-sm font-normal"
              defaultValue={model.sortDirection}
              name="dir"
            >
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </label>
          <button
            className="bg-brand-600 text-navy-950 rounded-xl px-4 py-2.5 text-sm font-semibold md:self-end"
            type="submit"
          >
            Appliquer
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {model.datasets.length === 0 ? (
          <div className="rounded-card border-sand-100 text-navy-500 shadow-card border bg-white p-6 text-sm">
            Aucun jeu de données ne correspond à ces critères.
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:hidden">
              {model.datasets.map((dataset) => (
                <Link
                  key={dataset.id}
                  href={`/datasets/${dataset.slug}`}
                  className="rounded-card border-navy-100 shadow-card block border bg-white p-5"
                >
                  <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
                    {dataset.categoryName} · {dataset.themeName}
                  </p>
                  <h2 className="text-navy-900 mt-2 text-lg font-semibold">
                    {dataset.title}
                  </h2>
                  <p className="text-navy-500 mt-2 text-sm leading-6">
                    {dataset.description ?? "Description indisponible."}
                  </p>
                  <p className="text-navy-400 mt-4 text-xs">
                    {dataset.observationCount.toLocaleString("fr-FR")}{" "}
                    observations
                  </p>
                </Link>
              ))}
            </div>

            <div className="border-sand-100 shadow-card hidden overflow-hidden rounded-[1.5rem] border bg-white md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-sand-50 text-navy-600">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Jeu de données</th>
                    <th className="px-5 py-4 font-semibold">Catégorie</th>
                    <th className="px-5 py-4 font-semibold">Thème</th>
                    <th className="px-5 py-4 font-semibold">Observations</th>
                  </tr>
                </thead>
                <tbody>
                  {model.datasets.map((dataset) => (
                    <tr key={dataset.id} className="border-sand-100 border-t">
                      <td className="px-5 py-4 align-top">
                        <Link
                          className="text-brand-700 font-semibold"
                          href={`/datasets/${dataset.slug}`}
                        >
                          {dataset.title}
                        </Link>
                        <p className="text-navy-500 mt-1 text-xs">
                          {dataset.description ?? "Description indisponible."}
                        </p>
                      </td>
                      <td className="text-navy-700 px-5 py-4 align-top">
                        {dataset.categoryName}
                      </td>
                      <td className="text-navy-700 px-5 py-4 align-top">
                        {dataset.themeName}
                      </td>
                      <td className="text-navy-700 px-5 py-4 align-top">
                        {dataset.observationCount.toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationControls
              basePath="/datasets"
              hasMore={model.hasMore}
              page={model.page}
              searchParams={params}
            />
          </>
        )}
      </section>
    </div>
  );
}
