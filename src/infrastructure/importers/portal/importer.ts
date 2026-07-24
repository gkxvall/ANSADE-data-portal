import { Prisma, PrismaClient } from "@prisma/client";
import { chromium, type Page } from "@playwright/test";

import { sha256Checksum, stableUuid } from "../stage-3/checksum";

const SOURCE_SYSTEM = "ansade-portal";
const DEFAULT_BASE_URL = "https://portail.ansade.mr";

interface PortalImportOptions {
  readonly baseUrl?: string;
  readonly cookie?: string | null;
  readonly authorization?: string | null;
}

interface CardSummary {
  readonly index: number;
  readonly title: string;
  readonly description: string | null;
}

interface ScrapedCategory {
  readonly sourceId: string;
  readonly sourceUrl: string;
  readonly name: string;
  readonly displayOrder: number;
  readonly themes: readonly ScrapedTheme[];
}

interface ScrapedTheme {
  readonly sourceId: string;
  readonly sourceUrl: string;
  readonly name: string;
  readonly description: string | null;
  readonly displayOrder: number;
  readonly categorySourceId: string;
  readonly categoryName: string;
  readonly datasets: readonly ScrapedDataset[];
}

interface ScrapedDataset {
  readonly sourceId: string;
  readonly sourceUrl: string;
  readonly name: string;
  readonly description: string | null;
  readonly displayOrder: number;
  readonly categorySourceId: string;
  readonly categoryName: string;
  readonly themeSourceId: string;
  readonly themeName: string;
  readonly sourceOrganization: string | null;
  readonly sourceNote: string | null;
  readonly sourceLegend: string | null;
  readonly columns: readonly string[];
  readonly rows: readonly ScrapedRow[];
}

interface ScrapedRow {
  readonly path: readonly string[];
  readonly values: readonly string[];
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/[\s\u00a0\u202f]+/g, " ").trim();
}

