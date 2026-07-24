import Link from "next/link";

import { getSearchPageModel } from "@/application/catalogue/queries";
import { CatalogueCard } from "@/components/catalogue/catalogue-card";
import { PaginationControls } from "@/components/catalogue/pagination";

export default async function SearchPage({
  searchParams,
}: {
  readonly searchParams: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}) {
  const params = await searchParams;
  const model = await getSearchPageModel(params);

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <section className="border-sand-100 shadow-card rounded-[1.75rem] border bg-white p-6 sm:p-8">
        <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
          Recherche globale
        </p>
        <h1 className="text-navy-900 mt-3 text-3xl font-semibold tracking-[-0.03em]">
          Rechercher dans le catalogue ANSADE
        </h1>
        <p className="text-navy-500 mt-3 max-w-2xl text-base leading-7">
          La recherche couvre les titres, descriptions, sources, catégories,
          thèmes et métadonnées importées.
        </p>
      </section>

      <section className="rounded-card border-navy-100 shadow-card border bg-white p-5">
        <form
          className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_auto]"
          action="/search"
          method="get"
        >
          <label className="text-navy-800 flex flex-col gap-1 text-sm font-semibold">
            Terme recherché
            <input
              className="border-sand-200 rounded-xl border px-3 py-2.5 text-sm font-normal"
              defaultValue={model.query}
              name="q"
              placeholder="Titre, thème, catégorie, métadonnées..."
            />
          </label>
          <button
            className="bg-brand-600 text-navy-950 rounded-xl px-4 py-2.5 text-sm font-semibold md:self-end"
            type="submit"
          >
            Rechercher
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
            Résultats
          </p>
          <h2 className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]">
            Catégories et thèmes correspondants
          </h2>
        </div>

        {model.categories.length === 0 &&
        model.themes.length === 0 &&
        model.datasets.length === 0 ? (
          <div className="rounded-card border-sand-100 text-navy-500 shadow-card border bg-white p-6 text-sm">
            Aucun résultat pour cette recherche.
          </div>
        ) : (
          <div className="space-y-6">
            {model.categories.length > 0 ? (
              <section className="space-y-4">
                <h3 className="text-navy-900 text-lg font-semibold">
                  Catégories
                </h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {model.categories.map((category) => (
                    <CatalogueCard
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      eyebrow={category.sourceSystem}
                      title={category.name}
                      description={`Identifiant source ${category.sourceId}`}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {model.themes.length > 0 ? (
              <section className="space-y-4">
                <h3 className="text-navy-900 text-lg font-semibold">Thèmes</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {model.themes.map((theme) => (
                    <CatalogueCard
                      key={theme.id}
                      href={`/themes/${theme.slug}`}
                      eyebrow={theme.categoryName}
                      title={theme.name}
                      description={`Identifiant source ${theme.sourceId}`}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-4">
              <h3 className="text-navy-900 text-lg font-semibold">
                Jeux de données
              </h3>
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
                    <h4 className="text-navy-900 mt-2 text-lg font-semibold">
                      {dataset.title}
                    </h4>
                    <p className="text-navy-500 mt-2 text-sm leading-6">
                      {dataset.description ?? "Description indisponible."}
                    </p>
                  </Link>
                ))}
              </div>

              <div className="border-sand-100 shadow-card hidden overflow-hidden rounded-[1.5rem] border bg-white md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-sand-50 text-navy-600">
                    <tr>
                      <th className="px-5 py-4 font-semibold">
                        Jeu de données
                      </th>
                      <th className="px-5 py-4 font-semibold">Catégorie</th>
                      <th className="px-5 py-4 font-semibold">Thème</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <PaginationControls
                basePath="/search"
                hasMore={model.hasMore}
                page={model.page}
                searchParams={params}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
