import { getDataProvider } from "@/infrastructure/providers";

import type {
  DatasetCatalogueItem,
  DatasetDetail,
  DatasetListOptions,
  ThemeCatalogueItem,
} from "@/domain/repositories";
import type { CatalogueSearchResults } from "@/domain/repositories/search";
import type { CatalogueStatistics } from "@/domain/repositories/statistics";
import type { Category } from "@/domain/entities";

export interface CatalogueHomeModel {
  readonly statistics: CatalogueStatistics;
  readonly categories: readonly Category[];
  readonly featuredDatasets: readonly DatasetCatalogueItem[];
}

export interface CategoryPageModel {
  readonly category: Category | null;
  readonly themes: readonly ThemeCatalogueItem[];
  readonly datasets: readonly DatasetCatalogueItem[];
}

export interface ThemePageModel {
  readonly theme: ThemeCatalogueItem | null;
  readonly datasets: readonly DatasetCatalogueItem[];
}

export interface DatasetListPageModel {
  readonly datasets: readonly DatasetCatalogueItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
  readonly sortBy: NonNullable<DatasetListOptions["sortBy"]>;
  readonly sortDirection: NonNullable<DatasetListOptions["sortDirection"]>;
  readonly query: string;
  readonly categorySlug: string | null;
  readonly themeSlug: string | null;
}

export interface DatasetPageModel {
  readonly dataset: DatasetDetail | null;
  readonly relatedDatasets: readonly DatasetCatalogueItem[];
}

export interface SearchPageModel extends CatalogueSearchResults {
  readonly query: string;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

function normalizePage(page: number | undefined): number {
  return Number.isFinite(page) && page && page > 0 ? Math.floor(page) : 1;
}

function normalizeSortDirection(
  sortDirection: string | undefined,
): NonNullable<DatasetListOptions["sortDirection"]> {
  return sortDirection === "desc" ? "desc" : "asc";
}

function normalizeSortBy(sortBy: string | undefined): NonNullable<DatasetListOptions["sortBy"]> {
  switch (sortBy) {
    case "updatedAt":
    case "publishedAt":
    case "title":
      return sortBy;
    default:
      return "updatedAt";
  }
}

export async function getCatalogueHomeModel(): Promise<CatalogueHomeModel> {
  const provider = await getDataProvider();
  const [statistics, categories, featuredDatasets] = await Promise.all([
    provider.statistics.getStatistics(),
    provider.categories.listCategories({ limit: 6, sortBy: "displayOrder" }),
    provider.datasets.listDatasets({ limit: 6, sortBy: "updatedAt", sortDirection: "desc" }),
  ]);

  return {
    statistics,
    categories,
    featuredDatasets,
  };
}

export async function getCategoriesPageModel(): Promise<CatalogueHomeModel> {
  const provider = await getDataProvider();
  const [statistics, categories, featuredDatasets] = await Promise.all([
    provider.statistics.getStatistics(),
    provider.categories.listCategories({ sortBy: "displayOrder" }),
    provider.datasets.listDatasets({ limit: 6, sortBy: "updatedAt", sortDirection: "desc" }),
  ]);

  return {
    statistics,
    categories,
    featuredDatasets,
  };
}

export async function getCategoryPageModel(slug: string): Promise<CategoryPageModel> {
  const provider = await getDataProvider();

  const [category, themes, datasets] = await Promise.all([
    provider.categories.getCategoryBySlug(slug),
    provider.themes.listThemes({ categorySlug: slug, sortBy: "displayOrder" }),
    provider.datasets.listDatasets({ categorySlug: slug, sortBy: "updatedAt", sortDirection: "desc" }),
  ]);

  return { category, themes, datasets };
}

export async function getThemePageModel(slug: string): Promise<ThemePageModel> {
  const provider = await getDataProvider();

  const [theme, datasets] = await Promise.all([
    provider.themes.getThemeBySlug(slug),
    provider.datasets.listDatasets({ themeSlug: slug, sortBy: "updatedAt", sortDirection: "desc" }),
  ]);

  return { theme, datasets };
}

export async function getDatasetListPageModel(
  searchParams: Readonly<Record<string, string | string[] | undefined>>,
): Promise<DatasetListPageModel> {
  const provider = await getDataProvider();
  const page = normalizePage(Array.isArray(searchParams.page) ? Number(searchParams.page[0]) : Number(searchParams.page));
  const pageSize = 12;
  const sortBy = normalizeSortBy(Array.isArray(searchParams.sort) ? searchParams.sort[0] : searchParams.sort);
  const sortDirection = normalizeSortDirection(Array.isArray(searchParams.dir) ? searchParams.dir[0] : searchParams.dir);
  const query = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : null;
  const themeSlug = typeof searchParams.theme === "string" ? searchParams.theme : null;

  const datasets = await provider.datasets.listDatasets({
    query: query || undefined,
    categorySlug: categorySlug ?? undefined,
    themeSlug: themeSlug ?? undefined,
    sortBy,
    sortDirection,
    limit: pageSize + 1,
    offset: (page - 1) * pageSize,
  });

  const hasMore = datasets.length > pageSize;

  return {
    datasets: datasets.slice(0, pageSize),
    page,
    pageSize,
    hasMore,
    sortBy,
    sortDirection,
    query,
    categorySlug,
    themeSlug,
  };
}

export async function getDatasetPageModel(slug: string): Promise<DatasetPageModel> {
  const provider = await getDataProvider();
  const dataset = await provider.datasets.getDatasetBySlug(slug);
  const relatedDatasets = dataset
    ? await provider.datasets.listDatasets({
        themeSlug: dataset.themeSlug,
        sortBy: "updatedAt",
        sortDirection: "desc",
        limit: 4,
      })
    : [];

  return {
    dataset,
    relatedDatasets: relatedDatasets.filter((entry) => entry.slug !== slug),
  };
}

export async function getSearchPageModel(
  searchParams: Readonly<Record<string, string | string[] | undefined>>,
): Promise<SearchPageModel> {
  const provider = await getDataProvider();
  const query = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = normalizePage(Array.isArray(searchParams.page) ? Number(searchParams.page[0]) : Number(searchParams.page));
  const pageSize = 9;
  const results = await provider.search.searchCatalog(query, {
    limit: pageSize + 1,
    offset: (page - 1) * pageSize,
  });

  return {
    ...results,
    query,
    page,
    pageSize,
    hasMore: results.datasets.length > pageSize,
    datasets: results.datasets.slice(0, pageSize),
  };
}
