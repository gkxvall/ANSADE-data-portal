import type {
  Category,
  Dataset,
  DatasetMetadata,
  DatasetRevision,
  Dimension,
  DimensionValue,
  ImportIssue,
  ImportRun,
  Observation,
  SourceReference,
  Theme,
} from "@/domain/entities";

import type { RawStage3Source } from "@/infrastructure/adapters/ansade-stage3";

export interface Stage3ImportOptions {
  readonly startedAt?: Date;
  readonly sourceChecksum?: string;
}

export interface Stage3NormalizedTable {
  readonly category: Category;
  readonly theme: Theme;
  readonly dataset: Dataset;
  readonly metadata: DatasetMetadata;
  readonly dimensions: readonly Dimension[];
  readonly dimensionValues: readonly DimensionValue[];
  readonly observations: readonly Observation[];
  readonly sourceReferences: readonly SourceReference[];
  readonly revisionSnapshot: Readonly<Record<string, unknown>>;
  readonly revisionChecksum: string;
}

export interface Stage3NormalizedImport {
  readonly sourceSystem: string;
  readonly sourceChecksum: string;
  readonly startedAt: Date;
  readonly importedAt: Date;
  readonly categories: readonly Category[];
  readonly themes: readonly Theme[];
  readonly datasets: readonly Dataset[];
  readonly metadata: readonly DatasetMetadata[];
  readonly dimensions: readonly Dimension[];
  readonly dimensionValues: readonly DimensionValue[];
  readonly observations: readonly Observation[];
  readonly sourceReferences: readonly SourceReference[];
  readonly revisions: readonly DatasetRevision[];
  readonly issues: readonly ImportIssue[];
  readonly summary: Readonly<Record<string, unknown>>;
}

export interface Stage3ImportResult {
  readonly rawSource: RawStage3Source;
  readonly normalized: Stage3NormalizedImport;
  readonly importRun: ImportRun;
}
p;
