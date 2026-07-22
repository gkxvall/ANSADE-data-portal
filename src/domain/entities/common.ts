export interface EntityTimestamps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SourceTimestamps {
  readonly sourceUpdatedAt: Date | null;
  readonly sourcePublishedAt: Date | null;
}

export interface GlobalSourceIdentity extends SourceTimestamps {
  readonly sourceSystem: string;
  readonly sourceId: string;
}

export interface ScopedSourceIdentity extends SourceTimestamps {
  readonly sourceId: string;
}

export type PublicationStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "UNKNOWN";

export type DimensionKind =
  "TIME" | "GEOGRAPHY" | "INDICATOR" | "MEASURE" | "CATEGORY" | "OTHER";

export type SourceEntityType =
  | "CATEGORY"
  | "THEME"
  | "DATASET"
  | "DIMENSION"
  | "DIMENSION_VALUE"
  | "OBSERVATION"
  | "DATASET_METADATA";
