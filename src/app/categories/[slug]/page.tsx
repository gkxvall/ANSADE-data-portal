import { notFound } from "next/navigation";

import { getCategoryPageModel } from "@/application/catalogue/queries";
import { CatalogueBreadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CatalogueCard } from "@/components/catalogue/catalogue-card";
import { RecentlyViewedDatasets } from "@/components/catalogue/recently-viewed-datasets";

export default async function CategoryPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { category, themes, datasets } = await getCategoryPageModel(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-8 p-4 sm:p-6 lg:p-8">
      <CatalogueBreadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Catégories", href: "/categories" },
          { label: category.name },
        ]}
      />

      <section className="rounded-[1.75rem] border border-sand-100 bg-white p-6 shadow-card sm:p-8">
        <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
          Catégorie
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-navy-900 text-3xl font-semibold tracking-[-0.03em]">
              {category.name}
            </h1>
            <p className="text-navy-500 mt-3 max-w-2xl text-base leading-7">
              Détail de la catégorie source {category.sourceId}.
            </p>
          </div>
          <div className="text-navy-500 text-sm">
            <p>Source: {category.sourceSystem}</p>
            <p>Slug: {category.slug}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
            Thèmes
          </p>
          <h2 className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]">
            Thèmes de cette catégorie
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {themes.map((theme) => (
            <CatalogueCard
              key={theme.id}
              href={`/themes/${theme.slug}`}
              eyebrow={`${theme.categoryName}`}
              title={theme.name}
              description={`Identifiant source ${theme.sourceId}`}
              footer={theme.isActive ? "Thème actif" : "Thème inactif"}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
            Jeux de données
          </p>
          <h2 className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]">
            Jeux de données de la catégorie
          </h2>
        </div>
        <RecentlyViewedDatasets datasets={datasets} />
      </section>
    </div>
  );
}