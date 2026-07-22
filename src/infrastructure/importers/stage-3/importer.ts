import { Prisma } from "@prisma/client";

import { parseRawStage3Source } from "@/infrastructure/adapters/ansade-stage3";
import { prisma } from "@/infrastructure/database/prisma";

import { sha256Checksum, stableUuid } from "./checksum";
import { normalizeStage3RawSource } from "./normalizer";
import type {
  Stage3ImportOptions,
  Stage3ImportResult,
  Stage3NormalizedImport,
} from "./types";
import type { ImportRun } from "@/domain/entities";

interface Stage3Transaction {
  category: any;
  theme: any;
  dataset: any;
  datasetMetadata: any;
  dimension: any;
  dimensionValue: any;
  observation: any;
  observationDimensionValue: any;
  sourceReference: any;
  importIssue: any;
  importRun: {
    create(args: any): Promise<ImportRun>;
    update(args: any): Promise<ImportRun>;
  };
  datasetRevision: {
    findFirst(args: any): Promise<{ revision: number; checksum: string } | null>;
    create(args: any): Promise<{ id: string }>;
  };
}

interface Stage3Database {
  $transaction<T>(callback: (transaction: any) => Promise<T>): Promise<T>;
}

async function upsertAndCount<TRecord extends { id: string }>(
  delegate: any,
  uniqueKey: any,
  createData: any,
  updateData: any,
): Promise<{ record: TRecord; created: boolean }> {
  const existing = await delegate.findUnique({ where: uniqueKey });
  const record = await delegate.upsert({
    where: uniqueKey,
    create: createData,
    update: updateData,
  });

  return { record, created: existing === null };
}

function normalizeSummary(
  normalized: Stage3NormalizedImport,
  recordsCreated: number,
  recordsUpdated: number,
  revisionCount: number,
) {
  return {
    ...normalized.summary,
    persistedRevisions: revisionCount,
    recordsCreated,
    recordsUpdated,
    recordsFailed: normalized.issues.length,
  };
}

