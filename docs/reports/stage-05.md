# Stage 05 Report — Catalogue, Navigation, and Search

## Status and scope

Stage 5 is implemented. It adds the browse hierarchy, breadcrumb navigation, pagination, recently viewed datasets, and a global search page on top of the Stage 4 provider boundary.

## What was implemented

- a catalogue home page with entry points into the browse flow
- category listing and category detail pages
- theme detail pages
- dataset catalogue listing with pagination and sorting controls
- dataset detail pages with metadata, dimensions, and sample observations
- a global search page that covers catalogue titles, descriptions, sources, categories, themes, and metadata
- breadcrumb navigation across the browse hierarchy
- responsive catalogue cards and table layouts
- recently viewed datasets stored locally in the browser
- application query helpers that keep the pages independent from Prisma

## How it works

The browse flow is driven by the repository boundary introduced in Stage 4. Each page loads a model through application query helpers and then renders cards, tables, breadcrumbs, and detail panels from normalized catalog data.

The dataset catalogue supports query-string based search, sorting, and pagination. The dataset detail page surfaces metadata and a small sample of observations, while the home page and category/theme pages provide navigation into the hierarchy.

## Important decisions

### Keep the browse flow server-driven

The pages fetch their data in the server component layer and receive normalized catalogue models from application helpers. This keeps route code simple and preserves the Stage 4 separation from database infrastructure.

### Keep recently viewed state local

Recently viewed datasets are stored in `localStorage` so the UI can provide lightweight history without introducing account persistence before Stage 8.

### Keep search aligned with catalog data

Search is not a separate one-off index yet. It uses the same repository model as the catalogue pages so the result shapes stay consistent with the browse hierarchy.

## Files created or changed

- `src/app/page.tsx`
- `src/app/categories/page.tsx`
- `src/app/categories/[slug]/page.tsx`
- `src/app/themes/[slug]/page.tsx`
- `src/app/datasets/page.tsx`
- `src/app/datasets/[slug]/page.tsx`
- `src/app/search/page.tsx`
- `src/application/catalogue/queries.ts`
- `src/components/catalogue/*.tsx`
- `src/components/layout/app-shell.tsx`
- `src/components/layout/app-shell.test.tsx`
- `docs/reports/stage-05.md`

## How to run and test

Run the core checks:

```bash
npm run typecheck
npm run lint
npm test
```

Browse the catalogue locally with:

```bash
npm run dev
```

## Verification results

| Check      | Result                |
| ---------- | --------------------- |
| TypeScript | Passed                |
| ESLint     | Passed, zero warnings |

## Limitations and risks

- Search is repository-driven but still simple and not yet optimized for large-scale relevance ranking.
- The dataset detail page shows sample observations only; the full interactive explorer belongs to Stage 6.
- Recently viewed datasets are browser-local and will not follow a user across devices.

## Preparation for Stage 6

The application now has stable browse entry points and catalogue models. Stage 6 can build the dataset explorer on top of the dataset detail route without reworking navigation or repository wiring.
