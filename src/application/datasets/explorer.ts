import type { DatasetCatalogueItem, DatasetDetail } from "@/domain/repositories";
import type { Observation } from "@/domain/entities";

export type DatasetExplorerChartType =
  | "line"
  | "bar"
  | "area"
  | "pie"
  | "scatter"
  | "kpi";

export type DatasetExplorerSortMode = "value-desc" | "value-asc" | "dimension";

export interface DatasetExplorerDimensionOption {
  readonly key: string;
  readonly label: string;
  readonly kind: string;
  readonly values: readonly string[];
}

export interface DatasetExplorerDataset {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly description: string | null;
  readonly sourceOrganization: string | null;
  readonly publicationStatus: string;
  readonly isActive: boolean;
  readonly checksum: string | null;
  readonly sourceUpdatedAt: string | null;
  readonly sourcePublishedAt: string | null;
  readonly categoryName: string;
  readonly categorySlug: string;
  readonly themeName: string;
  readonly themeSlug: string;
  readonly observationCount: number;
}

export interface DatasetExplorerObservation {
  readonly id: string;
  readonly sourceId: string | null;
  readonly coordinate: Readonly<Record<string, string>>;
  readonly coordinateHash: string;
  readonly value: number | null;
  readonly rawValue: string | null;
  readonly status: string | null;
  readonly dimensionValueIds: readonly string[];
}

export interface DatasetExplorerData {
  readonly dataset: DatasetExplorerDataset;
  readonly dimensions: readonly DatasetExplorerDimensionOption[];
  readonly observations: readonly DatasetExplorerObservation[];
  readonly relatedDatasets: readonly DatasetCatalogueItem[];
}

export interface DatasetExplorerState {
  readonly query: string;
  readonly page: number;
  readonly pageSize: number;
  readonly sortMode: DatasetExplorerSortMode;
  readonly chartType: DatasetExplorerChartType;
  readonly xDimensionKey: string;
  readonly seriesDimensionKey: string | null;
  readonly compareDimensionKey: string | null;
  readonly visibleDimensionKeys: readonly string[];
  readonly filters: Readonly<Record<string, string>>;
}

export interface DatasetExplorerChartPoint {
  readonly label: string;
  readonly value: number;
  readonly count: number;
}

export interface DatasetExplorerChartSeries {
  readonly name: string;
  readonly points: readonly DatasetExplorerChartPoint[];
}

export interface DatasetExplorerComparisonGroup {
  readonly label: string;
  readonly total: number;
  readonly count: number;
  readonly average: number;
}

export interface DatasetExplorerChartModel {
  readonly available: boolean;
  readonly reason: string | null;
  readonly series: readonly DatasetExplorerChartSeries[];
}

export interface DatasetExplorerComparisonModel {
  readonly available: boolean;
  readonly reason: string | null;
  readonly groups: readonly DatasetExplorerComparisonGroup[];
}

