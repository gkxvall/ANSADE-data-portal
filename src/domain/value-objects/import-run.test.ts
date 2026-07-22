import { describe, expect, it } from "vitest";

import { importRunSchema } from "./import-run";

const baseRun = {
  id: "00000000-0000-4000-8000-000000000009",
  sourceSystem: "development-fixture",
  status: "SUCCEEDED" as const,
  strictMode: false,
  startedAt: new Date("2026-01-01T00:00:00.000Z"),
  finishedAt: new Date("2026-01-02T00:00:00.000Z"),
  categoriesSeen: 1,
  themesSeen: 1,
  datasetsSeen: 1,
  observationsSeen: 1,
  recordsCreated: 4,
  recordsUpdated: 0,
  recordsFailed: 0,
  sourceChecksum: "a".repeat(64),
  summary: { fixture: true },
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
};

describe("importRunSchema", () => {
  it("accepts a completed import with non-negative counters", () => {
    expect(importRunSchema.parse(baseRun).status).toBe("SUCCEEDED");
  });

  it("rejects negative counters", () => {
    expect(() =>
      importRunSchema.parse({ ...baseRun, recordsFailed: -1 }),
    ).toThrow();
  });

  it("requires finished imports to carry a finish timestamp", () => {
    expect(() =>
      importRunSchema.parse({ ...baseRun, finishedAt: null }),
    ).toThrow();
  });

  it("rejects finish timestamps before the start", () => {
    expect(() =>
      importRunSchema.parse({
        ...baseRun,
        finishedAt: new Date("2025-12-31T00:00:00.000Z"),
      }),
    ).toThrow();
  });
});
