import { describe, expect, it } from "vitest";

import { normalizeStage3RawSource } from "./normalizer";
import { importStage3Source } from "./importer";
import { sampleStage3Source } from "./sample-source";

type TestRecord = Record<string, unknown>;
type RevisionRecord = TestRecord & { datasetId: string; revision: number; checksum: string };

interface TestDelegate {
  findUnique(args: { where: TestRecord }): Promise<TestRecord | null>;
  upsert(args: {
    where: TestRecord;
    create: TestRecord;
    update: TestRecord;
  }): Promise<TestRecord>;
}

function createRecordStore() {
  const store = new Map<string, TestRecord>();

  return {
    store,
    delegate(): TestDelegate {
      return {
        async findUnique(args: { where: TestRecord }) {
          return store.get(JSON.stringify(args.where)) ?? null;
        },
        async upsert(args: {
          where: TestRecord;
          create: TestRecord;
          update: TestRecord;
        }) {
          const key = JSON.stringify(args.where);
          const current = store.get(key) ?? null;
          const record = current ? { ...current, ...args.update } : { ...args.create };
          store.set(key, record);
          return record;
        },
      };
    },
  };
}

function createInMemoryStage3Database() {
  const categories = createRecordStore();
  const themes = createRecordStore();
  const datasets = createRecordStore();
  const datasetMetadata = createRecordStore();
  const dimensions = createRecordStore();
  const dimensionValues = createRecordStore();
  const observations = createRecordStore();
  const observationDimensionValues = createRecordStore();
  const sourceReferences = createRecordStore();
  const importIssues = createRecordStore();

  const importRuns = new Map<string, TestRecord>();
  const revisions: RevisionRecord[] = [];

  interface TestTransaction {
    category: TestDelegate;
    theme: TestDelegate;
    dataset: TestDelegate;
    datasetMetadata: TestDelegate;
    dimension: TestDelegate;
    dimensionValue: TestDelegate;
    observation: TestDelegate;
    observationDimensionValue: TestDelegate;
    sourceReference: TestDelegate;
    importIssue: TestDelegate;
    importRun: {
      create(args: { data: TestRecord }): Promise<TestRecord>;
      update(args: { where: { id: string }; data: TestRecord }): Promise<TestRecord>;
    };
    datasetRevision: {
      findFirst(args: { where: { datasetId: string } }): Promise<RevisionRecord | null>;
      create(args: { data: RevisionRecord }): Promise<RevisionRecord>;
    };
  }

  return {
    $transaction: async <T>(callback: (transaction: TestTransaction) => Promise<T>) =>
      callback({
        category: categories.delegate(),
        theme: themes.delegate(),
        dataset: datasets.delegate(),
        datasetMetadata: datasetMetadata.delegate(),
        dimension: dimensions.delegate(),
        dimensionValue: dimensionValues.delegate(),
        observation: observations.delegate(),
        observationDimensionValue: observationDimensionValues.delegate(),
        sourceReference: sourceReferences.delegate(),
        importIssue: importIssues.delegate(),
        importRun: {
          async create(args: { data: TestRecord }) {
            const id = String(args.data.id);
            importRuns.set(id, {
              ...args.data,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            return importRuns.get(id) as TestRecord;
          },
          async update(args: { where: { id: string }; data: TestRecord }) {
            const current = importRuns.get(args.where.id);
            const next = { ...current, ...args.data, updatedAt: new Date() };
            importRuns.set(args.where.id, next);
            return next;
          },
        },
        datasetRevision: {
          async findFirst(args: { where: { datasetId: string } }) {
            const latest = (revisions as RevisionRecord[])
              .filter((revision) => revision.datasetId === args.where.datasetId)
              .sort((left, right) => right.revision - left.revision)[0];
            return latest ?? null;
          },
          async create(args: { data: RevisionRecord }) {
            revisions.push(args.data);
            return args.data;
          },
        },
      }),
    snapshot() {
      return {
        importRuns: importRuns.size,
        categories: categories.store.size,
        themes: themes.store.size,
        datasets: datasets.store.size,
        metadata: datasetMetadata.store.size,
        dimensions: dimensions.store.size,
        dimensionValues: dimensionValues.store.size,
        observations: observations.store.size,
        observationDimensionValues: observationDimensionValues.store.size,
        sourceReferences: sourceReferences.store.size,
        issues: importIssues.store.size,
        revisions: revisions.length,
      };
    },
  };
}

describe("Stage 3 normalization", () => {
  it("flattens selectable source tables into normalized observations and joins", () => {
    const normalized = normalizeStage3RawSource(
      sampleStage3Source,
      new Date("2026-07-22T00:00:00.000Z"),
    );

    expect(normalized.categories).toHaveLength(2);
    expect(normalized.themes).toHaveLength(2);
    expect(normalized.datasets).toHaveLength(2);
    expect(normalized.observations).toHaveLength(3);
    expect(normalized.observationDimensionValues).toHaveLength(6);
    expect(normalized.issues).toHaveLength(1);
    expect(normalized.summary).toMatchObject({
      importedTables: 2,
      skippedTables: 1,
      importedObservations: 3,
      issues: 1,
    });
  });
});

describe("Stage 3 importer", () => {
  it("persists the same snapshot without creating duplicate domain records", async () => {
    const database = createInMemoryStage3Database();

    await importStage3Source(
      database,
      sampleStage3Source,
      { startedAt: new Date("2026-07-22T00:00:00.000Z") },
    );

    const firstSnapshot = database.snapshot();

    await importStage3Source(
      database,
      sampleStage3Source,
      { startedAt: new Date("2026-07-23T00:00:00.000Z") },
    );

    const secondSnapshot = database.snapshot();

    expect(firstSnapshot).toMatchObject({
      importRuns: 1,
      categories: 1,
      themes: 1,
      datasets: 2,
      dimensions: 4,
      dimensionValues: 7,
      observations: 3,
      observationDimensionValues: 6,
      sourceReferences: 17,
      issues: 1,
      revisions: 2,
    });

    expect(secondSnapshot).toMatchObject({
      importRuns: 2,
      categories: 1,
      themes: 1,
      datasets: 2,
      dimensions: 4,
      dimensionValues: 7,
      observations: 3,
      observationDimensionValues: 6,
      sourceReferences: 17,
      issues: 1,
      revisions: 2,
    });
  });
});