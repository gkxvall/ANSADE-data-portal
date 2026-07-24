import "server-only";

import { developmentFixture } from "../../../prisma/fixtures/development";

import type { Category, Dataset, Observation, Theme } from "@/domain/entities";
import type {
  CatalogueListOptions,
  DatasetCatalogueItem,
  DatasetDetail,
  DatasetListOptions,
  ThemeCatalogueItem,
} from "@/domain/repositories";
import type { CatalogueSearchResults } from "@/domain/repositories/search";
import type { CatalogueStatistics } from "@/domain/repositories/statistics";

import type { DataProvider } from "./types";

const sourceTimestamp = new Date("2026-01-01T00:00:00.000Z");

const categories: readonly Category[] = [
  {
    id: developmentFixture.category.id,
    sourceSystem: developmentFixture.sourceSystem,
    sourceId: developmentFixture.category.sourceId,
    name: developmentFixture.category.name,
    slug: developmentFixture.category.slug,
    displayOrder: developmentFixture.category.displayOrder,
    isActive: developmentFixture.category.isActive,
    sourceUpdatedAt: developmentFixture.category.sourceUpdatedAt,
    sourcePublishedAt: developmentFixture.category.sourcePublishedAt,
    createdAt: sourceTimestamp,
    updatedAt: sourceTimestamp,
  },
];

const themes: readonly Theme[] = [
  {
    id: developmentFixture.theme.id,
    categoryId: developmentFixture.category.id,
    sourceSystem: developmentFixture.sourceSystem,
    sourceId: developmentFixture.theme.sourceId,
    name: developmentFixture.theme.name,
    slug: developmentFixture.theme.slug,
    displayOrder: developmentFixture.theme.displayOrder,
    isActive: developmentFixture.theme.isActive,
    sourceUpdatedAt: developmentFixture.theme.sourceUpdatedAt,
    sourcePublishedAt: developmentFixture.theme.sourcePublishedAt,
    createdAt: sourceTimestamp,
    updatedAt: sourceTimestamp,
  },
];

const dataset: Dataset = {
  id: developmentFixture.dataset.id,
  themeId: developmentFixture.theme.id,
  sourceSystem: developmentFixture.sourceSystem,
  sourceId: developmentFixture.dataset.sourceId,
  title: developmentFixture.dataset.title,
  slug: developmentFixture.dataset.slug,
  description: developmentFixture.dataset.description,
  sourceOrganization: developmentFixture.dataset.sourceOrganization,
  publicationStatus: developmentFixture.dataset.publicationStatus,
  isActive: developmentFixture.dataset.isActive,
  checksum: developmentFixture.dataset.checksum,
  sourceUpdatedAt: developmentFixture.dataset.sourceUpdatedAt,
  sourcePublishedAt: developmentFixture.dataset.sourcePublishedAt,
  createdAt: sourceTimestamp,
  updatedAt: sourceTimestamp,
};

const themeCatalogueItem: ThemeCatalogueItem = {
  ...themes[0],
  categoryName: categories[0].name,
  categorySlug: categories[0].slug,
};

const datasetCatalogueItem: DatasetCatalogueItem = {
  ...dataset,
  categoryName: categories[0].name,
  categorySlug: categories[0].slug,
  themeName: themes[0].name,
  themeSlug: themes[0].slug,
  observationCount: 1,
};

const observations: readonly Observation[] = [
  {
    id: developmentFixture.observation.id,
    datasetId: dataset.id,
    sourceId: developmentFixture.observation.sourceId,
    coordinate: developmentFixture.observation.coordinate,
    coordinateHash: developmentFixture.observation.coordinateHash,
    value: Number(developmentFixture.observation.value),
    rawValue: developmentFixture.observation.rawValue,
    status: developmentFixture.observation.status,
    dimensionValueIds: [developmentFixture.dimensionValue.id],
    sourceUpdatedAt: developmentFixture.observation.sourceUpdatedAt,
    sourcePublishedAt: developmentFixture.observation.sourcePublishedAt,
    createdAt: sourceTimestamp,
    updatedAt: sourceTimestamp,
  },
];

function applyWindow<T>(
  items: readonly T[],
  options?: CatalogueListOptions | DatasetListOptions,
) {
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? items.length;
  return items.slice(offset, offset + limit);
}

function includesQuery(value: string | null | undefined, query: string) {
  return value?.toLowerCase().includes(query.toLowerCase()) ?? false;
}