async function persistNormalizedImport(
  database: Stage3Database,
  normalized: Stage3NormalizedImport,
  rawSource: Stage3ImportResult["rawSource"],
): Promise<Stage3ImportResult> {
  const importRunId = stableUuid([
    normalized.sourceSystem,
    "IMPORT_RUN",
    normalized.sourceChecksum,
    normalized.startedAt.toISOString(),
  ]);

  return database.$transaction(async (transaction) => {
    const importRun = await transaction.importRun.create({
      data: {
        id: importRunId,
        sourceSystem: normalized.sourceSystem,
        status: "RUNNING",
        strictMode: false,
        startedAt: normalized.startedAt,
        finishedAt: null,
        categoriesSeen: normalized.categories.length,
        themesSeen: normalized.themes.length,
        datasetsSeen: normalized.datasets.length,
        observationsSeen: normalized.observations.length,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        sourceChecksum: normalized.sourceChecksum,
        summary: null,
      },
    });

    let recordsCreated = 0;
    let recordsUpdated = 0;
    let revisionCount = 0;

    for (const category of normalized.categories) {
      const result = await upsertAndCount(
        transaction.category,
        { sourceSystem_sourceId: { sourceSystem: category.sourceSystem, sourceId: category.sourceId } },
        category,
        category,
      );
      recordsCreated += result.created ? 1 : 0;
      recordsUpdated += result.created ? 0 : 1;
    }

    for (const theme of normalized.themes) {
      const result = await upsertAndCount(
        transaction.theme,
        { sourceSystem_sourceId: { sourceSystem: theme.sourceSystem, sourceId: theme.sourceId } },
        theme,
        theme,
      );
      recordsCreated += result.created ? 1 : 0;
      recordsUpdated += result.created ? 0 : 1;
    }

    for (const dataset of normalized.datasets) {
      const result = await upsertAndCount(
        transaction.dataset,
        { sourceSystem_sourceId: { sourceSystem: dataset.sourceSystem, sourceId: dataset.sourceId } },
        dataset,
        dataset,
      );
      recordsCreated += result.created ? 1 : 0;
      recordsUpdated += result.created ? 0 : 1;
    }

    for (const metadata of normalized.metadata) {
      const result = await upsertAndCount(
        transaction.datasetMetadata,
        { datasetId: metadata.datasetId },
        metadata,
        metadata,
      );
      recordsCreated += result.created ? 1 : 0;
      recordsUpdated += result.created ? 0 : 1;
    }

    for (const dimension of normalized.dimensions) {
      const result = await upsertAndCount(
        transaction.dimension,
        { datasetId_sourceId: { datasetId: dimension.datasetId, sourceId: dimension.sourceId } },
        dimension,
        dimension,
      );
      recordsCreated += result.created ? 1 : 0;
      recordsUpdated += result.created ? 0 : 1;
    }

    for (const dimensionValue of normalized.dimensionValues) {
      const result = await upsertAndCount(
        transaction.dimensionValue,
        { dimensionId_sourceId: { dimensionId: dimensionValue.dimensionId, sourceId: dimensionValue.sourceId } },
        dimensionValue,
        dimensionValue,
      );
      recordsCreated += result.created ? 1 : 0;
      recordsUpdated += result.created ? 0 : 1;
    }

    for (const observation of normalized.observations) {
      const result = await upsertAndCount(
        transaction.observation,
        { datasetId_coordinateHash: { datasetId: observation.datasetId, coordinateHash: observation.coordinateHash } },
        {
          ...observation,
          value: observation.value === null ? null : new Prisma.Decimal(observation.value),
        },
        {
          ...observation,
          value: observation.value === null ? null : new Prisma.Decimal(observation.value),
        },
      );
      recordsCreated += result.created ? 1 : 0;
      recordsUpdated += result.created ? 0 : 1;
    }

    for (const sourceReference of normalized.sourceReferences) {
      const result = await upsertAndCount(
        transaction.sourceReference,
        {
          sourceSystem_entityType_sourceScope_sourceId: {
            sourceSystem: sourceReference.sourceSystem,
            entityType: sourceReference.entityType,
            sourceScope: sourceReference.sourceScope,
            sourceId: sourceReference.sourceId,
          },
        },
        sourceReference,
        sourceReference,
      );
      recordsCreated += result.created ? 1 : 0;
      recordsUpdated += result.created ? 0 : 1;
    }

    for (const issue of normalized.issues) {
      const issueRecord = {
        ...issue,
        importRunId,
      };

      const result = await upsertAndCount(
        transaction.importIssue,
        { id: issue.id },
        issueRecord,
        issueRecord,
      );
      recordsCreated += result.created ? 1 : 0;
      recordsUpdated += result.created ? 0 : 1;
    }

    for (const dataset of normalized.datasets) {
      const latestRevision = await transaction.datasetRevision.findFirst({
        where: { datasetId: dataset.id },
        orderBy: { revision: "desc" },
      });

      if (latestRevision?.checksum === dataset.checksum) {
        continue;
      }

      const nextRevision = (latestRevision?.revision ?? 0) + 1;
      const revision = normalized.revisions.find((candidate) => candidate.datasetId === dataset.id);
      if (!revision) {
        continue;
      }

      await transaction.datasetRevision.create({
        data: {
          ...revision,
          id: stableUuid([dataset.sourceSystem, "DATASET_REVISION", dataset.sourceId, String(nextRevision), dataset.checksum ?? sha256Checksum(revision.snapshot)]),
          importRunId,
          revision: nextRevision,
          kind: latestRevision === null ? "CREATED" : "UPDATED",
          checksum: dataset.checksum ?? sha256Checksum(revision.snapshot),
        },
      });
      revisionCount += 1;
      recordsCreated += 1;
    }

    const finishedAt = new Date();
    const status = normalized.issues.some((issue) => issue.severity === "ERROR") ? "PARTIAL" : "SUCCEEDED";

    const summary = normalizeSummary(normalized, recordsCreated, recordsUpdated, revisionCount);

    const finalImportRun = await transaction.importRun.update({
      where: { id: importRun.id },
      data: {
        status,
        finishedAt,
        recordsCreated,
        recordsUpdated,
        recordsFailed: normalized.issues.length,
        summary,
      },
    });

    return {
      rawSource,
      normalized,
      importRun: finalImportRun,
    };
  });
}

export async function importStage3Source(
  database: Stage3Database,
  rawSource: unknown,
  options: Stage3ImportOptions = {},
): Promise<Stage3ImportResult> {
  const startedAt = options.startedAt ?? new Date();
  const parsedSource = parseRawStage3Source(rawSource);
  const normalized = normalizeStage3RawSource(parsedSource, startedAt);

  return persistNormalizedImport(database, normalized, parsedSource);
}

export async function importSampleStage3Source(): Promise<Stage3ImportResult> {
  const { sampleStage3Source } = await import("./sample-source");
  return importStage3Source(prisma as unknown as Stage3Database, sampleStage3Source);
}