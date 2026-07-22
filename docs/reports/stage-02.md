# Stage 02 Report — Domain Model and Database Schema

## Status and scope

Stage 2 is implemented. It defines the stable internal statistical domain and PostgreSQL schema without implementing source fetching, source-shape adapters, normalization, repository providers, or UI data access. Stage 3 has not started.

## What was implemented

- framework-independent TypeScript entities for:
  - categories
  - themes
  - datasets and metadata
  - dimensions and dimension values
  - observations
  - source references
  - import runs and issues
  - dataset revisions
- Zod value-object validation for source identities, catalogue entities, checksums, slugs, observations, and import runs
- a normalized Prisma schema with 12 models and six enums
- an initial PostgreSQL migration with tables, foreign keys, indexes, uniqueness constraints, and custom checks
- explicit source-ID and source-timestamp preservation
- a hybrid observation coordinate model using JSONB, coordinate hashes, and normalized dimension-value links
- an idempotent development seed exercising the complete relationship graph
- database/domain mapping rules and relationship documentation
- schema, domain, fixture, and custom-constraint tests
- Stage 2 status updates in the application shell, README, and known-issues register

## How it works

### Catalogue and statistical hierarchy

`Category → Theme → Dataset` forms the browsing hierarchy. Each dataset owns its metadata, dimensions, observations, and revisions. Dimensions own reusable coded values. The `ObservationDimensionValue` join selects one value per dimension for each observation.

Categories, themes, and datasets store a global `(sourceSystem, sourceId)` identity. Dimensions, dimension values, and observations keep source identifiers scoped to their normalized parent because real external systems may reuse IDs under different tables.

### Observation coordinates

Every observation stores:

- a canonical JSONB coordinate for reconstruction
- a lowercase SHA-256 `coordinateHash`
- normalized dimension-value links for filtering and relational integrity
- a PostgreSQL `DECIMAL(30,10)` numeric value
- the unmodified `rawValue`
- an optional source status for missing or qualified values

The database prevents duplicate `(datasetId, coordinateHash)` values. The join-table primary key prevents two values for one dimension, and its composite foreign key proves that the selected dimension value belongs to that dimension.

### Provenance and revisions

`SourceReference` stores the source system, scope, source ID, optional URL, checksums, source timestamps, and retrieval timestamp. A PostgreSQL check requires exactly one normalized target and requires `entityType` to match it.

`ImportRun` and `ImportIssue` provide the audit structure required by the future importer. `DatasetRevision` stores a positive revision number, checksum, normalized snapshot, and optional import-run association.

## Important decisions

### Domain independence

Files under `src/domain` import neither Next.js nor Prisma. Prisma enum/database values will be mapped at the future repository boundary. Presentation lint rules from Stage 1 continue to prohibit database access.

### Source identity preservation

Internal UUIDs never replace external identifiers. Source IDs and source publication/update timestamps are dedicated fields. Application timestamps are separate and cannot be substituted for source lifecycle values.

No current ANSADE source field names were added to the domain or database. Fields such as `nom_cat` remain reserved for Stage 3 adapter schemas only.

### Hybrid storage instead of JSON-only observations

JSON-only coordinates would be easy to write but would weaken foreign-key integrity and large-table filters. A fully table-specific relational layout would make each imported table require schema changes. The hybrid design preserves a generic coordinate while providing indexed relational filtering.

Stage 3 must construct coordinate JSON, coordinate hash, and join records from one canonical key-sorted representation and write them atomically.

### Numeric precision

PostgreSQL uses `DECIMAL(30,10)`, while the documented domain contract currently uses `number | null`. Stage 4 mappers must refuse unsafe numeric conversion rather than silently rounding. `rawValue` remains independently available in every case.

### Database-level constraints

The SQL migration adds checks not representable in Prisma 6, including:

- lowercase 64-character checksum formats
- JSON object shapes
- exactly one correctly typed source-reference target
- non-negative positions and import counters
- valid import completion timestamps
- positive dataset revision numbers
- preservation of numeric, raw, or status observation content