export function createMockDataProvider(): DataProvider {
  return {
    categories: {
      async listCategories(options = {}) {
        const sorted = [...categories].sort((left, right) =>
          options.sortDirection === "desc"
            ? right.displayOrder - left.displayOrder
            : left.displayOrder - right.displayOrder,
        );

        return applyWindow(sorted, options);
      },
      async getCategoryBySlug(slug: string) {
        return categories.find((entry) => entry.slug === slug) ?? null;
      },
    },
    themes: {
      async listThemes(options = {}) {
        const selected = options.categorySlug
          ? themes.filter((entry) => entry.categoryId === categories[0].id)
          : themes;

        return applyWindow(
          selected.map((entry) => ({
            ...entry,
            categoryName: categories[0].name,
            categorySlug: categories[0].slug,
          })),
          options,
        );
      },
      async getThemeBySlug(slug: string) {
        return slug === themeCatalogueItem.slug ? themeCatalogueItem : null;
      },
    },
    datasets: {
      async listDatasets(options = {}) {
        const query = options.query?.trim();
        const matches = query
          ? [datasetCatalogueItem].filter((entry) =>
              [
                entry.title,
                entry.description,
                entry.sourceOrganization,
                entry.categoryName,
                entry.themeName,
              ].some((field) => includesQuery(field, query)),
            )
          : [datasetCatalogueItem];

        return applyWindow(matches, options);
      },
      async getDatasetBySlug(slug: string) {
        if (slug !== dataset.slug) {
          return null;
        }

        return {
          ...datasetCatalogueItem,
          metadata: {
            id: developmentFixture.metadata.id,
            datasetId: dataset.id,
            unit: developmentFixture.metadata.unit,
            frequency: developmentFixture.metadata.frequency,
            methodology: developmentFixture.metadata.methodology,
            coverage: developmentFixture.metadata.coverage,
            limitations: developmentFixture.metadata.limitations,
            contact: null,
            language: developmentFixture.metadata.language,
            additional: developmentFixture.metadata.additional,
            sourceUpdatedAt: developmentFixture.metadata.sourceUpdatedAt,
            sourcePublishedAt: developmentFixture.metadata.sourcePublishedAt,
            createdAt: sourceTimestamp,
            updatedAt: sourceTimestamp,
          },
          dimensions: [
            {
              id: developmentFixture.dimension.id,
              datasetId: dataset.id,
              sourceId: developmentFixture.dimension.sourceId,
              key: developmentFixture.dimension.key,
              label: developmentFixture.dimension.label,
              kind: developmentFixture.dimension.kind,
              position: developmentFixture.dimension.position,
              isRequired: developmentFixture.dimension.isRequired,
              sourceUpdatedAt: developmentFixture.dimension.sourceUpdatedAt,
              sourcePublishedAt: developmentFixture.dimension.sourcePublishedAt,
              createdAt: sourceTimestamp,
              updatedAt: sourceTimestamp,
            },
          ],
          sampleObservations: observations,
        } satisfies DatasetDetail;
      },
    },
    observations: {
      async listObservationsByDatasetId() {
        return observations;
      },
      async countObservationsByDatasetId() {
        return observations.length;
      },
    },
    search: {
      async searchCatalog(query: string) {
        const normalizedQuery = query.trim();
        if (!normalizedQuery) {
          return {
            categories,
            themes: [themeCatalogueItem],
            datasets: [datasetCatalogueItem],
          } satisfies CatalogueSearchResults;
        }

        const matchingCategories = categories.filter((entry) =>
          [entry.name, entry.slug].some((field) =>
            includesQuery(field, normalizedQuery),
          ),
        );
        const matchingThemes = [themeCatalogueItem].filter((entry) =>
          [entry.name, entry.slug, entry.categoryName].some((field) =>
            includesQuery(field, normalizedQuery),
          ),
        );
        const matchingDatasets = [datasetCatalogueItem].filter((entry) =>
          [
            entry.title,
            entry.description,
            entry.sourceOrganization,
            entry.categoryName,
            entry.themeName,
          ].some((field) => includesQuery(field, normalizedQuery)),
        );

        return {
          categories: matchingCategories,
          themes: matchingThemes,
          datasets: matchingDatasets,
        } satisfies CatalogueSearchResults;
      },
    },
    statistics: {
      async getStatistics() {
        const statistics: CatalogueStatistics = {
          categories: categories.length,
          themes: themes.length,
          datasets: 1,
          observations: observations.length,
          activeDatasets: 1,
          publishedDatasets: 0,
        };

        return statistics;
      },
    },
  };
}
