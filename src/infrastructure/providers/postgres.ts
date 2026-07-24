import "server-only";

import { Prisma, PrismaClient } from "@prisma/client";

import type {
  Category,
  DatasetMetadata,
  Dimension,
  Observation,
} from "@/domain/entities";
import type {
  DatasetCatalogueItem,
  DatasetDetail,
  DatasetListOptions,
  ThemeCatalogueItem,
} from "@/domain/repositories";
import type { CatalogueSearchResults } from "@/domain/repositories/search";
import type { CatalogueStatistics } from "@/domain/repositories/statistics";

import type { DataProvider } from "./types";

type DatasetWithCatalogueRelations = Prisma.DatasetGetPayload<{
  include: {
    theme: {
      include: {
        category: true;
      };
    };
    _count: {
      select: {
        observations: true;
      };
    };
  };
}>;

type DatasetWithDetailRelations = Prisma.DatasetGetPayload<{
  include: {
    theme: {
      include: {
        category: true;
      };
    };
    metadata: true;
    dimensions: true;
    observations: {
      take: 3;
      orderBy: {
        createdAt: "desc";
      };
      include: {
        dimensionValues: {
          include: {
            dimensionValue: true;
          };
        };
      };
    };
    _count: {
      select: {
        observations: true;
      };
    };
  };
}>;

type ObservationWithDimensionValues = Prisma.ObservationGetPayload<{
  include: {
    dimensionValues: {
      include: {
        dimensionValue: true;
      };
    };
  };
}>;

type ThemeWithCategory = Prisma.ThemeGetPayload<{
  include: {
    category: true;
  };
}>;

function toCategory(record: Category): Category {
  return record;
}

function toThemeCatalogueItem(record: ThemeWithCategory): ThemeCatalogueItem {
  return {
    id: record.id,
    categoryId: record.categoryId,
    sourceSystem: record.sourceSystem,
    sourceId: record.sourceId,
    name: record.name,
    slug: record.slug,
    displayOrder: record.displayOrder,
    isActive: record.isActive,
    sourceUpdatedAt: record.sourceUpdatedAt,
    sourcePublishedAt: record.sourcePublishedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    categoryName: record.category.name,
    categorySlug: record.category.slug,
  };
}

function toDatasetCatalogueItem(
  record: DatasetWithCatalogueRelations,
): DatasetCatalogueItem {
  return {
    id: record.id,
    themeId: record.themeId,
    sourceSystem: record.sourceSystem,
    sourceId: record.sourceId,
    title: record.title,
    slug: record.slug,
    description: record.description,
    sourceOrganization: record.sourceOrganization,
    publicationStatus: record.publicationStatus,
    isActive: record.isActive,
    checksum: record.checksum,
    sourceUpdatedAt: record.sourceUpdatedAt,
    sourcePublishedAt: record.sourcePublishedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    categoryName: record.theme.category.name,
    categorySlug: record.theme.category.slug,
    themeName: record.theme.name,
    themeSlug: record.theme.slug,
    observationCount: record._count.observations,
  };
}

