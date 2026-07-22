# ANSADE Statistical Data Explorer — Project Idea

## 1. Project Vision

The project is a modern statistical data exploration platform for ANSADE. It will present the existing hierarchy of **categories → themes → tables** through a clean, responsive interface with search, filtering, dynamic tables, charts, comparisons, and downloadable outputs.

The first version will use a static PostgreSQL snapshot imported from the existing ANSADE portal. The application must be designed from the beginning so the static data provider can later be replaced by a live API provider without changing the user interface or core business logic.

The project is not a clone of the current portal. It is a new visualization and exploration layer focused on usability, performance, discoverability, and future API compatibility.

## 2. Core Principles

- The frontend must never depend directly on the source portal response format.
- All imported data must be normalized into an internal domain model.
- Categories, themes, datasets, dimensions, observations, metadata, and source information must be stored separately.
- The project must preserve original ANSADE source identifiers.
- Storage access must go through repository interfaces.
- The system must support static PostgreSQL now and API-backed repositories later.
- Visualizations must be generated from normalized observations rather than hard-coded chart structures.
- Every stage must end with working, testable code and updated documentation.
- The `Inso` folder contains visual inspiration only. It must guide the design without being copied literally.

## Stage 1 — Foundation and Project Setup

Create a production-quality Next.js project using TypeScript, the App Router, PostgreSQL, Prisma, Tailwind CSS, ESLint, Prettier, and Vitest.

Establish the project structure, environment variables, database connection, application configuration, validation utilities, and documentation workflow.

Create an initial shell with a header, sidebar, main content area, loading states, error boundaries, and responsive behavior. At this stage, use placeholder data only to prove the layout and architecture.

Deliverables:

- Next.js TypeScript project
- PostgreSQL and Prisma setup
- Environment variable validation
- Base application layout
- Shared design tokens
- Basic error and loading states
- Updated README
- Stage report

## Stage 2 — Domain Model and Database Schema

Define a stable internal domain model that is independent of both static files and any future external API.

The database must represent:

- categories
- themes
- datasets/tables
- dimensions
- dimension values
- observations
- metadata
- source references
- import runs
- data revisions

Preserve ANSADE source IDs as dedicated fields rather than replacing them with generated IDs only.

Build Prisma models, migrations, indexes, uniqueness constraints, and validation rules. Add seed data for development.

Deliverables:

- Prisma schema
- Initial migration
- Development seed
- Domain TypeScript types
- Mapping rules between database and domain models
- Database relationship documentation

## Stage 3 — Source Importer and Static Snapshot Pipeline

Build an importer that retrieves or consumes exported ANSADE portal data and transforms it into the internal model.

The importer must support categories, themes, table metadata, table structures, and observations. It must flatten nested table-oriented source data into normalized observations.

The import process must be repeatable and idempotent. Running it twice with unchanged source data must not create duplicates.

The pipeline must:

1. Load categories.
2. Load themes.
3. Load tables.
4. Keep published or explicitly selected tables.
5. retrieve each table structure.
6. Normalize values and dimensions.
7. Validate foreign-key relationships.
8. Store source timestamps and checksums.
9. Write an import summary.
10. Record failures without losing successful imports.

Deliverables:

- Import scripts
- Source adapters
- Normalizers
- Data validators
- Checksum and revision logic
- Import-run audit records
- Sample imported dataset
- Import documentation

## Stage 4 — Repository and Provider Abstraction

Create interfaces that isolate the application from the storage source.

Required abstractions:

- CategoryRepository
- ThemeRepository
- DatasetRepository
- ObservationRepository
- SearchRepository
- StatisticsProvider

Implement a PostgreSQL-backed provider first. Also create a future API provider skeleton with mapping boundaries and explicit `NotImplemented` behavior where the API contract is unknown.

The application must choose its provider through configuration, for example:

```env
DATA_SOURCE=postgres
```

Future configuration:

```env
DATA_SOURCE=api
ANSADE_API_BASE_URL=https://api.portail.ansade.mr/api
```

No page or UI component may import Prisma directly.

Deliverables:

- Repository interfaces
- PostgreSQL implementations
- Provider factory
- API-provider skeleton
- Unit tests for repository behavior
- Architecture rule preventing direct data access from UI components

