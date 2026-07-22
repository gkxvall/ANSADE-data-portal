import { describe, expect, it } from "vitest";

import { categorySchema, datasetSchema, dimensionSchema } from "./catalogue";

const timestamps = {
  sourceUpdatedAt: new Date("2026-01-02T00:00:00.000Z"),
  sourcePublishedAt: new Date("2026-01-01T00:00:00.000Z"),
  createdAt: new Date("2026-01-03T00:00:00.000Z"),
  updatedAt: new Date("2026-01-03T00:00:00.000Z"),
};

describe("catalogue entity validation", () => {
  it("accepts a source-tracked category", () => {
    expect(
      categorySchema.parse({
        id: "00000000-0000-4000-8000-000000000001",
        sourceSystem: "ansade",
        sourceId: "category-1",
        name: "Population",
        slug: "population",
        displayOrder: 0,
        isActive: true,
        ...timestamps,
      }).sourceId,
    ).toBe("category-1");
  });

  it("rejects datasets without a preserved source identity", () => {
    expect(() =>
      datasetSchema.parse({
        id: "00000000-0000-4000-8000-000000000003",
        themeId: "00000000-0000-4000-8000-000000000002",
        sourceSystem: "ansade",
        sourceId: "",
        title: "Dataset",
        slug: "dataset",
        description: null,
        sourceOrganization: null,
        publicationStatus: "PUBLISHED",
        isActive: true,
        checksum: null,
        ...timestamps,
      }),
    ).toThrow();
  });

  it("rejects negative dimension positions", () => {
    expect(() =>
      dimensionSchema.parse({
        id: "00000000-0000-4000-8000-000000000005",
        datasetId: "00000000-0000-4000-8000-000000000003",
        sourceId: "period",
        key: "period",
        label: "Période",
        kind: "TIME",
        position: -1,
        isRequired: true,
        ...timestamps,
      }),
    ).toThrow();
  });
});
