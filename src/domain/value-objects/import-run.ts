import { z } from "zod";

import {
  checksumSchema,
  internalIdSchema,
  nonNegativeIntegerSchema,
  sourceSystemSchema,
} from "./primitives";

export const importRunCountsSchema = z.object({
  categoriesSeen: nonNegativeIntegerSchema,
  themesSeen: nonNegativeIntegerSchema,
  datasetsSeen: nonNegativeIntegerSchema,
  observationsSeen: nonNegativeIntegerSchema,
  recordsCreated: nonNegativeIntegerSchema,
  recordsUpdated: nonNegativeIntegerSchema,
  recordsFailed: nonNegativeIntegerSchema,
});

export const importRunSchema = importRunCountsSchema
  .extend({
    id: internalIdSchema,
    sourceSystem: sourceSystemSchema,
    status: z.enum(["RUNNING", "SUCCEEDED", "PARTIAL", "FAILED"]),
    strictMode: z.boolean(),
    startedAt: z.date(),
    finishedAt: z.date().nullable(),
    sourceChecksum: checksumSchema.nullable(),
    summary: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .superRefine((run, context) => {
    if (run.status === "RUNNING" && run.finishedAt !== null) {
      context.addIssue({
        code: "custom",
        message: "A running import cannot have a finish timestamp",
        path: ["finishedAt"],
      });
    }

    if (run.status !== "RUNNING" && run.finishedAt === null) {
      context.addIssue({
        code: "custom",
        message: "A completed import must have a finish timestamp",
        path: ["finishedAt"],
      });
    }

    if (run.finishedAt && run.finishedAt < run.startedAt) {
      context.addIssue({
        code: "custom",
        message: "Import finish timestamp cannot precede its start",
        path: ["finishedAt"],
      });
    }
  });
