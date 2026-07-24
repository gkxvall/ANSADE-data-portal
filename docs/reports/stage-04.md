# Stage 04 Report — Repository and Provider Abstraction

## Status and scope

Stage 4 is implemented. It introduces repository contracts, a PostgreSQL-backed provider, a mock provider, and an explicit future API-provider skeleton. Presentation code still cannot import Prisma directly, and the UI now consumes data through application query helpers instead of database infrastructure.

## What was implemented

- repository interfaces for categories, themes, datasets, observations, search, and statistics
- a provider boundary that selects PostgreSQL, mock, or API implementations from `DATA_SOURCE`
- a PostgreSQL provider that maps Prisma records into the domain repository shapes
- a mock provider backed by the checked-in development fixture
- a future API-provider skeleton that throws clear `NotImplemented` errors
- server-env validation for `DATA_SOURCE=postgres` and `DATA_SOURCE=api`
- ESLint import restrictions that keep Prisma out of presentation code
- repository boundary tests for the mock and API provider behavior
- application query helpers that consume the provider boundary

## How it works

The provider is selected on the server from environment configuration. PostgreSQL remains the default provider. The API provider is intentionally incomplete and fails explicitly so the live contract can be added later without silently changing behavior.

The repository layer keeps the application independent from Prisma. Pages and components call application query helpers, which in turn read from the selected provider.

## Important decisions

### Keep Prisma out of presentation code

The repo now enforces the boundary in two ways: ESLint blocks direct Prisma imports from `src/app` and `src/components`, and the actual data access is centralized behind repository interfaces.

### Keep the API future-proof

The API provider exists now, but every method throws an explicit `NotImplemented` error. That makes the future switch visible without implying an incomplete contract is already usable.

### Keep a mock provider for catalogue development

The mock provider lets the browse pages and search flow render without depending on a live database connection, while still using the same repository contract as PostgreSQL.

## Files created or changed

- `src/domain/repositories/*.ts`
- `src/infrastructure/providers/*.ts`
- `src/application/catalogue/queries.ts`
- `src/lib/env/server.ts`
- `src/lib/env/server.test.ts`
- `src/components/layout/app-shell.tsx`
- `src/components/layout/app-shell.test.tsx`
- `docs/reports/stage-04.md`

## How to run and test

Run the core checks:

```bash
npm run typecheck
npm run lint
npm test
```

Use the mock provider in tests or local catalogue work, and the PostgreSQL provider for the imported snapshot.

## Verification results

| Check      | Result                |
| ---------- | --------------------- |
| TypeScript | Passed                |
| ESLint     | Passed, zero warnings |

## Limitations and risks

- The API provider is still a skeleton and must be implemented later.
- The provider layer currently focuses on catalogue browsing and search, not the full dataset explorer or export workflows.
- Search and listing are repository-driven, but large-scale search tuning and richer statistics remain future work.

## Preparation for Stage 5

Stage 5 can now build browse pages against the provider boundary without direct Prisma imports from the UI.
