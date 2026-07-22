import { describe, expect, it } from "vitest";

import { observationSchema } from "./observation";

const validObservation = {
  id: "00000000-0000-4000-8000-000000000007",
  datasetId: "00000000-0000-4000-8000-000000000003",
  sourceId: "observation-7",
  coordinate: { period: "2025", geography: "national" },
  coordinateHash: "a".repeat(64),
  value: 12.5,
  rawValue: "12,5",
  status: null,
  dimensionValueIds: [
    "00000000-0000-4000-8000-000000000006",
    "00000000-0000-4000-8000-000000000007",
  ],
  sourceUpdatedAt: new Date("2026-01-01T00:00:00.000Z"),
  sourcePublishedAt: null,
  createdAt: new Date("2026-01-02T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
};

describe("observationSchema", () => {
  it("preserves numeric and raw representations together", () => {
    expect(observationSchema.parse(validObservation)).toMatchObject({
      value: 12.5,
      rawValue: "12,5",
    });
  });

  it("allows a missing numeric value when raw source content is preserved", () => {
    expect(
      observationSchema.parse({
        ...validObservation,
        value: null,
        rawValue: "…",
        status: "missing",
      }),
    ).toBeDefined();
  });

  it("rejects observations that preserve no value or status", () => {
    expect(() =>
      observationSchema.parse({
        ...validObservation,
        value: null,
        rawValue: null,
        status: null,
      }),
    ).toThrow();
  });

  it("rejects duplicate dimension-value identifiers", () => {
    expect(() =>
      observationSchema.parse({
        ...validObservation,
        dimensionValueIds: [
          validObservation.dimensionValueIds[0],
          validObservation.dimensionValueIds[0],
        ],
      }),
    ).toThrow();
  });
});