function toObservation(record: ObservationWithDimensionValues): Observation {
  return {
    id: record.id,
    datasetId: record.datasetId,
    sourceId: record.sourceId,
    coordinate: record.coordinate as Record<string, string>,
    coordinateHash: record.coordinateHash,
    value: record.value === null ? null : Number(record.value),
    rawValue: record.rawValue,
    status: record.status,
    dimensionValueIds: record.dimensionValues.map(
      (entry) => entry.dimensionValueId,
    ),
    sourceUpdatedAt: record.sourceUpdatedAt,
    sourcePublishedAt: record.sourcePublishedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toMetadata(record: unknown): DatasetMetadata | null {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return null;
  }

  const values = record as Record<string, unknown>;
  const additional = values.additional;
  return {
    id: String(values.id),
    datasetId: String(values.datasetId),
    unit: typeof values.unit === "string" ? values.unit : null,
    frequency: typeof values.frequency === "string" ? values.frequency : null,
    methodology:
      typeof values.methodology === "string" ? values.methodology : null,
    coverage: typeof values.coverage === "string" ? values.coverage : null,
    limitations:
      typeof values.limitations === "string" ? values.limitations : null,
    contact: typeof values.contact === "string" ? values.contact : null,
    language: typeof values.language === "string" ? values.language : "fr",
    additional:
      additional && typeof additional === "object" && !Array.isArray(additional)
        ? (additional as Readonly<Record<string, unknown>>)
        : null,
    sourceUpdatedAt:
      values.sourceUpdatedAt instanceof Date ? values.sourceUpdatedAt : null,
    sourcePublishedAt:
      values.sourcePublishedAt instanceof Date
        ? values.sourcePublishedAt
        : null,
    createdAt: values.createdAt instanceof Date ? values.createdAt : new Date(),
    updatedAt: values.updatedAt instanceof Date ? values.updatedAt : new Date(),
  };
}

function toDimension(record: Dimension): Dimension {
  return record;
}

function toDatasetDetail(record: DatasetWithDetailRelations): DatasetDetail {
  return {
    ...toDatasetCatalogueItem(record),
    metadata: record.metadata ? toMetadata(record.metadata) : null,
    dimensions: record.dimensions.map((dimension) => toDimension(dimension)),
    sampleObservations: record.observations.map((observation) =>
      toObservation(observation),
    ),
  };
}

function buildDatasetWhere(
  options?: DatasetListOptions,
): Prisma.DatasetWhereInput {
  const query = options?.query?.trim();

  return {
    theme: {
      slug: options?.themeSlug,
      category: options?.categorySlug
        ? { slug: options.categorySlug }
        : undefined,
    },
    OR: query
      ? [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { sourceOrganization: { contains: query, mode: "insensitive" } },
          {
            metadata: {
              is: {
                unit: { contains: query, mode: "insensitive" },
              },
            },
          },
          {
            metadata: {
              is: {
                frequency: { contains: query, mode: "insensitive" },
              },
            },
          },
          {
            metadata: {
              is: {
                methodology: { contains: query, mode: "insensitive" },
              },
            },
          },
          {
            metadata: {
              is: {
                coverage: { contains: query, mode: "insensitive" },
              },
            },
          },
          {
            metadata: {
              is: {
                limitations: { contains: query, mode: "insensitive" },
              },
            },
          },
          {
            theme: {
              name: { contains: query, mode: "insensitive" },
            },
          },
          {
            theme: {
              category: {
                name: { contains: query, mode: "insensitive" },
              },
            },
          },
        ]
      : undefined,
  } satisfies Prisma.DatasetWhereInput;
}

function orderByClause(
  sortBy?: DatasetListOptions["sortBy"],
  sortDirection: "asc" | "desc" = "asc",
) {
  const direction = sortDirection;

  switch (sortBy) {
    case "updatedAt":
      return { updatedAt: direction };
    case "publishedAt":
      return { sourcePublishedAt: direction };
    case "title":
    default:
      return { title: direction };
  }
}

async function listDatasets(
  prisma: PrismaClient,
  options?: DatasetListOptions,
): Promise<readonly DatasetCatalogueItem[]> {
  const datasets = await prisma.dataset.findMany({
    where: buildDatasetWhere(options),
    include: {
      theme: {
        include: {
          category: true,
        },
      },
      _count: {
        select: {
          observations: true,
        },
      },
    },
    orderBy: orderByClause(options?.sortBy, options?.sortDirection),
    skip: options?.offset,
    take: options?.limit,
  });

  return datasets.map((record) => toDatasetCatalogueItem(record));
}

export function createPostgresDataProvider(prisma: PrismaClient): DataProvider {
  return {
    categories: {
      async listCategories(options = {}) {
        const categories = await prisma.category.findMany({
          orderBy: [
            options.sortBy === "name"
              ? { name: options.sortDirection ?? "asc" }
              : { displayOrder: options.sortDirection ?? "asc" },
            { name: "asc" },
          ],
          skip: options.offset,
          take: options.limit,
        });

        return categories.map((category) => toCategory(category));
      },
      async getCategoryBySlug(slug: string) {
        const category = await prisma.category.findFirst({
          where: { slug },
        });

        return category ? toCategory(category) : null;
      },
    },
    themes: {
      async listThemes(options = {}) {
        const themes = await prisma.theme.findMany({
          where: options.categorySlug
            ? { category: { slug: options.categorySlug } }
            : undefined,
          include: {
            category: true,
          },
          orderBy: [
            { displayOrder: options.sortDirection ?? "asc" },
            { name: "asc" },
          ],
          skip: options.offset,
          take: options.limit,
        });

        return themes.map((theme) => toThemeCatalogueItem(theme));
      },
      async getThemeBySlug(slug: string) {
        const theme = await prisma.theme.findFirst({
          where: { slug },
          include: { category: true },
        });

        return theme ? toThemeCatalogueItem(theme) : null;
      },
    },
    datasets: {
      async listDatasets(options = {}) {
        return listDatasets(prisma, options);
      },
      async getDatasetBySlug(slug: string) {
        const dataset = await prisma.dataset.findFirst({
          where: { slug },
          include: {
            theme: {
              include: {
                category: true,
              },
            },
            metadata: true,
            dimensions: true,
            observations: {
              take: 3,
              orderBy: {
                createdAt: "desc",
              },
              include: {
                dimensionValues: {
                  include: {
                    dimensionValue: true,
                  },
                },
              },
            },
            _count: {
              select: {
                observations: true,
              },
            },
          },
        });

        return dataset ? toDatasetDetail(dataset) : null;
      },
    },
    observations: {
      async listObservationsByDatasetId(datasetId: string, options = {}) {
        const observations = await prisma.observation.findMany({
          where: { datasetId },
          include: {
            dimensionValues: {
              include: {
                dimensionValue: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: options.offset,
          take: options.limit,
        });

        return observations.map((observation) => toObservation(observation));
      },
      async countObservationsByDatasetId(datasetId: string) {
        return prisma.observation.count({ where: { datasetId } });
      },
    },
    search: {
      async searchCatalog(query: string, options = {}) {
        const normalizedQuery = query.trim();

        if (!normalizedQuery) {
          return {
            categories: await prisma.category.findMany({
              orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
              skip: options.offset,
              take: options.limit,
            }),
            themes: await prisma.theme
              .findMany({
                include: { category: true },
                orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
                skip: options.offset,
                take: options.limit,
              })
              .then((themes) =>
                themes.map((theme) => toThemeCatalogueItem(theme)),
              ),
            datasets: await listDatasets(prisma, options),
          } satisfies CatalogueSearchResults;
        }

        const [categories, themes, datasets] = await Promise.all([
          prisma.category.findMany({
            where: {
              OR: [
                { name: { contains: normalizedQuery, mode: "insensitive" } },
                { slug: { contains: normalizedQuery, mode: "insensitive" } },
              ],
            },
            orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
          }),
          prisma.theme
            .findMany({
              where: {
                OR: [
                  { name: { contains: normalizedQuery, mode: "insensitive" } },
                  { slug: { contains: normalizedQuery, mode: "insensitive" } },
                  {
                    category: {
                      is: {
                        name: {
                          contains: normalizedQuery,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                ],
              },
              include: { category: true },
              orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
            })
            .then((themes) =>
              themes.map((theme) => toThemeCatalogueItem(theme)),
            ),
          listDatasets(prisma, {
            ...options,
            query: normalizedQuery,
          }),
        ]);

        return {
          categories,
          themes,
          datasets,
        } satisfies CatalogueSearchResults;
      },
    },
    statistics: {
      async getStatistics() {
        const [
          categories,
          themes,
          datasets,
          observations,
          activeDatasets,
          publishedDatasets,
        ] = await Promise.all([
          prisma.category.count(),
          prisma.theme.count(),
          prisma.dataset.count(),
          prisma.observation.count(),
          prisma.dataset.count({ where: { isActive: true } }),
          prisma.dataset.count({ where: { publicationStatus: "PUBLISHED" } }),
        ]);

        const statistics: CatalogueStatistics = {
          categories,
          themes,
          datasets,
          observations,
          activeDatasets,
          publishedDatasets,
        };

        return statistics;
      },
    },
  };
}
