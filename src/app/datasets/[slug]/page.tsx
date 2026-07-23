import { notFound } from "next/navigation";

import { getDatasetPageModel } from "@/application/catalogue/queries";
import { CatalogueBreadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CatalogueCard } from "@/components/catalogue/catalogue-card";
import { RecentlyViewedDatasets } from "@/components/catalogue/recently-viewed-datasets";

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return "Non renseignée";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(value);
}

export default async function DatasetPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { dataset, relatedDatasets } = await getDatasetPageModel(slug);

  if (!dataset) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <CatalogueBreadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Catégories", href: "/categories" },
          { label: dataset.categoryName, href: `/categories/${dataset.categorySlug}` },
          { label: dataset.themeName, href: `/themes/${dataset.themeSlug}` },
          { label: dataset.title },
        ]}
      />

      <section className="rounded-[1.75rem] border border-sand-100 bg-white p-6 shadow-card sm:p-8">
        <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
          Jeu de données
        </p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
          <div>
            <h1 className="text-navy-900 text-3xl font-semibold tracking-[-0.03em]">
              {dataset.title}
            </h1>
            <p className="text-navy-500 mt-3 max-w-3xl text-base leading-7">
              {dataset.description ?? "Description indisponible."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-navy-700">
              <span className="rounded-full bg-sand-50 px-3 py-1.5">{dataset.categoryName}</span>
              <span className="rounded-full bg-sand-50 px-3 py-1.5">{dataset.themeName}</span>
              <span className="rounded-full bg-sand-50 px-3 py-1.5">
                {dataset.observationCount.toLocaleString("fr-FR")} observations
              </span>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-sand-100 bg-sand-50 p-5 text-sm text-navy-700">
            <p className="font-semibold text-navy-900">Métadonnées</p>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between gap-3">
                <dt>Organisation</dt>
                <dd className="font-medium">{dataset.sourceOrganization ?? "Non renseignée"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Statut</dt>
                <dd className="font-medium">{dataset.publicationStatus}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Mise à jour</dt>
                <dd className="font-medium">{formatDate(dataset.sourceUpdatedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Publication</dt>
                <dd className="font-medium">{formatDate(dataset.sourcePublishedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="rounded-[1.5rem] border border-sand-100 bg-white p-6 shadow-card">
          <h2 className="text-navy-900 text-xl font-semibold">Aperçu des observations</h2>
          <div className="mt-4 overflow-hidden rounded-[1rem] border border-sand-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand-50 text-navy-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Coordinate</th>
                  <th className="px-4 py-3 font-semibold">Valeur</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {dataset.sampleObservations.map((observation) => (
                  <tr key={observation.id} className="border-t border-sand-100">
                    <td className="px-4 py-3 align-top text-navy-700">
                      {Object.entries(observation.coordinate)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" · ")}
                    </td>
                    <td className="px-4 py-3 align-top text-navy-700">
                      {observation.value ?? observation.rawValue ?? "N/D"}
                    </td>
                    <td className="px-4 py-3 align-top text-navy-700">
                      {observation.status ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-sand-100 bg-white p-6 shadow-card">
            <h2 className="text-navy-900 text-xl font-semibold">Dimensions</h2>
            <ul className="mt-4 space-y-3 text-sm text-navy-700">
              {dataset.dimensions.map((dimension) => (
                <li key={dimension.id} className="rounded-xl bg-sand-50 px-4 py-3">
                  <p className="font-semibold text-navy-900">{dimension.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-navy-500">
                    {dimension.kind} · {dimension.key}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-sand-100 bg-white p-6 shadow-card">
            <h2 className="text-navy-900 text-xl font-semibold">Consultés récemment</h2>
            <div className="mt-4">
              <RecentlyViewedDatasets
                currentDatasetSlug={dataset.slug}
                datasets={[dataset, ...relatedDatasets]}
              />
            </div>
          </div>
        </div>
      </section>

      {relatedDatasets.length > 0 ? (
        <section className="space-y-4">
          <div>
            <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
              Jeux de données similaires
            </p>
            <h2 className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]">
              Même thème
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedDatasets.map((item) => (
              <CatalogueCard
                key={item.id}
                href={`/datasets/${item.slug}`}
                eyebrow={`${item.categoryName} · ${item.themeName}`}
                title={item.title}
                description={item.description ?? "Description indisponible."}
                footer={`${item.observationCount.toLocaleString("fr-FR")} observations`}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}