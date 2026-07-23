import type { Category, Dataset, Theme } from "../entities";
import type {
  DatasetCatalogueItem,
  ThemeCatalogueItem,
} from "./catalogue";

export interface CatalogueSearchResults {
  readonly categories: readonly Category[];
  readonly themes: readonly ThemeCatalogueItem[];
  readonly datasets: readonly DatasetCatalogueItem[];
}

export interface SearchRepository {
  searchCatalog(
    query: string,
    options?: { readonly limit?: number; readonly offset?: number },
  ): Promise<CatalogueSearchResults>;
}
