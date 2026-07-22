import { describe, expect, it } from "vitest";

import {
  globalSourceIdentitySchema,
  sourceReferenceSchema,
} from "./source-identity";

describe("source identity validation", () => {
  it("preserves source identifiers and both source timestamps", () => {
    const identity = globalSourceIdentitySchema.parse({
      sourceSystem: "ansade",
      sourceId: "table-42",
      sourceUpdatedAt: new Date("2026-01-02T00:00:00.000Z"),
      sourcePublishedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(identity.sourceId).toBe("table-42");
    expect(identity.sourceUpdatedAt).toEqual(
      new Date("2026-01-02T00:00:00.000Z"),
    );
  });

  it("requires a source reference to identify its normalized entity", () => {
    expect(() =>
      sourceReferenceSchema.parse({
        sourceSystem: "ansade",
        sourceId: "table-42",
        sourceUpdatedAt: null,
        sourcePublishedAt: null,
        id: "00000000-0000-4000-8000-000000000001",
        entityType: "DATASET",
        sourceScope: "global",
        sourceUrl: null,
        checksum: null,
        retrievedAt: new Date(),
        metadata: null,
        createdAt: new Date(),
      }),
    ).toThrow();
  });
});