export function serializeDatasetExplorerData(
  dataset: DatasetDetail,
  observations: readonly Observation[],
  relatedDatasets: readonly DatasetCatalogueItem[],
): DatasetExplorerData {
  const dimensions = dataset.dimensions.map((dimension) => {
    const values = Array.from(
      new Set(
        observations
          .map((observation) => observation.coordinate[dimension.key])
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((left, right) => left.localeCompare(right, "fr"));

    return {
      key: dimension.key,
      label: dimension.label,
      kind: String(dimension.kind),
      values,
    } satisfies DatasetExplorerDimensionOption;
  });

  return {
    dataset: {
      id: dataset.id,
      title: dataset.title,
      slug: dataset.slug,
      description: dataset.description,
      sourceOrganization: dataset.sourceOrganization,
      publicationStatus: String(dataset.publicationStatus),
      isActive: dataset.isActive,
      checksum: dataset.checksum,
      sourceUpdatedAt: dataset.sourceUpdatedAt?.toISOString() ?? null,
      sourcePublishedAt: dataset.sourcePublishedAt?.toISOString() ?? null,
      categoryName: dataset.categoryName,
      categorySlug: dataset.categorySlug,
      themeName: dataset.themeName,
      themeSlug: dataset.themeSlug,
      observationCount: observations.length,
    },
    dimensions,
    observations: observations.map((observation) => ({
      id: observation.id,
      sourceId: observation.sourceId,
      coordinate: observation.coordinate,
      coordinateHash: observation.coordinateHash,
      value: observation.value,
      rawValue: observation.rawValue,
      status: observation.status,
      dimensionValueIds: observation.dimensionValueIds,
    })),
    relatedDatasets,
  };
}

export function buildExplorerState(
  searchParams: Readonly<Record<string, string | string[] | undefined>>,
  dimensions: readonly DatasetExplorerDimensionOption[],
): DatasetExplorerState {
  const firstDimension = dimensions[0];
  const query = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = normalizePositiveInteger(searchParams.page, 1);
  const pageSize = normalizePositiveInteger(searchParams.pageSize, 8);
  const sortMode = normalizeSortMode(searchParams.sort);
  const chartType = normalizeChartType(searchParams.chart);
  const xDimensionKey = typeof searchParams.x === "string" && dimensions.some((dimension) => dimension.key === searchParams.x)
    ? searchParams.x
    : firstDimension?.key ?? "value";
  const seriesDimensionKey = typeof searchParams.series === "string" && dimensions.some((dimension) => dimension.key === searchParams.series)
    ? searchParams.series
    : null;
  const compareDimensionKey = typeof searchParams.compare === "string" && dimensions.some((dimension) => dimension.key === searchParams.compare)
    ? searchParams.compare
    : null;
  const visibleDimensionKeys = parseCsv(searchParams.visible).filter((key) =>
    dimensions.some((dimension) => dimension.key === key),
  );
  const filters: Record<string, string> = {};

  for (const [key, value] of Object.entries(searchParams)) {
    if (!key.startsWith("f_") || typeof value !== "string") {
      continue;
    }

    const dimensionKey = key.slice(2);
    if (dimensions.some((dimension) => dimension.key === dimensionKey)) {
      filters[dimensionKey] = value;
    }
  }

  return {
    query,
    page,
    pageSize,
    sortMode,
    chartType,
    xDimensionKey,
    seriesDimensionKey,
    compareDimensionKey,
    visibleDimensionKeys:
      visibleDimensionKeys.length > 0
        ? visibleDimensionKeys
        : dimensions.map((dimension) => dimension.key),
    filters,
  };
}

export function buildExplorerUrl(
  basePath: string,
  state: DatasetExplorerState,
): string {
  const params = new URLSearchParams();

  if (state.query) params.set("q", state.query);
  if (state.page > 1) params.set("page", String(state.page));
  if (state.pageSize !== 8) params.set("pageSize", String(state.pageSize));
  if (state.sortMode !== "value-desc") params.set("sort", state.sortMode);
  if (state.chartType !== "bar") params.set("chart", state.chartType);
  if (state.xDimensionKey) params.set("x", state.xDimensionKey);
  if (state.seriesDimensionKey) params.set("series", state.seriesDimensionKey);
  if (state.compareDimensionKey) params.set("compare", state.compareDimensionKey);
  if (state.visibleDimensionKeys.length > 0) {
    params.set("visible", state.visibleDimensionKeys.join(","));
  }

  for (const [key, value] of Object.entries(state.filters)) {
    if (value) {
      params.set(`f_${key}`, value);
    }
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function filterObservations(
  observations: readonly DatasetExplorerObservation[],
  state: DatasetExplorerState,
): readonly DatasetExplorerObservation[] {
  const query = state.query.toLowerCase();

  return observations.filter((observation) => {
    const coordinateText = Object.values(observation.coordinate).join(" ").toLowerCase();
    const matchesQuery =
      !query ||
      coordinateText.includes(query) ||
      observation.rawValue?.toLowerCase().includes(query) ||
      observation.status?.toLowerCase().includes(query) ||
      observation.sourceId?.toLowerCase().includes(query);

    const matchesFilters = Object.entries(state.filters).every(
      ([dimensionKey, value]) => observation.coordinate[dimensionKey] === value,
    );

    return matchesQuery && matchesFilters;
  });
}

export function sortObservations(
  observations: readonly DatasetExplorerObservation[],
  state: DatasetExplorerState,
): readonly DatasetExplorerObservation[] {
  const sorted = [...observations];

  switch (state.sortMode) {
    case "value-asc":
      return sorted.sort((left, right) => (left.value ?? Number.POSITIVE_INFINITY) - (right.value ?? Number.POSITIVE_INFINITY));
    case "dimension":
      return sorted.sort((left, right) => {
        const leftValue = left.coordinate[state.xDimensionKey] ?? "";
        const rightValue = right.coordinate[state.xDimensionKey] ?? "";
        return leftValue.localeCompare(rightValue, "fr");
      });
    case "value-desc":
    default:
      return sorted.sort((left, right) => (right.value ?? Number.NEGATIVE_INFINITY) - (left.value ?? Number.NEGATIVE_INFINITY));
  }
}

export function paginateObservations(
  observations: readonly DatasetExplorerObservation[],
  state: DatasetExplorerState,
): readonly DatasetExplorerObservation[] {
  const start = (state.page - 1) * state.pageSize;
  return observations.slice(start, start + state.pageSize);
}

export function buildChartModel(
  observations: readonly DatasetExplorerObservation[],
  state: DatasetExplorerState,
): DatasetExplorerChartModel {
  if (state.chartType === "scatter") {
    const xNumericCount = observations.filter((observation) => {
      const numericValue = Number(observation.coordinate[state.xDimensionKey]);
      return Number.isFinite(numericValue) && observation.value !== null;
    }).length;

    if (xNumericCount < 2) {
      return {
        available: false,
        reason:
          "Le graphique en nuage de points nécessite des valeurs numériques sur l’axe X et au moins deux observations valides.",
        series: [],
      };
    }

    const points = observations
      .map((observation) => ({
        x: Number(observation.coordinate[state.xDimensionKey]),
        y: observation.value,
      }))
      .filter((point) => Number.isFinite(point.x) && point.y !== null)
       .map((point) => ({
        label: String(point.x),
        value: Number(point.y),
        count: 1,
      }));

    return {
      available: true,
      reason: null,
      series: [{ name: "Nuage", points }],
    };
  }

  if (observations.length === 0) {
    return {
      available: false,
      reason: "Aucune observation ne correspond aux filtres actifs.",
      series: [],
    };
  }

  const seriesMap = new Map<string, Map<string, { value: number; count: number }>>();

  for (const observation of observations) {
    const xValue = observation.coordinate[state.xDimensionKey] ?? "(sans valeur)";
    const seriesName = state.seriesDimensionKey
      ? observation.coordinate[state.seriesDimensionKey] ?? "(sans série)"
      : "Valeur";
    const value = observation.value ?? 0;

    const series = seriesMap.get(seriesName) ?? new Map();
    const point = series.get(xValue) ?? { value: 0, count: 0 };
    point.value += value;
    point.count += 1;
    series.set(xValue, point);
    seriesMap.set(seriesName, series);
  }

  const series = Array.from(seriesMap.entries()).map(([name, points]) => ({
    name,
    points: Array.from(points.entries())
      .map(([label, aggregate]) => ({
        label,
        value: aggregate.value,
        count: aggregate.count,
      }))
      .sort((left, right) => left.label.localeCompare(right.label, "fr")),
  }));

  const reason = state.chartType === "pie"
    ? observations.some((observation) => observation.value !== null)
      ? null
      : "Le diagramme circulaire nécessite au moins une valeur numérique."
    : null;

  return {
    available: reason === null,
    reason,
    series,
  };
}

export function buildComparisonModel(
  observations: readonly DatasetExplorerObservation[],
  state: DatasetExplorerState,
): DatasetExplorerComparisonModel {
  if (!state.compareDimensionKey) {
    return {
      available: false,
      reason: "Choisissez une dimension de comparaison.",
      groups: [],
    };
  }

  const groups = new Map<string, { total: number; count: number }>();

  for (const observation of observations) {
    const groupLabel = observation.coordinate[state.compareDimensionKey];
    if (!groupLabel) {
      continue;
    }

    const current = groups.get(groupLabel) ?? { total: 0, count: 0 };
    current.total += observation.value ?? 0;
    current.count += 1;
    groups.set(groupLabel, current);
  }

  const sorted = Array.from(groups.entries())
    .map(([label, aggregate]) => ({
      label,
      total: aggregate.total,
      count: aggregate.count,
      average: aggregate.count > 0 ? aggregate.total / aggregate.count : 0,
    }))
    .sort((left, right) => right.total - left.total)
    .slice(0, 4);

  if (sorted.length < 2) {
    return {
      available: false,
      reason: "La comparaison nécessite au moins deux groupes de données.",
      groups: sorted,
    };
  }

  return {
    available: true,
    reason: null,
    groups: sorted,
  };
}

function parseCsv(value: string | string[] | undefined): string[] {
  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizePositiveInteger(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function normalizeSortMode(value: string | string[] | undefined): DatasetExplorerSortMode {
  const rawValue = Array.isArray(value) ? value[0] : value;

  switch (rawValue) {
    case "value-asc":
    case "dimension":
      return rawValue;
    case "value-desc":
    default:
      return "value-desc";
  }
}

function normalizeChartType(value: string | string[] | undefined): DatasetExplorerChartType {
  const rawValue = Array.isArray(value) ? value[0] : value;

  switch (rawValue) {
    case "line":
    case "bar":
    case "area":
    case "pie":
    case "scatter":
    case "kpi":
      return rawValue;
    default:
      return "bar";
  }
}
