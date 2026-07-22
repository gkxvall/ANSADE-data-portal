# Stage 2 Database and Domain Model

## Purpose

This document defines the normalized internal model used by the ANSADE Statistical Data Explorer. It is intentionally independent of current portal field names and any future live API response shape.

The Prisma schema is the application-facing database definition. The initial SQL migration adds PostgreSQL checks that Prisma cannot express directly.

## Relationship overview

```text
Category 1 ── * Theme 1 ── * Dataset
                              ├── 1 DatasetMetadata
                              ├── * Dimension 1 ── * DimensionValue
                              ├── * Observation * ── * DimensionValue
                              ├── * DatasetRevision
                              └── * ImportIssue

ImportRun 1 ── * ImportIssue
ImportRun 1 ── * DatasetRevision

SourceReference ── exactly one normalized source entity
```

`ObservationDimensionValue` is the normalized join between an observation and one value for each dimension. Its primary key, `(observationId, dimensionId)`, guarantees that an observation cannot select two values from the same dimension. Its composite foreign key guarantees that the selected value belongs to that dimension.

## Entities

### Catalogue hierarchy

- `Category` owns themes.
- `Theme` belongs to one category and owns datasets.
- `Dataset` belongs to one theme and owns dimensions, observations, metadata, and revisions.
- `DatasetMetadata` stores descriptive fields separately from catalogue identity.

Categories, themes, and datasets have internal UUIDs and dedicated `(sourceSystem, sourceId)` identities. Dimensions and dimension values are scoped to their parent dataset/dimension because external identifiers may repeat between source tables.

### Statistical structure

- `Dimension` describes a statistical axis such as time, geography, indicator, measure, or another categorical concept.
- `DimensionValue` is one code/label member of a dimension.
- `Observation` stores one numeric or missing value at one multidimensional coordinate.
- `ObservationDimensionValue` stores the filterable normalized coordinate links.

### Metadata and provenance

- `SourceReference` stores provenance, source timestamps, optional source URL, retrieval time, and checksum.
- A database check requires each source reference to point to exactly one normalized entity and requires `entityType` to match that target.
- `sourceScope` disambiguates external identifiers that are only unique beneath a parent. Stage 3 adapters must use a stable scope such as the parent dataset source ID.

### Import audit and revisions

- `ImportRun` records status, timing, counts, checksums, and a structured summary.
- `ImportIssue` records warnings/errors without requiring the full run to fail.
- `DatasetRevision` stores a monotonically positive revision number, checksum, normalized JSON snapshot, and optional import-run relationship.

## Observation storage decision

The model uses a hybrid coordinate representation:

1. `coordinate` JSONB preserves a canonical, easy-to-reconstruct `{ dimensionKey: valueCode }` view.
2. `coordinateHash` is unique within a dataset and prevents duplicate coordinates.
3. `ObservationDimensionValue` provides relational integrity and efficient filtering through indexed dimension-value IDs.

This deliberately avoids relying only on JSONB for large-table filters while avoiding a hard-coded column per statistical table. Stage 3 must generate the coordinate JSON and hash from the same normalized, key-sorted coordinate and write both representations in one transaction.

PostgreSQL stores numeric values as `DECIMAL(30,10)`. `rawValue` is stored independently and must never be discarded. Repository mappers introduced in Stage 4 must check range and precision before converting Prisma `Decimal` values to the domain’s `number | null`; when conversion would be unsafe, the raw value remains authoritative and the condition must be surfaced rather than silently rounded.

## Source identity and timestamp rules

| Domain concept         | Database fields                        | Rule                                                              |
| ---------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| Global source identity | `sourceSystem`, `sourceId`             | Unique for category, theme, and dataset                           |
| Scoped source identity | parent ID, `sourceId`                  | Unique within dataset or dimension                                |
| Source lifecycle       | `sourcePublishedAt`, `sourceUpdatedAt` | Preserve source values; never replace with application timestamps |
| Application audit      | `createdAt`, `updatedAt`               | Managed by the application/Prisma                                 |
| Retrieval audit        | `retrievedAt`                          | Records when a source reference was obtained                      |

External names such as `nom_cat` or `nom_theme` are forbidden outside future adapter modules. No external source field exists in this schema.

## Prisma-to-domain mapping rules

<!-- markdownlint-disable MD060 -->

| Prisma/database representation  | Domain representation              | Mapping rule                                                   |
| ------------------------------- | ---------------------------------- | -------------------------------------------------------------- |
| UUID string                     | `string` internal ID               | Return unchanged                                               |
| Prisma enum                     | string-literal union               | Map exhaustively; unknown enum members are errors              |
| `Decimal(30,10)`                | number or null                                                      | Convert only after finite/range/precision checks           |
| JSONB coordinate                | `Readonly<Record<string, string>>` | Validate keys and values before returning                      |
| JSONB metadata/summary/snapshot | readonly record                    | Validate object shape; never expose mutable Prisma JSON values |
| nullable database value         | T or null                                                           | Normalize `undefined` to `null` at the repository boundary |
| source timestamps               | Date or null                                                        | Preserve exactly; do not substitute `updatedAt`            |
| source-reference target columns | `entityId`                         | Select the one non-null target required by the SQL check       |

<!-- markdownlint-enable MD060 -->

Concrete mapper implementations belong to the PostgreSQL provider in Stage 4. They are not added to presentation or domain code in Stage 2.

## Deletion behavior

- Category-to-theme and theme-to-dataset deletes are restricted.
- Owned dataset details (metadata, dimensions, observations, and revisions) cascade only if a dataset is deliberately hard-deleted.
- Source references cascade with their one target.
- Import issues cascade with an import run; their optional dataset link becomes null if a dataset is removed.
- Revisions keep their dataset relationship but retain history if an associated import run is removed by setting `importRunId` to null.

Operational imports should mark source entities inactive before any hard deletion, consistent with `docs/known-issues.md`.

## Constraints and indexes

Important uniqueness guarantees include:

- global source identity for categories, themes, and datasets
- parent-scoped source identity and code/key uniqueness for dimensions and values
- `(datasetId, coordinateHash)` for observations
- `(observationId, dimensionId)` for one value per dimension
- `(datasetId, revision)` and `(datasetId, checksum)` for revisions
- source-reference identity including stable source scope

Important query indexes cover:

- themes by category and display order
- datasets by theme, source ID, source update time, publication status, and active state
- dimensions/values by parent and position
- observations by dataset and status
- observation links by dimension value
- import runs by source/status and descending start time
- issues and revisions by their parents

The migration also validates checksum formats, JSON object shapes, non-negative counts/positions, positive revision numbers, valid import timestamps, and preservation of at least one numeric/raw/status observation value.

## Development seed

`prisma/fixtures/development.ts` and `prisma/seed.ts` create one idempotent hierarchy that exercises every relationship. All records use the source system `development-fixture`, visible `[DEV]` labels, and the marker `DEVELOPMENT_FIXTURE_ONLY`. The observation is fictitious and must never be treated as official ANSADE data.

Run against a disposable local database only:

```bash
npm run prisma:migrate:deploy
npm run prisma:seed
```
