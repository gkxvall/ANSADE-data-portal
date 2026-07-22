import type { SourceEntityType } from "./common";

export type ImportRunStatus = "RUNNING" | "SUCCEEDED" | "PARTIAL" | "FAILED";
export type ImportIssueSeverity = "WARNING" | "ERROR";
export type DatasetRevisionKind =
  "CREATED" | "UPDATED" | "DEACTIVATED" | "REACTIVATED";

export interface ImportRunCounts {
  readonly categoriesSeen: number;
  readonly themesSeen: number;
  readonly datasetsSeen: number;
  readonly observationsSeen: number;
  readonly recordsCreated: number;
  readonly recordsUpdated: number;
  readonly recordsFailed: number;
}

export interface ImportRun extends ImportRunCounts {
  readonly id: string;
  readonly sourceSystem: string;
  readonly status: ImportRunStatus;
  readonly strictMode: boolean;
  readonly startedAt: Date;
  readonly finishedAt: Date | null;
  readonly sourceChecksum: string | null;
  readonly summary: Readonly<Record<string, unknown>> | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ImportIssue {
  readonly id: string;
  readonly importRunId: string;
  readonly datasetId: string | null;
  readonly severity: ImportIssueSeverity;
  readonly code: string;
  readonly message: string;
  readonly sourceEntityType: SourceEntityType | null;
  readonly sourceId: string | null;
  readonly details: Readonly<Record<string, unknown>> | null;
  readonly createdAt: Date;
}

export interface DatasetRevision {
  readonly id: string;
  readonly datasetId: string;
  readonly importRunId: string | null;
  readonly revision: number;
  readonly kind: DatasetRevisionKind;
  readonly checksum: string;
  readonly snapshot: Readonly<Record<string, unknown>>;
  readonly sourceUpdatedAt: Date | null;
  readonly createdAt: Date;
}
