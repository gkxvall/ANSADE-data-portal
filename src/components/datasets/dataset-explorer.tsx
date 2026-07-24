"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  DatasetExplorerData,
  DatasetExplorerState,
} from "@/application/datasets/explorer";
import {
  buildChartModel,
  buildComparisonModel,
  buildExplorerState,
  buildExplorerUrl,
  filterObservations,
  paginateObservations,
  sortObservations,
} from "@/application/datasets/explorer";

import { CatalogueCard } from "@/components/catalogue/catalogue-card";
import { DatasetChartPanel } from "@/components/charts/dataset-chart-panel";

export function DatasetExplorer({
  data,
  searchParams,
}: {
  readonly data: DatasetExplorerData;
  readonly searchParams: Readonly<
    Record<string, string | string[] | undefined>
  >;
}) {
  const router = useRouter();
  const [state, setState] = useState<DatasetExplorerState>(() =>
    buildExplorerState(searchParams, data.dimensions),
  );

  const filtered = useMemo(
    () => sortObservations(filterObservations(data.observations, state), state),
    [data.observations, state],
  );
  const visiblePage = useMemo(
    () => paginateObservations(filtered, state),
    [filtered, state],
  );
  const chartModel = useMemo(
    () => buildChartModel(filtered, state),
    [filtered, state],
  );
  const comparisonModel = useMemo(
    () => buildComparisonModel(filtered, state),
    [filtered, state],
  );
  const hasMore = filtered.length > state.page * state.pageSize;

  function syncState(nextState: DatasetExplorerState) {
    setState(nextState);
    router.push(buildExplorerUrl(`/datasets/${data.dataset.slug}`, nextState), {
      scroll: false,
    });
  }

  function updateState(patch: Partial<DatasetExplorerState>) {
    syncState({ ...state, ...patch, page: patch.page ?? 1 });
  }

  function toggleFilter(dimensionKey: string, value: string) {
    if (!value) {
      return;
    }

    updateState({ filters: { ...state.filters, [dimensionKey]: value } });
  }

  function toggleDimensionVisibility(dimensionKey: string) {
    const nextVisible = state.visibleDimensionKeys.includes(dimensionKey)
      ? state.visibleDimensionKeys.filter((key) => key !== dimensionKey)
      : [...state.visibleDimensionKeys, dimensionKey];

    updateState({ visibleDimensionKeys: nextVisible });
  }

  function resetState() {
    syncState(buildExplorerState({}, data.dimensions));
  }

  function exportSvg() {
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">',
      '<rect width="100%" height="100%" fill="#f8f4ec"/>',
      `<text x="60" y="80" font-size="34" font-family="Arial" fill="#173d3d">${escapeXml(data.dataset.title)}</text>`,
      `<text x="60" y="120" font-size="18" font-family="Arial" fill="#5d6662">${escapeXml(state.chartType.toUpperCase())}</text>`,
      ...chartModel.series.flatMap((series, seriesIndex) =>
        series.points.map((point, index) => {
          const x = 80 + index * 120;
          const height = Math.max(20, Math.min(400, point.value * 4));
          const y = 520 - height;
          return `<rect x="${x}" y="${y}" width="64" height="${height}" fill="${seriesIndex % 2 === 0 ? "#1d6b63" : "#b08a4b"}" />`;
        }),
      ),
      "</svg>",
    ].join("");

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.dataset.slug}-chart.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportPng() {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 700;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.fillStyle = "#f8f4ec";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#173d3d";
    context.font = "bold 34px Arial";
    context.fillText(data.dataset.title, 60, 80);
    context.font = "18px Arial";
    context.fillStyle = "#5d6662";
    context.fillText(state.chartType.toUpperCase(), 60, 120);

    chartModel.series[0]?.points.forEach((point, index) => {
      const x = 80 + index * 120;
      const height = Math.max(20, Math.min(400, point.value * 4));
      context.fillStyle = index % 2 === 0 ? "#1d6b63" : "#b08a4b";
      context.fillRect(x, 520 - height, 64, height);
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${data.dataset.slug}-chart.png`;
    link.click();
  }

  const visibleObservations = visiblePage;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <div className="border-sand-100 shadow-card rounded-[1.5rem] border bg-white p-6">
          <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
            Filtres dynamiques
          </p>
          <h2 className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]">
            Dimensions et recherche
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="text-navy-800 flex flex-col gap-1 text-sm font-semibold">
              Rechercher
              <input
                className="border-sand-200 rounded-xl border px-3 py-2.5 text-sm font-normal"
                value={state.query}
                onChange={(event) => updateState({ query: event.target.value })}
                placeholder="Filtrer dans les coordonnées, statuts ou valeurs brutes"
              />
            </label>
            <label className="text-navy-800 flex flex-col gap-1 text-sm font-semibold">
              Trier
              <select
                className="border-sand-200 rounded-xl border px-3 py-2.5 text-sm font-normal"
                value={state.sortMode}
                onChange={(event) =>
                  updateState({
                    sortMode: event.target
                      .value as DatasetExplorerState["sortMode"],
                  })
                }
              >
                <option value="value-desc">Valeur décroissante</option>
                <option value="value-asc">Valeur croissante</option>
                <option value="dimension">Dimension X</option>
              </select>
            </label>
            <label className="text-navy-800 flex flex-col gap-1 text-sm font-semibold">
              Lignes par page
              <select
                className="border-sand-200 rounded-xl border px-3 py-2.5 text-sm font-normal"
                value={state.pageSize}
                onChange={(event) =>
                  updateState({ pageSize: Number(event.target.value), page: 1 })
                }
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {data.dimensions.map((dimension) => (
              <button
                key={dimension.key}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${state.visibleDimensionKeys.includes(dimension.key) ? "border-brand-500 bg-brand-50 text-brand-800" : "border-sand-200 text-navy-600 bg-white"}`}
                onClick={() => toggleDimensionVisibility(dimension.key)}
                type="button"
              >
                {dimension.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {data.dimensions.map((dimension) => (
              <label
                key={dimension.key}
                className="border-sand-100 bg-sand-50 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
              >
                <span className="text-navy-900 font-semibold">
                  {dimension.label}
                </span>
                <select
                  className="border-sand-200 rounded-full border bg-white px-2 py-1 text-xs"
                  value={state.filters[dimension.key] ?? ""}
                  onChange={(event) =>
                    updateState({
                      filters: {
                        ...state.filters,
                        [dimension.key]: event.target.value,
                      },
                      page: 1,
                    })
                  }
                >
                  <option value="">Tous</option>
                  {dimension.values.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className="bg-brand-600 text-navy-950 rounded-full px-4 py-2 text-sm font-semibold"
              onClick={resetState}
              type="button"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="border-sand-100 shadow-card rounded-[1.5rem] border bg-white p-6">
          <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
            Aperçu
          </p>
          <h2 className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]">
            État du filtre
          </h2>
          <div className="text-navy-700 mt-4 space-y-2 text-sm">
            <p>
              <span className="text-navy-900 font-semibold">
                Correspondances:
              </span>{" "}
              {filtered.length}
            </p>
            <p>
              <span className="text-navy-900 font-semibold">Page active:</span>{" "}
              {state.page}
            </p>
            <p>
              <span className="text-navy-900 font-semibold">Page size:</span>{" "}
              {state.pageSize}
            </p>
            <p>
              <span className="text-navy-900 font-semibold">
                Colonnes visibles:
              </span>{" "}
              {state.visibleDimensionKeys.length}
            </p>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {data.relatedDatasets.slice(0, 3).map((dataset) => (
              <CatalogueCard
                key={dataset.id}
                href={`/datasets/${dataset.slug}`}
                eyebrow={dataset.categoryName}
                title={dataset.title}
                description={dataset.themeName}
              />
            ))}
          </div>
        </div>
      </section>

      <DatasetChartPanel
        chartType={state.chartType}
        chartModel={chartModel}
        dimensionOptions={data.dimensions}
        xDimensionKey={state.xDimensionKey}
        seriesDimensionKey={state.seriesDimensionKey}
        onChartTypeChange={(chartType) => updateState({ chartType })}
        onXDimensionChange={(xDimensionKey) => updateState({ xDimensionKey })}
        onSeriesDimensionChange={(seriesDimensionKey) =>
          updateState({ seriesDimensionKey, page: 1 })
        }
        onToggleFilter={toggleFilter}
        onExportSvg={exportSvg}
        onExportPng={exportPng}
      />

      <section className="border-sand-100 shadow-card rounded-[1.5rem] border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
              Tableau interactif
            </p>
            <h2 className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]">
              Observations filtrées
            </h2>
          </div>
          <div className="text-navy-500 text-sm">
            {hasMore ? "Pagination activée" : "Fin des résultats"}
          </div>
        </div>

        <div className="border-sand-100 mt-4 overflow-hidden rounded-[1rem] border">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-50 text-navy-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Statut</th>
                {data.dimensions
                  .filter((dimension) =>
                    state.visibleDimensionKeys.includes(dimension.key),
                  )
                  .map((dimension) => (
                    <th key={dimension.key} className="px-4 py-3 font-semibold">
                      {dimension.label}
                    </th>
                  ))}
                <th className="px-4 py-3 font-semibold">Valeur</th>
                <th className="px-4 py-3 font-semibold">Qualité</th>
              </tr>
            </thead>
            <tbody>
              {visibleObservations.map((observation) => (
                <tr key={observation.id} className="border-sand-100 border-t">
                  <td className="text-navy-700 px-4 py-3 align-top">
                    {observation.status ?? "—"}
                  </td>
                  {data.dimensions
                    .filter((dimension) =>
                      state.visibleDimensionKeys.includes(dimension.key),
                    )
                    .map((dimension) => (
                      <td
                        key={dimension.key}
                        className="text-navy-700 px-4 py-3 align-top"
                      >
                        {observation.coordinate[dimension.key] ?? "—"}
                      </td>
                    ))}
                  <td className="text-navy-700 px-4 py-3 align-top">
                    {observation.value ?? observation.rawValue ?? "N/D"}
                  </td>
                  <td className="text-navy-700 px-4 py-3 align-top">
                    <span className="bg-sand-50 rounded-full px-2 py-1 text-xs font-semibold">
                      {observation.value === null
                        ? "Valeur brute"
                        : "Numérique"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            className="border-sand-200 rounded-full border bg-white px-4 py-2 text-sm font-semibold"
            onClick={() => updateState({ page: Math.max(1, state.page - 1) })}
            type="button"
          >
            Précédent
          </button>
          <span className="text-navy-500 text-sm">Page {state.page}</span>
          <button
            className="border-sand-200 rounded-full border bg-white px-4 py-2 text-sm font-semibold"
            onClick={() =>
              updateState({ page: hasMore ? state.page + 1 : state.page })
            }
            type="button"
          >
            Suivant
          </button>
        </div>
      </section>

      <section className="border-sand-100 shadow-card rounded-[1.5rem] border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
              Comparaison
            </p>
            <h2 className="text-navy-900 mt-1 text-2xl font-semibold tracking-[-0.02em]">
              Workspace de comparaison
            </h2>
          </div>
          <label className="text-navy-800 flex items-center gap-2 text-sm font-semibold">
            Dimension
            <select
              className="border-sand-200 rounded-xl border px-3 py-2.5 text-sm font-normal"
              value={state.compareDimensionKey ?? ""}
              onChange={(event) =>
                updateState({ compareDimensionKey: event.target.value || null })
              }
            >
              <option value="">Choisir</option>
              {data.dimensions.map((dimension) => (
                <option key={dimension.key} value={dimension.key}>
                  {dimension.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!comparisonModel.available ? (
          <div className="border-sand-100 bg-sand-50 text-navy-600 mt-4 rounded-xl border p-4 text-sm">
            {comparisonModel.reason}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {comparisonModel.groups.map((group) => (
              <article
                key={group.label}
                className="rounded-card border-navy-100 border bg-white p-5"
              >
                <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
                  {group.label}
                </p>
                <p className="text-navy-900 mt-2 text-2xl font-semibold">
                  {group.total.toLocaleString("fr-FR")}
                </p>
                <p className="text-navy-500 mt-1 text-sm">
                  {group.count} observations, moyenne{" "}
                  {group.average.toLocaleString("fr-FR", {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
