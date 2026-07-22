import { z } from "zod";

import {
  checksumSchema,
  internalIdSchema,
  nonNegativeIntegerSchema,
  slugSchema,
  sourceIdSchema,
} from "./primitives";
import { globalSourceIdentitySchema } from "./source-identity";

const entityTimestampsSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

const orderedSourceEntitySchema = entityTimestampsSchema
  .extend(globalSourceIdentitySchema.shape)
  .extend({
    id: internalIdSchema,
    name: z.string().trim().min(1).max(255),
    slug: slugSchema,
    displayOrder: nonNegativeIntegerSchema,
    isActive: z.boolean(),
  });

export const categorySchema = orderedSourceEntitySchema;

export const themeSchema = orderedSourceEntitySchema.extend({
  categoryId: internalIdSchema,
});

export const datasetSchema = entityTimestampsSchema
  .extend(globalSourceIdentitySchema.shape)
  .extend({
    id: internalIdSchema,
    themeId: internalIdSchema,
    title: z.string().trim().min(1).max(500),
    slug: slugSchema,
    description: z.string().nullable(),
    sourceOrganization: z.string().trim().min(1).max(255).nullable(),
    publicationStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "UNKNOWN"]),
    isActive: z.boolean(),
    checksum: checksumSchema.nullable(),
  });

const scopedSourceEntitySchema = entityTimestampsSchema.extend({
  id: internalIdSchema,
  sourceId: sourceIdSchema,
  sourceUpdatedAt: z.date().nullable(),
  sourcePublishedAt: z.date().nullable(),
  position: nonNegativeIntegerSchema,
});

export const dimensionSchema = scopedSourceEntitySchema.extend({
  datasetId: internalIdSchema,
  key: z.string().trim().min(1).max(100),
  label: z.string().trim().min(1).max(255),
  kind: z.enum([
    "TIME",
    "GEOGRAPHY",
    "INDICATOR",
    "MEASURE",
    "CATEGORY",
    "OTHER",
  ]),
  isRequired: z.boolean(),
});

export const dimensionValueSchema = scopedSourceEntitySchema.extend({
  dimensionId: internalIdSchema,
  code: z.string().trim().min(1).max(255),
  label: z.string().trim().min(1).max(500),
  isActive: z.boolean(),
});
