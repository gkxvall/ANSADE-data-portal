# ANSADE Statistical Data Explorer

A modern statistical data exploration platform for ANSADE, built with Next.js, TypeScript, PostgreSQL, Prisma, Tailwind CSS, Zod, Recharts, Vitest, and Playwright.

The project is designed to import, normalize, store, and eventually visualize ANSADE statistical datasets while keeping the application independent from any one source format. The frontend is intended to work with PostgreSQL today and transition later to a live ANSADE API provider without requiring major changes to the user interface.

> **Current status:** the project foundation, normalized database model, Stage 3 sample import pipeline, Stage 4 provider abstraction, Stage 5 catalogue/search pages, Stage 6 dataset explorer, and Stage 7 chart/comparison workspace are implemented. The importer still uses a checked-in sample source rather than a live ANSADE export, but the UI now reads catalog data through repository services instead of importing Prisma directly.

---

## Project goals

The final platform is intended to provide:

- a browsable hierarchy of categories, themes, and statistical tables;
- searchable and filterable datasets;
- interactive statistical tables;
- line, bar, area, pie, and other data visualizations;
- multidimensional filtering by time, geography, sex, indicator, and other dimensions;
- dataset metadata, source information, publication dates, and update dates;
- CSV, Excel, JSON, image, and report exports;
- revision tracking and data provenance;
- a clean separation between the user interface and the underlying data provider;
- support for moving from imported static snapshots to a live ANSADE API.

---

## Current implementation

### Application foundation

The repository currently includes:

- Next.js App Router;
- strict TypeScript configuration;
- React 19;
- Tailwind CSS;
- a responsive French-first application shell;
- reusable design tokens;
- global loading, error, and not-found states;
- a health endpoint at `/api/health`;
- environment-variable validation using Zod;
- ESLint and Prettier;
- Vitest and React Testing Library;
- Playwright configuration.

### Repository and provider abstraction

The application now reads catalog data through a provider boundary instead of importing Prisma from UI components. The configured provider is selected with `DATA_SOURCE`, and the current supported implementations are:

- PostgreSQL-backed repositories for the imported snapshot;
- a mock provider for local and test-only catalogue data;
- a future API-provider skeleton that fails explicitly until the live contract is defined.

Presentation code is still blocked from importing Prisma directly.

### Catalogue and search UI

The UI now includes:

- a home page with catalogue entry points;
- category listing and detail pages;
- theme detail pages;
- a dataset catalogue with pagination and sorting;
- a dataset detail page;
- a global search page;
- breadcrumbs and recently viewed datasets.

### Dataset explorer

The dataset detail page now includes an interactive explorer with:

- dynamic dimension filters derived from the loaded dataset;
- URL-synced search, sort, pagination, and chart state;
- hide/show dimension columns;
- raw-value fallbacks and data-quality labels;
- a comparison workspace;
- browser-side SVG and PNG summary export.

### Visualizations and comparisons

The explorer now renders reusable chart panels for:

- bar charts;
- line charts;
- area charts;
- pie charts;
- scatter charts when the selected axes are numeric;
- KPI cards.

The chart view and table stay synchronized through the same filtered observation set.

### Database foundation

The PostgreSQL database is modeled through Prisma and supports:

```text
Category
  └── Theme
       └── Dataset
            ├── Dataset metadata
            ├── Dimensions
            │    └── Dimension values
            ├── Observations
            ├── Source references
            ├── Import issues
            └── Dataset revisions
```

The schema preserves:

- source-system identifiers;
- source update and publication timestamps;
- original raw values;
- normalized numeric values;
- observation coordinates;
- checksums;
- import history;
- revision history;
- publication status;
- source provenance.

### Stage 3 import pipeline

The current import pipeline performs the following operations:

```text
Sample TypeScript source
        ↓
Zod validation
        ↓
Source normalization
        ↓
Checksum and stable-ID generation
        ↓
Prisma transaction
        ↓
PostgreSQL
```

It supports:

- validation of categories, themes, datasets, dimensions, and rows;
- conversion from source-specific fields to the internal domain model;
- idempotent upserts;
- matching records through `sourceSystem` and `sourceId`;
- matching observations through dataset ID and coordinate hash;
- persistence of observation-to-dimension-value join rows;
- import-run tracking;
- warning and error persistence;
- dataset checksum comparison;
- dataset revision creation when data changes.

Run the current sample importer with:

```bash
npm run import:stage3
```

### Stage 5 browsing flow

The current browse hierarchy is:

```text
Accueil
    ├── Catégories
    │    └── Détail de catégorie
    ├── Thèmes
    │    └── Détail de thème
    ├── Jeux de données
    │    └── Détail de jeu de données
    └── Recherche globale
```

