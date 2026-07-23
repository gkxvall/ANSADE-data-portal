import type {
  Category,
  Dataset,
  DatasetMetadata,
  Dimension,
  Observation,
  Theme,
} from "../entities";

export interface ThemeCatalogueItem extends Theme {
  readonly categoryName: string;
  readonly categorySlug: string;
}

export interface DatasetCatalogueItem extends Dataset {
  readonly categoryName: string;
  readonly categorySlug: string;
  readonly themeName: string;
  readonly themeSlug: string;
  readonly observationCount: number;
}

export interface DatasetDetail extends DatasetCatalogueItem {
  readonly metadata: DatasetMetadata | null;
  readonly dimensions: readonly Dimension[];
  readonly sampleObservations: readonly Observation[];
}

export interface CatalogueListOptions {
  readonly limit?: number;
  readonly offset?: number;
  readonly sortBy?: "displayOrder" | "name" | "updatedAt";
  readonly sortDirection?: "asc" | "desc";
}

export interface DatasetListOptions {
  readonly limit?: number;
  readonly offset?: number;
  readonly sortBy?: "title" | "updatedAt" | "publishedAt";
  readonly sortDirection?: "asc" | "desc";
  readonly categorySlug?: string;
  readonly themeSlug?: string;
  readonly query?: string;
}

export interface CategoryRepository {
  listCategories(options?: CatalogueListOptions): Promise<readonly Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
}

export interface ThemeRepository {
  listThemes(options?: CatalogueListOptions & { categorySlug?: string }): Promise<readonly ThemeCatalogueItem[]>;
  getThemeBySlug(slug: string): Promise<ThemeCatalogueItem | null>;
}

export interface DatasetRepository {
  listDatasets(options?: DatasetListOptions): Promise<readonly DatasetCatalogueItem[]>;
  getDatasetBySlug(slug: string): Promise<DatasetDetail | null>;
}

export interface ObservationRepository {
  listObservationsByDatasetId(
    datasetId: string,
    options?: { readonly limit?: number; readonly offset?: number },
  ): Promise<readonly Observation[]>;
  countObservationsByDatasetId(datasetId: string): Promise<number>;
}