function parseNumber(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  const cleaned = value
    .replace(/[\s\u00a0\u202f]/g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9+\-.]/g, "");

  if (cleaned.length === 0) {
    return null;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractLastSegment(url: string): string {
  return new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? url;
}

async function collectCards(page: Page): Promise<readonly CardSummary[]> {
  return page.locator("main button:has(h2)").evaluateAll((buttons) =>
    buttons
      .map((button, index) => {
        const title = button.querySelector("h2")?.textContent ?? "";
        const description = button.querySelector("p")?.textContent ?? null;

        return {
          index,
          title: title.replace(/\s+/g, " ").trim(),
          description: description?.replace(/\s+/g, " ").trim() ?? null,
        };
      })
      .filter((card) => card.title.length > 0),
  );
}

async function clickCardAndWait(page: Page, index: number, route: RegExp) {
  await Promise.all([
    page.waitForURL(route),
    page.locator("main button:has(h2)").nth(index).click(),
  ]);
}

async function scrapeDatasetPage(
  page: Page,
  context: {
    readonly categorySourceId: string;
    readonly categoryName: string;
    readonly themeSourceId: string;
    readonly themeName: string;
    readonly displayOrder: number;
  },
): Promise<ScrapedDataset> {
  const sourceUrl = page.url();
  const sourceId = extractLastSegment(sourceUrl);
  const name = normalizeText(await page.locator("h1").textContent());

  const paragraphs = await page.locator("main p").evaluateAll((nodes) =>
    nodes
      .map((node) => node.textContent?.replace(/\s+/g, " ").trim() ?? "")
      .filter((value) => value.length > 0),
  );

  const sourceNote = paragraphs.find((value) => value.includes("Source :")) ?? null;
  const sourceLegend =
    paragraphs.find((value) => value.includes("colonnes colorées")) ?? null;

  const tableData = await page.locator("main table").evaluate((table) => {
    const normalize = (value: string | null | undefined) =>
      (value ?? "").replace(/\s+/g, " ").trim();

    const headers = Array.from(table.querySelectorAll("thead th"))
      .slice(1)
      .map((cell) => normalize(cell.textContent));

    const rows: Array<{ path: string[]; values: string[] }> = [];
    let currentGroup: string | null = null;

    for (const row of Array.from(table.querySelectorAll("tbody tr"))) {
      const cells = Array.from(row.querySelectorAll("td"));
      if (cells.length === 0) {
        continue;
      }

      const label = normalize(cells[0]?.textContent);
      if (!label) {
        continue;
      }

      const className = cells[0]?.className ?? "";
      const isGroupRow =
        className.includes("bg-slate-50") && className.includes("font-semibold");

      if (isGroupRow || currentGroup === null) {
        currentGroup = label;
      }

      rows.push({
        path:
          currentGroup === label || !currentGroup ? [label] : [currentGroup, label],
        values: cells.slice(1).map((cell) => normalize(cell.textContent)),
      });
    }

    return { headers, rows };
  });

  return {
    sourceId,
    sourceUrl,
    name,
    description: null,
    displayOrder: context.displayOrder,
    categorySourceId: context.categorySourceId,
    categoryName: context.categoryName,
    themeSourceId: context.themeSourceId,
    themeName: context.themeName,
    sourceOrganization: "ANSADE",
    sourceNote,
    sourceLegend,
    columns: tableData.headers,
    rows: tableData.rows,
  };
}

async function scrapePortalData(options: PortalImportOptions): Promise<readonly ScrapedCategory[]> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    extraHTTPHeaders: {
      ...(options.cookie ? { cookie: options.cookie } : {}),
      ...(options.authorization ? { authorization: options.authorization } : {}),
    },
  });
  const page = await context.newPage();

  try {
    const categoriesUrl = new URL("/categories", baseUrl).toString();
    await page.goto(categoriesUrl, { waitUntil: "networkidle" });

    const categoryCards = await collectCards(page);
    const categories: ScrapedCategory[] = [];

    for (const categoryCard of categoryCards) {
      await clickCardAndWait(page, categoryCard.index, /\/categories\/[^/]+$/);
      const categoryUrl = page.url();
      const categorySourceId = extractLastSegment(categoryUrl);
      const categoryName = normalizeText(await page.locator("h1").textContent()) || categoryCard.title;

      const themeCards = await collectCards(page);
      const themes: ScrapedTheme[] = [];

      for (const themeCard of themeCards) {
        await clickCardAndWait(page, themeCard.index, /\/themes\/[^/]+$/);
        const themeUrl = page.url();
        const themeSourceId = extractLastSegment(themeUrl);
        const themeName = normalizeText(await page.locator("h1").textContent()) || themeCard.title;

        const datasetCards = await collectCards(page);
        const datasets: ScrapedDataset[] = [];

        for (const datasetCard of datasetCards) {
          await clickCardAndWait(page, datasetCard.index, /\/tableaux\/[^/]+$/);

          datasets.push(
            await scrapeDatasetPage(page, {
              categorySourceId,
              categoryName,
              themeSourceId,
              themeName,
              displayOrder: datasetCard.index,
            }),
          );

          await page.goto(themeUrl, { waitUntil: "networkidle" });
        }

        themes.push({
          sourceId: themeSourceId,
          sourceUrl: themeUrl,
          name: themeName,
          description: themeCard.description,
          displayOrder: themeCard.index,
          categorySourceId,
          categoryName,
          datasets,
        });

        await page.goto(categoryUrl, { waitUntil: "networkidle" });
      }

      categories.push({
        sourceId: categorySourceId,
        sourceUrl: categoryUrl,
        name: categoryName,
        displayOrder: categoryCard.index,
        themes,
      });

      await page.goto(categoriesUrl, { waitUntil: "networkidle" });
    }

    return categories;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

async function resetPortalSource(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction([
    prisma.observation.deleteMany({ where: { dataset: { sourceSystem: SOURCE_SYSTEM } } }),
    prisma.dimensionValue.deleteMany({ where: { dimension: { dataset: { sourceSystem: SOURCE_SYSTEM } } } }),
    prisma.dimension.deleteMany({ where: { dataset: { sourceSystem: SOURCE_SYSTEM } } }),
    prisma.datasetMetadata.deleteMany({ where: { dataset: { sourceSystem: SOURCE_SYSTEM } } }),
    prisma.dataset.deleteMany({ where: { sourceSystem: SOURCE_SYSTEM } }),
    prisma.theme.deleteMany({ where: { sourceSystem: SOURCE_SYSTEM } }),
    prisma.category.deleteMany({ where: { sourceSystem: SOURCE_SYSTEM } }),
    prisma.importRun.deleteMany({ where: { sourceSystem: SOURCE_SYSTEM } }),
  ]);
}

function countScrapedRows(categories: readonly ScrapedCategory[]): {
  categories: number;
  themes: number;
  datasets: number;
  observations: number;
  dimensionValues: number;
  links: number;
} {
  let themes = 0;
  let datasets = 0;
  let observations = 0;
  let dimensionValues = 0;

  for (const category of categories) {
    themes += category.themes.length;
    for (const theme of category.themes) {
      datasets += theme.datasets.length;
      for (const dataset of theme.datasets) {
        observations += dataset.rows.length * dataset.columns.length;
        const seriesCount = new Set(dataset.rows.map((row) => row.path.join(" / "))).size;
        dimensionValues += dataset.columns.length + seriesCount;
      }
    }
  }

  return {
    categories: categories.length,
    themes,
    datasets,
    observations,
    dimensionValues,
    links: observations * 2,
  };
}

export async function importPortalData(options: PortalImportOptions = {}) {
  const prisma = new PrismaClient();
  const startedAt = new Date();

  try {
    const categories = await scrapePortalData(options);
    const counts = countScrapedRows(categories);
    const sourceChecksum = sha256Checksum(categories);
    const importRunId = stableUuid([
      SOURCE_SYSTEM,
      "IMPORT_RUN",
      sourceChecksum,
      startedAt.toISOString(),
    ]);

    await resetPortalSource(prisma);

    const importRun = await prisma.importRun.create({
      data: {
        id: importRunId,
        sourceSystem: SOURCE_SYSTEM,
        status: "RUNNING",
        strictMode: false,
        startedAt,
        finishedAt: null,
        categoriesSeen: counts.categories,
        themesSeen: counts.themes,
        datasetsSeen: counts.datasets,
        observationsSeen: counts.observations,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        sourceChecksum,
        summary: Prisma.JsonNull,
      },
    });

    for (const category of categories) {
      const categoryId = stableUuid([SOURCE_SYSTEM, "CATEGORY", category.sourceId]);
      await prisma.category.upsert({
        where: { sourceSystem_sourceId: { sourceSystem: SOURCE_SYSTEM, sourceId: category.sourceId } },
        create: {
          id: categoryId,
          sourceSystem: SOURCE_SYSTEM,
          sourceId: category.sourceId,
          name: category.name,
          slug: category.sourceId,
          displayOrder: category.displayOrder,
          isActive: true,
          sourceUpdatedAt: null,
          sourcePublishedAt: null,
        },
        update: {
          name: category.name,
          slug: category.sourceId,
          displayOrder: category.displayOrder,
          isActive: true,
        },
      });
      for (const theme of category.themes) {
        const themeId = stableUuid([SOURCE_SYSTEM, "THEME", theme.sourceId]);
        await prisma.theme.upsert({
          where: { sourceSystem_sourceId: { sourceSystem: SOURCE_SYSTEM, sourceId: theme.sourceId } },
          create: {
            id: themeId,
            categoryId,
            sourceSystem: SOURCE_SYSTEM,
            sourceId: theme.sourceId,
            name: theme.name,
            slug: theme.sourceId,
            displayOrder: theme.displayOrder,
            isActive: true,
            sourceUpdatedAt: null,
            sourcePublishedAt: null,
          },
          update: {
            categoryId,
            name: theme.name,
            slug: theme.sourceId,
            displayOrder: theme.displayOrder,
            isActive: true,
          },
        });
        for (const dataset of theme.datasets) {
          const datasetId = stableUuid([SOURCE_SYSTEM, "DATASET", dataset.sourceId]);
          const metadataId = stableUuid([SOURCE_SYSTEM, "DATASET_METADATA", dataset.sourceId]);
          const datasetChecksum = sha256Checksum({
            sourceId: dataset.sourceId,
            sourceUrl: dataset.sourceUrl,
            name: dataset.name,
            columns: dataset.columns,
            rows: dataset.rows,
            sourceNote: dataset.sourceNote,
            sourceLegend: dataset.sourceLegend,
          });

          await prisma.$transaction(async (transaction) => {
            await transaction.dataset.upsert({
              where: {
                sourceSystem_sourceId: {
                  sourceSystem: SOURCE_SYSTEM,
                  sourceId: dataset.sourceId,
                },
              },
              create: {
                id: datasetId,
                themeId,
                sourceSystem: SOURCE_SYSTEM,
                sourceId: dataset.sourceId,
                title: dataset.name,
                slug: dataset.sourceId,
                description: dataset.description,
                sourceOrganization: dataset.sourceOrganization,
                publicationStatus: "PUBLISHED",
                isActive: true,
                checksum: datasetChecksum,
                sourceUpdatedAt: null,
                sourcePublishedAt: null,
              },
              update: {
                themeId,
                title: dataset.name,
                slug: dataset.sourceId,
                description: dataset.description,
                sourceOrganization: dataset.sourceOrganization,
                publicationStatus: "PUBLISHED",
                isActive: true,
                checksum: datasetChecksum,
              },
            });

            await transaction.datasetMetadata.upsert({
              where: { datasetId },
              create: {
                id: metadataId,
                datasetId,
                unit: null,
                frequency: null,
                methodology: null,
                coverage: null,
                limitations: null,
                contact: null,
                language: "fr",
                additional: {
                  sourceUrl: dataset.sourceUrl,
                  sourceNote: dataset.sourceNote,
                  sourceLegend: dataset.sourceLegend,
                  columns: dataset.columns,
                  rowCount: dataset.rows.length,
                },
                sourceUpdatedAt: null,
                sourcePublishedAt: null,
              },
              update: {
                unit: null,
                frequency: null,
                methodology: null,
                coverage: null,
                limitations: null,
                contact: null,
                language: "fr",
                additional: {
                  sourceUrl: dataset.sourceUrl,
                  sourceNote: dataset.sourceNote,
                  sourceLegend: dataset.sourceLegend,
                  columns: dataset.columns,
                  rowCount: dataset.rows.length,
                },
              },
            });

            const yearDimensionId = stableUuid([
              SOURCE_SYSTEM,
              "DIMENSION",
              dataset.sourceId,
              "year",
            ]);
            const seriesDimensionId = stableUuid([
              SOURCE_SYSTEM,
              "DIMENSION",
              dataset.sourceId,
              "series",
            ]);

            await transaction.dimension.createMany({
              data: [
                {
                  id: yearDimensionId,
                  datasetId,
                  sourceId: "year",
                  key: "year",
                  label: "Année",
                  kind: "TIME",
                  position: 0,
                  isRequired: true,
                  sourceUpdatedAt: null,
                  sourcePublishedAt: null,
                },
                {
                  id: seriesDimensionId,
                  datasetId,
                  sourceId: "series",
                  key: "series",
                  label: "Série",
                  kind: "CATEGORY",
                  position: 1,
                  isRequired: true,
                  sourceUpdatedAt: null,
                  sourcePublishedAt: null,
                },
              ],
              skipDuplicates: true,
            });

            const yearDimensionValues = dataset.columns.map((column, index) => ({
              id: stableUuid([
                SOURCE_SYSTEM,
                "DIMENSION_VALUE",
                dataset.sourceId,
                "year",
                column,
              ]),
              dimensionId: yearDimensionId,
              sourceId: column,
              code: column,
              label: column,
              position: index,
              isActive: true,
              sourceUpdatedAt: null,
              sourcePublishedAt: null,
            }));

            const uniqueSeries = Array.from(
              new Map(dataset.rows.map((row) => [row.path.join(" / "), row])).entries(),
            ).map(([seriesCode, row], index) => ({
              id: stableUuid([
                SOURCE_SYSTEM,
                "DIMENSION_VALUE",
                dataset.sourceId,
                "series",
                seriesCode,
              ]),
              dimensionId: seriesDimensionId,
              sourceId: seriesCode,
              code: seriesCode,
              label: row.path.join(" / "),
              position: index,
              isActive: true,
              sourceUpdatedAt: null,
              sourcePublishedAt: null,
            }));

            await transaction.dimensionValue.createMany({
              data: [...yearDimensionValues, ...uniqueSeries],
              skipDuplicates: true,
            });

            const yearValueByCode = new Map(yearDimensionValues.map((value) => [value.code, value]));
            const seriesValueByCode = new Map(uniqueSeries.map((value) => [value.code, value]));

            const observationData: Prisma.ObservationCreateManyInput[] = [];
            const observationDimensionValueData: Prisma.ObservationDimensionValueCreateManyInput[] = [];

            for (const row of dataset.rows) {
              const seriesCode = row.path.join(" / ");
              const seriesValue = seriesValueByCode.get(seriesCode);
              if (!seriesValue) {
                continue;
              }

              for (let columnIndex = 0; columnIndex < dataset.columns.length; columnIndex += 1) {
                const year = dataset.columns[columnIndex] ?? `column-${columnIndex + 1}`;
                const yearValue = yearValueByCode.get(year);
                if (!yearValue) {
                  continue;
                }

                const rawValue = row.values[columnIndex] ?? null;
                const numericValue = parseNumber(rawValue);
                const coordinate = { year, series: seriesCode };
                const observationId = stableUuid([
                  SOURCE_SYSTEM,
                  "OBSERVATION",
                  dataset.sourceId,
                  seriesCode,
                  year,
                ]);

                observationData.push({
                  id: observationId,
                  datasetId,
                  sourceId: observationId,
                  coordinate,
                  coordinateHash: sha256Checksum(coordinate),
                  value: numericValue === null ? null : new Prisma.Decimal(numericValue),
                  rawValue,
                  status: null,
                  sourceUpdatedAt: null,
                  sourcePublishedAt: null,
                });

                observationDimensionValueData.push(
                  {
                    observationId,
                    dimensionId: yearDimensionId,
                    dimensionValueId: yearValue.id,
                  },
                  {
                    observationId,
                    dimensionId: seriesDimensionId,
                    dimensionValueId: seriesValue.id,
                  },
                );
              }
            }

            await transaction.observation.createMany({
              data: observationData,
              skipDuplicates: true,
            });

            await transaction.observationDimensionValue.createMany({
              data: observationDimensionValueData,
              skipDuplicates: true,
            });
          });

        }
      }
    }

    const recordsCreated =
      1 +
      counts.categories +
      counts.themes +
      counts.datasets +
      counts.datasets +
      counts.datasets * 2 +
      counts.dimensionValues +
      counts.observations +
      counts.links;

    await prisma.importRun.update({
      where: { id: importRun.id },
      data: {
        status: "SUCCEEDED",
        finishedAt: new Date(),
        recordsCreated,
        recordsUpdated: 0,
        recordsFailed: 0,
        summary: {
          sourceSystem: SOURCE_SYSTEM,
          sourceChecksum,
          categories: counts.categories,
          themes: counts.themes,
          datasets: counts.datasets,
          observations: counts.observations,
        },
      },
    });

    return {
      categories,
      importRun: await prisma.importRun.findUnique({ where: { id: importRun.id } }),
    };
  } finally {
    await prisma.$disconnect();
  }
}
