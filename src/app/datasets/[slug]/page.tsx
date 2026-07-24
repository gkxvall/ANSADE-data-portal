import { notFound } from "next/navigation";

import { getDatasetPageModel } from "@/application/catalogue/queries";
import { serializeDatasetExplorerData } from "@/application/datasets/explorer";
import { CatalogueBreadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CatalogueCard } from "@/components/catalogue/catalogue-card";
import { DatasetExplorer } from "@/components/datasets/dataset-explorer";

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
  searchParams,
}: {
  readonly params: Promise<{ slug: string }>;
  readonly searchParams: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}) {
  const { slug } = await params;
  const [resolvedSearchParams, model] = await Promise.all([
    searchParams,
    getDatasetPageModel(slug),
  ]);
  const { dataset, observations, relatedDatasets } = model;

  if (!dataset) {
    notFound();
  }

  const explorerData = serializeDatasetExplorerData(
    dataset,
    observations,
    relatedDatasets,
  );

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <CatalogueBreadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Catégories", href: "/categories" },
          {
            label: dataset.categoryName,
            href: `/categories/${dataset.categorySlug}`,
          },
          { label: dataset.themeName, href: `/themes/${dataset.themeSlug}` },
          { label: dataset.title },
        ]}
      />

      <section className="border-sand-100 shadow-card rounded-[1.75rem] border bg-white p-6 sm:p-8">
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
            <div className="text-navy-700 mt-6 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="bg-sand-50 rounded-full px-3 py-1.5">
                {dataset.categoryName}
              </span>
              <span className="bg-sand-50 rounded-full px-3 py-1.5">
                {dataset.themeName}
              </span>
              <span className="bg-sand-50 rounded-full px-3 py-1.5">
                {dataset.observationCount.toLocaleString("fr-FR")} observations
              </span>
            </div>
          </div>

          <div className="border-sand-100 bg-sand-50 text-navy-700 rounded-[1.25rem] border p-5 text-sm">
            <p className="text-navy-900 font-semibold">Métadonnées</p>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between gap-3">
                <dt>Organisation</dt>
                <dd className="font-medium">
                  {dataset.sourceOrganization ?? "Non renseignée"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Statut</dt>
                <dd className="font-medium">{dataset.publicationStatus}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Mise à jour</dt>
                <dd className="font-medium">
                  {formatDate(dataset.sourceUpdatedAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Publication</dt>
                <dd className="font-medium">
                  {formatDate(dataset.sourcePublishedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <DatasetExplorer
        data={explorerData}
        searchParams={resolvedSearchParams}
      />

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
