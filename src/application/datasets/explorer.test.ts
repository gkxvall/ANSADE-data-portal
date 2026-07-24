import { describe, expect, it } from "vitest";

import { developmentFixture } from "../../../prisma/fixtures/development";

import {
  buildChartModel,
  buildExplorerState,
  filterObservations,
  serializeDatasetExplorerData,
} from "./explorer";

describe("dataset explorer helpers", () => {
  const dataset = {
    id: developmentFixture.dataset.id,
    title: developmentFixture.dataset.title,
    slug: developmentFixture.dataset.slug,
    description: developmentFixture.dataset.description,
    sourceOrganization: developmentFixture.dataset.sourceOrganization,
    publicationStatus: developmentFixture.dataset.publicationStatus,
    isActive: developmentFixture.dataset.isActive,
    checksum: developmentFixture.dataset.checksum,
    sourceUpdatedAt: developmentFixture.dataset.sourceUpdatedAt,
    sourcePublishedAt: developmentFixture.dataset.sourcePublishedAt,
    categoryName: developmentFixture.category.name,
    categorySlug: developmentFixture.category.slug,
    themeName: developmentFixture.theme.name,
    themeSlug: developmentFixture.theme.slug,
    observationCount: 1,
    dimensions: [developmentFixture.dimension],
    metadata: null,
    sampleObservations: [],
  } as const;

  const observations = [
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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ] as const;

  it("serializes dataset explorer data with dimension options", () => {
    const data = serializeDatasetExplorerData(
      dataset as never,
      observations as never,
      [],
    );

    expect(data.dimensions[0].values).toContain("dev-period");
    expect(data.dataset.title).toContain("démonstration");
  });

  it("filters observations by search text", () => {
    const state = buildExplorerState({ q: "dev-period" }, [
      { key: "period", label: "Période", kind: "TIME", values: ["dev-period"] },
    ]);
    const data = serializeDatasetExplorerData(
      dataset as never,
      observations as never,
      [],
    );

    expect(filterObservations(data.observations, state)).toHaveLength(1);
  });

  it("builds a kpi chart model", () => {
    const state = buildExplorerState({}, [
      { key: "period", label: "Période", kind: "TIME", values: ["dev-period"] },
    ]);
    const data = serializeDatasetExplorerData(
      dataset as never,
      observations as never,
      [],
    );

    expect(
      buildChartModel(data.observations, { ...state, chartType: "kpi" }),
    ).toMatchObject({
      available: true,
    });
  });
});
