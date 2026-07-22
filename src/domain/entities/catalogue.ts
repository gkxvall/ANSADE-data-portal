import type {
  DimensionKind,
  EntityTimestamps,
  GlobalSourceIdentity,
  PublicationStatus,
  ScopedSourceIdentity,
  SourceEntityType,
  SourceTimestamps,
} from "./common";

export interface Category extends EntityTimestamps, GlobalSourceIdentity {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export interface Theme extends EntityTimestamps, GlobalSourceIdentity {
  readonly id: string;
  readonly categoryId: string;
  readonly name: string;
  readonly slug: string;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export interface Dataset extends EntityTimestamps, GlobalSourceIdentity {
  readonly id: string;
  readonly themeId: string;
  readonly title: string;
  readonly slug: string;
  readonly description: string | null;
  readonly sourceOrganization: string | null;
  readonly publicationStatus: PublicationStatus;
  readonly isActive: boolean;
  readonly checksum: string | null;
}

export interface DatasetMetadata extends EntityTimestamps, SourceTimestamps {
  readonly id: string;
  readonly datasetId: string;
  readonly unit: string | null;
  readonly frequency: string | null;
  readonly methodology: string | null;
  readonly coverage: string | null;
  readonly limitations: string | null;
  readonly contact: string | null;
  readonly language: string;
  readonly additional: Readonly<Record<string, unknown>> | null;
}

export interface Dimension extends EntityTimestamps, ScopedSourceIdentity {
  readonly id: string;
  readonly datasetId: string;
  readonly key: string;
  readonly label: string;
  readonly kind: DimensionKind;
  readonly position: number;
  readonly isRequired: boolean;
}

export interface DimensionValue extends EntityTimestamps, ScopedSourceIdentity {
  readonly id: string;
  readonly dimensionId: string;
  readonly code: string;
  readonly label: string;
  readonly position: number;
  readonly isActive: boolean;
}

export interface SourceReference extends SourceTimestamps {
  readonly id: string;
  readonly sourceSystem: string;
  readonly entityType: SourceEntityType;
  readonly entityId: string;
  readonly sourceScope: string;
  readonly sourceId: string;
  readonly sourceUrl: string | null;
  readonly checksum: string | null;
  readonly retrievedAt: Date;
  readonly metadata: Readonly<Record<string, unknown>> | null;
  readonly createdAt: Date;
}
