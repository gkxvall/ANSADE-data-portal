import { notFound } from "next/navigation";

import { getThemePageModel } from "@/application/catalogue/queries";
import { CatalogueBreadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CatalogueCard } from "@/components/catalogue/catalogue-card";

export default async function ThemePage({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { theme, datasets } = await getThemePageModel(slug);

  if (!theme) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <CatalogueBreadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Catégories", href: "/categories" },
          { label: theme.categoryName, href: `/categories/${theme.categorySlug}` },
          { label: theme.name },
        ]}
      />

      <section className="rounded-[1.75rem] border border-sand-100 bg-white p-6 shadow-card sm:p-8">
        <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
          Thème
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-navy-900 text-3xl font-semibold tracking-[-0.03em]">
              {theme.name}
            </h1>
            <p className="text-navy-500 mt-3 max-w-2xl text-base leading-7">
              Dans la catégorie {theme.categoryName}.
            </p>
          </div>
          <div className="text-navy-500 text-sm">
            <p>Slug: {theme.slug}</p>
            <p>Source: {theme.sourceId}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {datasets.map((dataset) => (
          <CatalogueCard
            key={dataset.id}
            href={`/datasets/${dataset.slug}`}
            eyebrow={`${dataset.categoryName} · ${dataset.themeName}`}
            title={dataset.title}
            description={dataset.description ?? "Description indisponible."}
            footer={`${dataset.observationCount.toLocaleString("fr-FR")} observations`}
          />
        ))}
      </section>
    </div>
  );
}