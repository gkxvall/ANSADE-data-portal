import { z } from "zod";

import {
  checksumSchema,
  internalIdSchema,
  sourceIdSchema,
  sourceScopeSchema,
  sourceSystemSchema,
  sourceTimestampSchema,
} from "./primitives";

export const globalSourceIdentitySchema = z.object({
  sourceSystem: sourceSystemSchema,
  sourceId: sourceIdSchema,
  sourceUpdatedAt: sourceTimestampSchema,
  sourcePublishedAt: sourceTimestampSchema,
});

export const sourceReferenceSchema = globalSourceIdentitySchema.extend({
  id: internalIdSchema,
  entityType: z.enum([
    "CATEGORY",
    "THEME",
    "DATASET",
    "DIMENSION",
    "DIMENSION_VALUE",
    "OBSERVATION",
    "DATASET_METADATA",
  ]),
  entityId: internalIdSchema,
  sourceScope: sourceScopeSchema,
  sourceUrl: z.url().nullable(),
  checksum: checksumSchema.nullable(),
  retrievedAt: z.date(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.date(),
});
