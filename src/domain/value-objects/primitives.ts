import { z } from "zod";

export const internalIdSchema = z.uuid();
export const sourceSystemSchema = z.string().trim().min(1).max(64);
export const sourceIdSchema = z.string().trim().min(1).max(255);
export const sourceScopeSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .default("global");
export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must use lowercase ASCII words separated by hyphens",
  );
export const checksumSchema = z
  .string()
  .regex(/^[a-f0-9]{64}$/, "Checksum must be a lowercase SHA-256 hex digest");
export const sourceTimestampSchema = z.date().nullable();
export const nonNegativeIntegerSchema = z.number().int().nonnegative();
export const positiveIntegerSchema = z.number().int().positive();
