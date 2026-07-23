# Stage 03 Report — Source Importer and Static Snapshot Pipeline

## Status and scope

Stage 3 is implemented. It adds a deterministic source-import pipeline that validates a representative ANSADE-like payload, normalizes it into the Stage 2 domain shape, computes checksums and stable IDs, and persists the sample snapshot through Prisma. It does not fetch live ANSADE data yet, and the UI still does not read imported PostgreSQL data.

## What was implemented

- a raw Stage 3 source schema for ANSADE-style export data
- a representative hardcoded sample source with:
  - categories
  - themes
  - selectable tables
  - dimensions and dimension values
  - valid and invalid rows
- deterministic checksum and stable-ID helpers
- a normalizer that:
  - filters selectable tables
  - flattens rows into observation records
  - preserves raw values and source timestamps
  - generates observation-to-dimension-value join records
  - emits source references
  - records row-level validation issues
  - builds dataset revision snapshots
- a Prisma-backed importer that:
  - upserts normalized records
  - writes import-run audit records
  - persists import issues
  - creates dataset revisions when checksums change
  - keeps repeated imports from creating duplicate domain rows
- Vitest coverage for normalization and idempotent persistence using an in-memory database stub
- an npm script for running the sample import entrypoint

## How it works

The pipeline follows the documented Stage 3 architecture:

```text
Sample source
    ↓
Zod validation
    ↓
Normalization
    ↓
Checksum and stable-ID generation
    ↓
Prisma transaction
    ↓
PostgreSQL
```

The raw source adapter accepts ANSADE-flavoured field names such as `nom_cat`, `nom_theme`, `id_table`, and `coordonnees`. The normalizer converts them into the Stage 2 domain model, computes a canonical JSON coordinate, and writes matching observation-dimension-value links so future query layers can filter by normalized dimensions instead of raw source structure.

The importer performs idempotent upserts keyed by the preserved source identities. Re-running the same source snapshot does not create duplicate categories, themes, datasets, dimensions, dimension values, observations, or observation-dimension-value links. Dataset revisions are only created when the dataset checksum changes.

## Important decisions

### Keep source fields isolated

All ANSADE-specific field names live in the Stage 3 adapter and sample source modules. The domain entities and application layers continue to use normalized names only.

### Preserve raw values and timestamps

Numeric parsing never discards the original source text. Source publication and update timestamps remain separate from application timestamps, and the importer stores both when present.

### Use a sample source first

Stage 3 intentionally uses a checked-in representative source so the normalizer and persistence flow can be tested deterministically before any live source integration is added.

### Persist relational joins early

Observation coordinates are kept both as canonical JSON and as normalized join rows. This makes the importer useful for later filtering work without changing the Stage 3 contract.

## Files created or changed

### Import pipeline

- `src/infrastructure/adapters/ansade-stage3.ts`
- `src/infrastructure/importers/stage-3/checksum.ts`
- `src/infrastructure/importers/stage-3/importer.ts`
- `src/infrastructure/importers/stage-3/normalizer.ts`
- `src/infrastructure/importers/stage-3/sample-source.ts`
- `src/infrastructure/importers/stage-3/types.ts`
- `src/infrastructure/importers/stage-3/run.ts`
- `src/infrastructure/importers/index.ts`

### Tests and docs

- `src/infrastructure/importers/stage-3/importer.test.ts`
- `README.md`
- `docs/known-issues.md`
- `docs/reports/stage-03.md`

### Scripts

- `package.json`

## How to run and test

Run the sample import entrypoint against a local PostgreSQL database configured in `.env`:

```bash
npm run import:stage3
```

Validate the project:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Run the Stage 3-focused tests directly if needed:

```bash
npm test
```

## Verification results

| Check            | Result |
| ---------------- | ------ |
| TypeScript       | Passed |
| Vitest           | Passed, 11 files / 45 tests |
| ESLint           | Passed, zero warnings |
| Production build | Passed |

## Limitations and risks

- The importer still uses the checked-in sample payload instead of a live ANSADE export.
- No live source adapter or file reader exists yet.
- The sample payload is representative, not official statistical content.
- The importer assumes the Stage 2 schema and migration are already present.
- The UI still does not read imported data from PostgreSQL.

## Preparation for Stage 4

The importer now produces the same normalized domain shapes Stage 4 repositories will need. The next stage can introduce repository interfaces, provider selection, and Prisma-backed read models without changing the Stage 3 import contract.