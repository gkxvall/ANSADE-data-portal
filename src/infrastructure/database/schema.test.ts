import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { developmentFixture } from "../../../prisma/fixtures/development";

const schema = readFileSync(
  path.resolve(process.cwd(), "prisma/schema.prisma"),
  "utf8",
);
const migration = readFileSync(
  path.resolve(
    process.cwd(),
    "prisma/migrations/20260722133000_stage_02_domain_model/migration.sql",
  ),
  "utf8",
);

const requiredModels = [
  "Category",
  "Theme",
  "Dataset",
  "DatasetMetadata",
  "Dimension",
  "DimensionValue",
  "Observation",
  "ObservationDimensionValue",
  "SourceReference",
  "ImportRun",
  "ImportIssue",
  "DatasetRevision",
] as const;

describe("Stage 2 database schema", () => {
  it.each(requiredModels)("defines the %s model", (model) => {
    expect(schema).toContain(`model ${model} {`);
  });

  it("preserves source identity and timestamps on catalogue entities", () => {
    expect(schema).toContain("sourceSystem");
    expect(schema).toContain("sourceId");
    expect(schema).toContain("sourceUpdatedAt");
    expect(schema).toContain("sourcePublishedAt");
    expect(schema).toContain("datasets_source_identity_key");
  });

  it("prevents duplicate observation coordinates", () => {
    expect(schema).toContain("observations_dataset_coordinate_hash_key");
    expect(migration).toContain(
      'CONSTRAINT "observations_coordinate_hash_format"',
    );
  });

  it("enforces a single correctly typed source-reference target", () => {
    expect(migration).toContain('CONSTRAINT "source_references_one_entity"');
    expect(migration).toContain(
      'CONSTRAINT "source_references_entity_type_matches"',
    );
  });

  it("enforces non-negative import counters and positive revisions", () => {
    expect(migration).toContain('CONSTRAINT "import_runs_counts_nonnegative"');
    expect(migration).toContain(
      'CONSTRAINT "dataset_revisions_revision_positive"',
    );
  });

  it("labels all seeded records as development fixtures", () => {
    expect(developmentFixture.marker).toBe("DEVELOPMENT_FIXTURE_ONLY");
    expect(developmentFixture.sourceSystem).toBe("development-fixture");
    expect(developmentFixture.dataset.title).toMatch(/^\[DEV]/);
    expect(developmentFixture.dataset.description).toContain(
      "Fixture technique locale",
    );
    expect(developmentFixture.observation.status).toBe("DEVELOPMENT_FIXTURE");
  });
});
