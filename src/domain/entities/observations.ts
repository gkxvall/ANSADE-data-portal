import type { EntityTimestamps, SourceTimestamps } from "./common";

export type ObservationCoordinate = Readonly<Record<string, string>>;

export interface Observation extends EntityTimestamps, SourceTimestamps {
  readonly id: string;
  readonly datasetId: string;
  readonly sourceId: string | null;
  readonly coordinate: ObservationCoordinate;
  readonly coordinateHash: string;
  readonly value: number | null;
  readonly rawValue: string | null;
  readonly status: string | null;
  readonly dimensionValueIds: readonly string[];
}