These pages are backed by application query helpers and repository interfaces, not by direct Prisma imports in presentation code.

---

## Important data-status notice

The current importer does **not** retrieve data from:

- `https://portail.ansade.mr`;
- `https://api.portail.ansade.mr`;
- an Excel workbook;
- a CSV export;
- an SDMX source;
- a remote database.

It currently imports a hardcoded development source located at:

```text
src/infrastructure/importers/stage-3/sample-source.ts
```

The sample source exists only to test validation, normalization, PostgreSQL persistence, import issues, revision behavior, and observation-dimension-value joins.

It must not be treated as official ANSADE data.

Some sample records are intentionally incomplete or invalid so the importer can demonstrate partial-import and issue-reporting behavior. The sample also contains generic placeholder geography values that are not suitable for production use.

---

## Current frontend behavior

The frontend now renders a working catalogue surface and an interactive dataset explorer.

It currently does not yet:

- provide persisted saved views or favorites;
- expose admin import monitoring.

Running the importer populates PostgreSQL, and the browse pages now display imported catalogue records through repository services. The dataset detail page also renders filters, charts, comparison cards, and browser-side export actions.

The runtime is currently:

```text
Sample source
    ↓
Importer
    ↓
PostgreSQL repository
    ↓
Application query helpers
    ↓
Catalogue, search, and dataset explorer pages
```

---

## Known implementation gap

The Prisma schema includes a relational join model connecting observations to dimension values:

```text
Observation
    ↓
ObservationDimensionValue
    ↓
DimensionValue
```

This now exists in the Stage 3 importer as part of the sample normalization pipeline, but the imported data still comes from the checked-in development fixture rather than a real ANSADE export.

Observation coordinates remain stored as JSON alongside the normalized join rows, which keeps the sample pipeline ready for later filtering and faceted search work.

---

## Architecture

The project follows a layered architecture:

```text
Presentation
    ↓
Application
    ↓
Domain

Infrastructure
    ↓
Domain
```

### Presentation

Located primarily in:

```text
src/app
src/components
```

Responsibilities:

- pages;
- layouts;
- visual components;
- user interaction;
- loading and error states.

Presentation code must not directly import Prisma or source-specific adapters.

### Application

Responsibilities:

- use cases;
- catalogue queries;
- dataset exploration;
- filter orchestration;
- export orchestration;
- repository interfaces.

### Domain

Responsibilities:

- normalized statistical entities;
- provider-independent types;
- business rules;
- validation contracts.

The domain layer must not depend on Next.js, React, Prisma, or ANSADE-specific API fields.

### Infrastructure

Located primarily in:

```text
src/infrastructure
```

Responsibilities:

- Prisma;
- PostgreSQL access;
- importers;
- source adapters;
- checksums;
- source normalization;
- future API providers.

---

## Data-provider model

The application depends on a stable repository contract rather than directly reading static files or calling an API from UI components.

The current provider transition is:

```text
Current
PostgreSQL repository
        ↓
Application services
        ↓
UI

Future
ANSADE API adapter
        ↓
Normalized domain model
        ↓
Same application services
        ↓
Same UI
```

The UI should never depend directly on ANSADE source fields such as:

```text
nom_cat
nom_theme
id_table
coordonnees
valeur_numerique
```

Those fields must be transformed by an adapter into the stable internal domain model.

---

## Technology stack

| Area               | Technology            |
| ------------------ | --------------------- |
| Framework          | Next.js               |
| Language           | TypeScript            |
| UI                 | React                 |
| Styling            | Tailwind CSS          |
| Database           | PostgreSQL            |
| ORM                | Prisma                |
| Validation         | Zod                   |
| Tables             | TanStack Table        |
| Charts             | Recharts              |
| Unit testing       | Vitest                |
| Component testing  | React Testing Library |
| End-to-end testing | Playwright            |
| Formatting         | Prettier              |
| Linting            | ESLint                |

---

## Requirements

- Node.js 22 or newer;
- npm 10 or newer;
- PostgreSQL 15 or newer.

---

## Local setup

Clone the repository:

```bash
git clone https://github.com/gkxvall/ANSADE-data-portal.git
cd ANSADE-data-portal
```

Install dependencies:

```bash
npm ci
```

Create the local environment file:

```bash
cp .env.example .env
```

Configure PostgreSQL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
DATA_SOURCE="postgres"
NEXT_PUBLIC_APP_NAME="ANSADE Statistical Data Explorer"
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

Validate the Prisma schema:

```bash
npm run prisma:validate
```

Apply committed migrations:

```bash
npm run prisma:migrate:deploy
```

Optionally load the development fixture:

```bash
npm run prisma:seed
```

Run the Stage 3 sample importer:

