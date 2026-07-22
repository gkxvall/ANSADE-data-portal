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