These custom checks are asserted by automated schema tests and documented because later generated migrations require review to preserve them.

### Deletion behavior

Hierarchy deletion is restricted at category/theme boundaries. Dataset-owned detail records cascade only on an intentional hard delete. Operational source disappearance should set `isActive = false`; destructive cleanup remains deferred and audited.

## Development fixture

The seed uses deterministic UUIDs and source system `development-fixture`. Every user-facing label begins with `[DEV]`, metadata includes `DEVELOPMENT_FIXTURE_ONLY`, and the sole fictitious observation has status `DEVELOPMENT_FIXTURE`.

The seed is implemented with upserts and was executed twice against a disposable PostgreSQL 17 cluster. Each of the 12 relationship tables still contained exactly one expected fixture row, proving idempotency. The temporary cluster was stopped and deleted after verification.

## Files created or changed

### Database

- `prisma.config.ts`
- `prisma/schema.prisma`
- `prisma/migrations/migration_lock.toml`
- `prisma/migrations/20260722133000_stage_02_domain_model/migration.sql`
- `prisma/fixtures/development.ts`
- `prisma/seed.ts`

### Domain and validation

- `src/domain/entities/common.ts`
- `src/domain/entities/catalogue.ts`
- `src/domain/entities/observations.ts`
- `src/domain/entities/imports.ts`
- `src/domain/entities/index.ts`
- `src/domain/value-objects/*.ts`
- `src/domain/value-objects/*.test.ts`

### Schema testing and documentation

- `src/infrastructure/database/schema.test.ts`
- `docs/database-model.md`
- `docs/known-issues.md`
- `docs/reports/stage-02.md`
- `README.md`
- `src/app/page.tsx`
- `src/components/layout/app-shell.tsx`
- `package.json`, `package-lock.json`

## How to run and test

Install dependencies and configure a local PostgreSQL URL:

```bash
npm ci
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate:deploy
```

Load the clearly marked development fixture only into a disposable development database:

```bash
npm run prisma:seed
```

Run the project and quality suite:

```bash
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

## Verification results

| Check                                | Result                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| Prisma formatting and validation     | Passed                                                                            |
| Prisma client generation             | Passed                                                                            |
| PostgreSQL 17 migration deployment   | Passed in an isolated temporary cluster                                           |
| Development seed                     | Passed twice; idempotent row counts confirmed                                     |
| Custom source-reference target check | Passed; invalid insert rejected                                                   |
| Custom observation hash check        | Passed; invalid insert rejected                                                   |
| Prettier                             | Passed                                                                            |
| ESLint                               | Passed, zero warnings                                                             |
| TypeScript                           | Passed                                                                            |
| Vitest                               | Passed, 10 files / 43 tests before the final documentation-only verification pass |
| npm security audit                   | 0 known vulnerabilities after dependency update                                   |
| Production build                     | Run in the final Stage 2 verification pass                                        |

## Limitations and risks

- No persistent project PostgreSQL database or production credentials are configured.
- No official ANSADE source payload was available, so source-scope construction remains a Stage 3 adapter decision.
- PostgreSQL cannot prove that JSON coordinate codes exactly match normalized join records; Stage 3 must enforce atomic canonical construction.
- Decimal-to-number conversion needs explicit safe-range behavior in Stage 4 repository mappers.
- Custom SQL checks are not fully represented by Prisma and require migration review.
- The fixture proves relationships and idempotency but is not official statistical content.
- The liveness endpoint still intentionally reports `database: "not-checked"`.

All limitations are recorded in `docs/known-issues.md` with mitigations.

## Preparation for Stage 3

The database now has stable normalized targets for source adapters and importer transactions. Stage 3 can add raw source Zod schemas, adapter-only external fields, canonical coordinate construction, checksum generation, idempotent upserts, partial-failure handling, and representative source fixtures.

Stage 3 must preserve the source identity/timestamp rules, use the `sourceScope` convention documented here, and keep external response shapes inside `src/infrastructure/adapters`. No Stage 3 implementation has been started.
