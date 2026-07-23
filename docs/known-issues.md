# Known Issues and Risks

This document must be updated throughout development.

## 1. Source API Documentation Is Incomplete

The existing portal may expose JSON endpoints without a stable public contract.

Risk:

- field names or response shapes may change

Mitigation:

- isolate source-specific code in adapters
- validate raw responses
- preserve fixtures
- never expose source fields to the UI

## 2. Authentication Requirements May Change

Some source endpoints may later require authentication.

Mitigation:

- keep credentials server-side
- configure source clients through environment variables
- support offline imports from exported files

## 3. Table Structures Are Not Uniform

Different statistical tables may use different nesting patterns, grouped columns, percentages, totals, or missing values.

Mitigation:

- build fixture-driven normalizers
- preserve raw source payloads during development
- record unsupported structures as import issues

## 4. Numeric Values May Be Ambiguous

Values may contain:

- commas as decimals
- spaces as thousand separators
- percentage symbols
- footnote markers
- textual placeholders

Mitigation:

- store both parsed numeric value and raw value
- never silently convert invalid values to zero

## 5. Dataset Dimensions May Be Implicit

Some dimensions may only be visible through row or column labels.

Mitigation:

- derive dimensions through source adapters
- store source labels
- allow dataset-specific metadata overrides without changing UI code

## 6. Static Snapshot Becomes Stale

The PostgreSQL snapshot will not update unless the importer is run again.

Mitigation:

- display snapshot generation date
- store source update timestamps
- make import repeatable
- prepare future scheduled synchronization

## 7. Source Deletions Are Difficult to Interpret

A missing source record could mean deletion, temporary failure, or permission change.

Mitigation:

- soft-delete or mark inactive first
- record revisions
- require confirmation before destructive cleanup

## 8. Large Datasets May Affect Performance

Loading all observations into the browser will not scale.

Mitigation:

- query server-side
- paginate or virtualize
- aggregate before visualization
- limit export sizes or stream exports

## 9. PostgreSQL-to-API Semantics May Differ

A future API may paginate, aggregate, or omit fields differently.

Mitigation:

- enforce provider contracts
- use adapters
- create mock API contract tests early

## 10. Search Language and Accents

French and Arabic text may require accent-insensitive and multilingual search.

Mitigation:

- normalize search terms
- evaluate PostgreSQL full-text search and trigram indexes
- preserve original labels

## 11. Geographic Data Is Not Yet Defined

Map visualizations require stable geographic codes and boundary files.

Mitigation:

- keep geography as a generic dimension initially
- do not infer geographic mappings from labels only
- request official ANSADE codes and boundary data

## 12. SDMX Export Is Not Yet Specified

Generating valid SDMX requires data structures, code lists, concepts, and metadata beyond simple tables.

Mitigation:

- do not claim SDMX compliance in the first release
- keep normalized dimensions compatible with future SDMX mapping
- document required SDMX artifacts separately

## 13. Inspiration Images May Conflict

Images in `Inso` may use inconsistent styles.

Mitigation:

- extract common design principles
- define one coherent design system
- do not combine every visual pattern blindly

## 14. No User Authentication in Initial Scope

Favorites and saved views may initially use local storage.

Mitigation:

- abstract persistence
- avoid coupling saved views directly to browser APIs
- prepare a future account-backed repository

## 15. No Verified PostgreSQL Instance in Stage 2

The source-ID-preserving schema, migration, and development seed now exist, but no real isolated PostgreSQL credentials were available in this development session.

Mitigation:

- keep credentials in ignored local environment files
- use placeholders only in `.env.example`
- apply the committed migration to a disposable local/test PostgreSQL instance before using the seed
- run database integration tests when an isolated `DATABASE_URL` is supplied
- do not report database readiness before a verified connection is available

## 16. Health Endpoint Is Liveness-Only

`/api/health` confirms that the Next.js process is responding but returns `database: "not-checked"`.

Mitigation:

- keep the response explicit so it cannot be mistaken for database readiness
- add a database-backed readiness check when deployment health behavior is implemented
- avoid exposing connection details in health responses

## 17. Browser Verification Depends on the Execution Environment

The Stage 1 Playwright smoke suite is configured, but the current Codex session did not expose an in-app browser surface, so visual and browser runtime checks could not execute here.

Mitigation:

- keep desktop and mobile Playwright coverage in `e2e/foundation.spec.ts`
- run `npx playwright install chromium` and `npm run test:e2e` in CI or a browser-enabled environment
- retain unit/component coverage for navigation behavior independently of browser availability

## 18. Inspiration Folder Name Differs from Documentation

The documentation names `Inso/`, while the checked-in directory is `inspo/`.

Mitigation:

- treat the existing lowercase folder as the authoritative reference location for now
- use consistent casing in a future repository cleanup, particularly for case-sensitive deployment systems

## 19. Patched Transitive Dependency Overrides

The current Next.js and Prisma dependency trees initially resolved transitive packages covered by npm advisories.

Mitigation:

- pin patched `effect`, `postcss`, and `sharp` versions through narrow npm overrides
- keep `npm audit` at zero known vulnerabilities during dependency updates
- remove each override after its direct parent package adopts a patched compatible range

## 20. Hybrid Observation Coordinates Require Transactional Consistency

Each observation stores both canonical JSON coordinates and normalized dimension-value links. PostgreSQL validates the relational links and coordinate hash format but cannot prove that the JSON codes describe exactly the same links.

Mitigation:

- generate JSON, links, and the checksum from one normalized coordinate in Stage 3
- write all coordinate representations in one transaction
- add importer integrity tests that reconstruct and compare both representations
- reject duplicate `(datasetId, coordinateHash)` values

## 21. Decimal-to-JavaScript Precision Boundary

PostgreSQL stores observations as `DECIMAL(30,10)`, while the current domain contract exposes `number | null`. Some valid database decimals cannot be represented exactly as JavaScript numbers.

Mitigation:

- always preserve `rawValue`
- require Stage 4 mappers to check range and precision before conversion
- surface unsafe conversion as data-quality information rather than silently rounding
- revisit a decimal-string domain representation if real ANSADE values exceed safe numeric limits

## 22. Prisma Does Not Represent Every PostgreSQL Check

The initial migration contains check constraints for JSON shapes, hashes, source-reference targets, counters, and revision numbers that are not represented directly in `schema.prisma`.

Mitigation:

- keep schema tests that assert the custom constraints remain in the migration
- review generated migrations for accidental constraint loss
- use additive SQL migrations for future custom checks
- document the checks in `docs/database-model.md`

## 23. Source Scope Convention Awaits Real Payloads

`SourceReference.sourceScope` allows identifiers that repeat below a parent, but the exact stable scope format depends on real source payloads.

Mitigation:

- define scope construction inside Stage 3 source adapters
- prefer stable parent source IDs rather than labels
- preserve fixtures for every discovered source-scoping rule
- never expose scope construction to UI or domain services

## 24. Prisma CLI and Workspace Diagnostics Disagree on Datasource URLs

The installed Prisma 6 CLI validates the schema only when `DATABASE_URL` is available in the execution environment, while the workspace diagnostic currently flags the schema datasource URL as unsupported.

Mitigation:

- keep the datasource URL in `prisma/schema.prisma` for CLI compatibility
- provide `DATABASE_URL` in local or CI environments before running Prisma commands
- treat the workspace diagnostic as a tooling warning unless the Prisma toolchain is upgraded end-to-end

## 25. Stage 3 Still Uses a Checked-In Sample Source

The importer can normalize and persist a representative ANSADE-like payload, but it still reads from the hardcoded sample source in `src/infrastructure/importers/stage-3/sample-source.ts`.

Mitigation:

- keep the sample source for deterministic tests
- replace it with real fetch/file adapters in Stage 4 and Stage 5 work
- preserve the same normalized output shape so the frontend and repositories do not need to change later