## Stage 5 — Catalogue, Navigation, and Search

Build the complete browsing hierarchy:

```text
Categories → Themes → Datasets → Dataset Explorer
```

Create pages for:

- all categories
- category details
- theme details
- dataset catalogue
- dataset details
- global search

Search must cover dataset titles, descriptions, sources, categories, themes, indicators, and available metadata.

Add sorting, pagination, recently viewed datasets, breadcrumbs, empty states, and shareable URLs.

Deliverables:

- Category and theme browsing
- Dataset catalogue
- Search service
- Search page
- Pagination and sorting
- Breadcrumb navigation
- Responsive catalogue cards and tables

## Stage 6 — Interactive Dataset Explorer

Create the main dataset workspace.

The explorer must include:

- metadata header
- source and update information
- dynamic dimension filters
- interactive data table
- sorting and searching within observations
- hide/show columns
- pagination or virtualization for large datasets
- saved filter state in the URL
- reset filters
- data-quality labels
- raw-value display where numeric parsing fails

The interface must derive available filters from the dataset dimensions instead of relying on table-specific code.

Deliverables:

- Reusable Dataset Explorer
- Dynamic filter generation
- Interactive table
- URL-based state
- Large-data handling
- Dataset metadata panel

## Stage 7 — Visualizations and Comparisons

Add reusable visualizations generated from the normalized observation model.

Support at minimum:

- line charts
- bar charts
- area charts
- pie or donut charts where appropriate
- scatter plots where dimensions permit
- KPI cards
- comparison view

Users must be able to choose dimensions for the x-axis, series, grouping, and values. The system must prevent invalid chart configurations and explain why a chart type is unavailable.

Add a comparison mode for comparing periods, indicators, categories, or geographic entities where the data supports it.

Deliverables:

- Chart configuration engine
- Reusable chart components
- Chart/table synchronization
- Comparison workspace
- Accessible legends and tooltips
- PNG and SVG export where supported

## Stage 8 — Exports, Saved Views, and User Productivity

Add tools that make the portal useful for analysts and decision-makers.

Features:

- CSV export
- Excel export
- JSON export
- printable report view
- chart image export
- saved views
- favorite datasets
- recently viewed datasets
- shareable filtered links
- custom dashboard draft support

Authentication may remain optional in the initial version. Saved views and favorites may use browser storage first, but the code must isolate persistence so a user-account backend can replace it later.

Deliverables:

- Export services
- Saved-view model
- Favorites
- Recent history
- Share links
- Print-friendly layouts

## Stage 9 — Administration, Import Monitoring, and Data Quality

Build an internal administration area for monitoring the static snapshot and future synchronization process.

Show:

- number of categories, themes, datasets, and observations
- last successful import
- failed imports
- changed datasets
- new, updated, and removed observations
- source update timestamps
- checksum results
- validation warnings
- orphaned records
- manual re-import controls for development

The system must maintain a revision trail where feasible.

Deliverables:

- Admin dashboard
- Import-run history
- Dataset revision summary
- Validation reports
- Safe manual import action
- Health endpoint

## Stage 10 — Production Hardening and API Migration Readiness

Prepare the project for deployment and future live API integration.

Tasks:

- security review
- accessibility review
- performance profiling
- caching strategy
- database index review
- error monitoring hooks
- structured logging
- deployment configuration
- backup and restore notes
- API-provider implementation guide
- migration checklist from PostgreSQL snapshot to live API

Prove API readiness by replacing the PostgreSQL provider with a mock API provider in automated contract tests. The same pages and application services must function without modification.

Deliverables:

- Production configuration
- Deployment documentation
- Provider contract tests
- Performance report
- Accessibility report
- Security checklist
- API migration runbook
- Final project report

## Expected Final Result

The completed system will be a modern ANSADE statistical intelligence portal with:

- structured category and theme navigation
- searchable datasets
- interactive filters
- responsive data tables
- reusable charts
- comparison tools
- exports
- saved views
- data-quality indicators
- import monitoring
- a PostgreSQL static snapshot
- a clean provider boundary for future live API integration

The most important architectural outcome is that switching from static PostgreSQL data to an API must require changes only in the provider and adapter layers—not in pages, charts, filters, or application services.