```bash
npm run import:stage3
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Health endpoint:

```text
http://localhost:3000/api/health
```

---

## Environment variables

| Variable               |                    Required | Visibility  | Current use                                  |
| ---------------------- | --------------------------: | ----------- | -------------------------------------------- |
| `DATABASE_URL`         | Yes for database operations | Server only | PostgreSQL and Prisma connection             |
| `DATA_SOURCE`          |                          No | Server only | Currently expected to be `postgres`          |
| `ANSADE_API_BASE_URL`  |                          No | Server only | Reserved for a future API provider           |
| `ANSADE_API_TOKEN`     |                          No | Server only | Reserved for future authenticated API access |
| `NEXT_PUBLIC_APP_NAME` |                          No | Public      | Application display name                     |

Never commit production credentials or `.env` files.

---

## Available commands

### Development

```bash
npm run dev
npm run build
npm run start
```

### Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:coverage
```

### End-to-end tests

```bash
npx playwright install chromium
npm run test:e2e
```

### Prisma

```bash
npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate:deploy
npm run prisma:seed
```

### Import

```bash
npm run import:stage3
```

---

## Next implementation priorities

### 1. Complete observation-dimension persistence

Persist `ObservationDimensionValue` records for every normalized observation coordinate.

This should happen inside the same import transaction as observations and dimension values.

### 2. Replace the sample source with a real snapshot importer

Implement readers for one or more approved sources:

- downloaded JSON;
- CSV;
- Excel;
- SDMX;
- an official ANSADE export.

The source reader should produce the existing raw Stage 3 format or a new source-specific adapter should normalize directly into the same internal import model.

### 3. Add a PostgreSQL repository

Implement server-only query methods for:

- categories;
- themes;
- datasets;
- metadata;
- dimensions;
- dimension values;
- observations;
- import status;
- revision history.

### 4. Connect the UI to application services

Replace the static foundation content with:

```text
Server component
    ↓
Application service
    ↓
Statistics repository
    ↓
Prisma
    ↓
PostgreSQL
```

### 5. Build the catalogue hierarchy

Implement:

```text
Categories
    ↓
Themes
    ↓
Datasets
    ↓
Dataset explorer
```

### 6. Build the dataset explorer

Add:

- multidimensional filters;
- interactive tables;
- chart selection;
- metadata;
- source and update information;
- empty states;
- loading states;
- export actions.

### 7. Add a future API provider

When an official API contract is available:

```text
ANSADE API response
        ↓
API adapter
        ↓
Normalized domain model
        ↓
Existing application services
        ↓
Existing UI
```

Switching providers should be controlled through configuration rather than a frontend rewrite.

---

## Data integrity principles

All future imports should follow these rules:

1. Preserve source IDs.
2. Preserve source publication and update timestamps.
3. Preserve raw values alongside parsed numerical values.
4. Never invent official data.
5. Reject or report incomplete coordinates.
6. Validate parent relationships.
7. Use checksums to detect revisions.
8. Keep an import-run history.
9. Keep source provenance.
10. Make partial imports visible and auditable.
11. Do not expose sample fixtures as official statistics.
12. Keep the UI independent from source-specific field names.

---

## Documentation

Project documentation is located in:

```text
docs/
```

Important files include:

- `docs/idea.md`;
- `docs/specs.md`;
- `docs/architecture.md`;
- `docs/tasks.md`;
- `docs/testing.md`;
- `docs/database-model.md`;
- `docs/known-issues.md`;
- `docs/ui-inspiration.md`;
- `docs/reports/`.

---

## Current-state summary

| Capability                     | Status          |
| ------------------------------ | --------------- |
| Next.js application foundation | Implemented     |
| TypeScript and linting         | Implemented     |
| Responsive structural UI       | Implemented     |
| PostgreSQL and Prisma          | Implemented     |
| Normalized statistical schema  | Implemented     |
| Sample source validation       | Implemented     |
| Sample normalization           | Implemented     |
| Idempotent import upserts      | Implemented     |
| Import history                 | Implemented     |
| Revision tracking              | Implemented     |
| Real ANSADE data retrieval     | Not implemented |
| Portal scraping                | Not implemented |
| Official API integration       | Not implemented |
| CSV/Excel import               | Not implemented |
| PostgreSQL repository for UI   | Not implemented |
| Catalogue pages                | Not implemented |
| Dataset explorer               | Not implemented |
| Interactive charts             | Not implemented |
| Scheduled synchronization      | Not implemented |
| Observation-dimension joins    | Incomplete      |

---

## Disclaimer

This repository is under active development.

The current imported sample data is for development and testing only. It must not be presented as official ANSADE statistics. Production deployment should not occur until approved source data, data-validation rules, repository queries, security controls, and complete end-to-end tests are in place.
