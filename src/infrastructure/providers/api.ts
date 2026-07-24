import "server-only";

import type { DataProvider } from "./types";

function notImplemented(method: string): never {
  throw new Error(
    `NotImplemented: the ANSADE API provider does not yet implement ${method}.`,
  );
}

export function createApiDataProvider(): DataProvider {
  return {
    categories: {
      listCategories: async () => notImplemented("categories.listCategories"),
      getCategoryBySlug: async () =>
        notImplemented("categories.getCategoryBySlug"),
    },
    themes: {
      listThemes: async () => notImplemented("themes.listThemes"),
      getThemeBySlug: async () => notImplemented("themes.getThemeBySlug"),
    },
    datasets: {
      listDatasets: async () => notImplemented("datasets.listDatasets"),
      getDatasetBySlug: async () => notImplemented("datasets.getDatasetBySlug"),
    },
    observations: {
      listObservationsByDatasetId: async () =>
        notImplemented("observations.listObservationsByDatasetId"),
      countObservationsByDatasetId: async () =>
        notImplemented("observations.countObservationsByDatasetId"),
    },
    search: {
      searchCatalog: async () => notImplemented("search.searchCatalog"),
    },
    statistics: {
      getStatistics: async () => notImplemented("statistics.getStatistics"),
    },
  };
}
