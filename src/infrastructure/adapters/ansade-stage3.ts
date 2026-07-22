import { z } from "zod";

const isoDateSchema = z.coerce.date();

const rawCategorySchema = z.object({
  id_categorie: z.string().trim().min(1).max(255),
  nom_cat: z.string().trim().min(1).max(255),
  ordre_affichage: z.coerce.number().int().nonnegative().default(0),
  source_updated_at: isoDateSchema.nullish().default(null),
  source_published_at: isoDateSchema.nullish().default(null),
});

const rawThemeSchema = z.object({
  id_theme: z.string().trim().min(1).max(255),
  id_categorie: z.string().trim().min(1).max(255),
  nom_theme: z.string().trim().min(1).max(255),
  ordre_affichage: z.coerce.number().int().nonnegative().default(0),
  source_updated_at: isoDateSchema.nullish().default(null),
  source_published_at: isoDateSchema.nullish().default(null),
});

const rawDimensionValueSchema = z.object({
  id_valeur: z.string().trim().min(1).max(255),
  code_valeur: z.string().trim().min(1).max(255),
  libelle_valeur: z.string().trim().min(1).max(500),
  ordre_affichage: z.coerce.number().int().nonnegative().default(0),
  source_updated_at: isoDateSchema.nullish().default(null),
  source_published_at: isoDateSchema.nullish().default(null),
});

const rawDimensionSchema = z.object({
  id_dimension: z.string().trim().min(1).max(255),
  code_dimension: z.string().trim().min(1).max(100),
  libelle_dimension: z.string().trim().min(1).max(255),
  type_dimension: z.enum([
    "TIME",
    "GEOGRAPHY",
    "INDICATOR",
    "MEASURE",
    "CATEGORY",
    "OTHER",
  ]),
  obligatoire: z.coerce.boolean().default(true),
  valeurs: z.array(rawDimensionValueSchema),
  source_updated_at: isoDateSchema.nullish().default(null),
  source_published_at: isoDateSchema.nullish().default(null),
});

const rawRowSchema = z.object({
  id_ligne: z.string().trim().min(1).max(255),
  coordonnees: z.record(z.string().trim().min(1), z.string().trim().min(1)),
  valeur_numerique: z.number().finite().nullable().default(null),
  valeur_brute: z.string().trim().min(1).nullable().default(null),
  statut: z.string().trim().min(1).max(100).nullable().default(null),
  source_updated_at: isoDateSchema.nullish().default(null),
  source_published_at: isoDateSchema.nullish().default(null),
});

const rawTableSchema = z.object({
  id_table: z.string().trim().min(1).max(255),
  id_theme: z.string().trim().min(1).max(255),
  nom_table: z.string().trim().min(1).max(500),
  description: z.string().trim().min(1).nullable().default(null),
  organisme_source: z.string().trim().min(1).max(255).nullable().default(null),
  statut_publication: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "UNKNOWN"]).default("UNKNOWN"),
  publiee: z.coerce.boolean().default(false),
  selectionnee: z.coerce.boolean().default(false),
  resume_metadonnees: z.record(z.string(), z.unknown()).nullable().default(null),
  dimensions: z.array(rawDimensionSchema),
  lignes: z.array(rawRowSchema),
  source_updated_at: isoDateSchema.nullish().default(null),
  source_published_at: isoDateSchema.nullish().default(null),
});

export const rawStage3SourceSchema = z.object({
  source_system: z.string().trim().min(1).max(64),
  source_published_at: isoDateSchema.nullish().default(null),
  source_updated_at: isoDateSchema.nullish().default(null),
  categories: z.array(rawCategorySchema),
  themes: z.array(rawThemeSchema),
  tables: z.array(rawTableSchema),
});

export type RawStage3Source = z.infer<typeof rawStage3SourceSchema>;
export type RawStage3Table = z.infer<typeof rawTableSchema>;
export type RawStage3Row = z.infer<typeof rawRowSchema>;
export type RawStage3Dimension = z.infer<typeof rawDimensionSchema>;

export function parseRawStage3Source(input: unknown): RawStage3Source {
  return rawStage3SourceSchema.parse(input);
}