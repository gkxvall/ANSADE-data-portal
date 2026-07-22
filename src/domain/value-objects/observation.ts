import { z } from "zod";

import {
  checksumSchema,
  internalIdSchema,
  sourceIdSchema,
  sourceTimestampSchema,
} from "./primitives";

export const observationCoordinateSchema = z.record(
  z.string().trim().min(1).max(100),
  z.string().trim().min(1).max(255),
);

export const observationSchema = z
  .object({
    id: internalIdSchema,
    datasetId: internalIdSchema,
    sourceId: sourceIdSchema.nullable(),
    coordinate: observationCoordinateSchema,
    coordinateHash: checksumSchema,
    value: z.number().finite().nullable(),
    rawValue: z.string().nullable(),
    status: z.string().trim().min(1).max(100).nullable(),
    dimensionValueIds: z.array(internalIdSchema),
    sourceUpdatedAt: sourceTimestampSchema,
    sourcePublishedAt: sourceTimestampSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .superRefine((observation, context) => {
    if (
      observation.value === null &&
      observation.rawValue === null &&
      observation.status === null
    ) {
      context.addIssue({
        code: "custom",
        message:
          "An observation must preserve a numeric value, raw value, or status",
        path: ["value"],
      });
    }

    if (
      new Set(observation.dimensionValueIds).size !==
      observation.dimensionValueIds.length
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Dimension value identifiers must be unique within an observation",
        path: ["dimensionValueIds"],
      });
    }
  });
