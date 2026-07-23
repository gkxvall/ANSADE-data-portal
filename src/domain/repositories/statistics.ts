export interface CatalogueStatistics {
  readonly categories: number;
  readonly themes: number;
  readonly datasets: number;
  readonly observations: number;
  readonly activeDatasets: number;
  readonly publishedDatasets: number;
}

export interface StatisticsProvider {
  getStatistics(): Promise<CatalogueStatistics>;
}
