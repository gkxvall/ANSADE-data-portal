# Stage 06 Report — Interactive Dataset Explorer

## Status and scope

Stage 6 is implemented. The dataset detail page now includes an interactive explorer with dynamic dimension filters, URL-synced search and sort controls, hide/show dimension columns, pagination, data-quality labels, and raw-value fallbacks.

## What was implemented

- a dataset explorer model built from normalized observations and dataset dimensions
- dynamic filters derived from loaded dimension values
- searchable and sortable observation tables
- hide/show dimension column controls
- URL-synced page state for filters, sorting, chart selection, and pagination
- raw-value display when numeric parsing is unavailable
- data-quality labels for observations
- comparison of filtered groups through a dedicated workspace area
- browser-side SVG and PNG summary export

## How it works

The dataset page now loads the dataset metadata and observation list from the repository boundary, serializes them into a client-safe explorer model, and passes that model to a client component. The explorer derives available filters directly from the dataset dimensions and observation coordinates rather than relying on table-specific UI code.

Filtering happens in the browser against the loaded observation set. Sorting, pagination, and column visibility are also kept in the URL so the current view can be shared and revisited.

## Important decisions

### Derive filters from dimensions

The explorer builds filter options from the dataset’s loaded dimension keys and coordinate values. That keeps the UI generic and avoids table-specific logic.

### Keep state shareable

Explorer state is encoded in the route query string, so a filtered dataset view can be bookmarked or shared without a separate saved-view backend yet.

### Preserve raw values

The explorer always shows the parsed numeric value when available, but it falls back to the raw string and a data-quality label when numeric parsing fails.

## Files created or changed

- `src/application/datasets/explorer.ts`
- `src/application/datasets/explorer.test.ts`
- `src/components/datasets/dataset-explorer.tsx`
- `src/app/datasets/[slug]/page.tsx`
- `src/application/catalogue/queries.ts`

## How to run and test

Run the validation suite:

```bash
npm run typecheck
npm run lint
npm test
```

Open the explorer locally with:

```bash
npm run dev
```

## Verification results

| Check      | Result                |
| ---------- | --------------------- |
| TypeScript | Passed                |
| ESLint     | Passed, zero warnings |
| Vitest     | Passed                |

## Limitations and risks

- The explorer currently works on the loaded observation set and uses browser-side pagination rather than server-side virtualized streaming.
- Export is implemented as browser-generated SVG and PNG summaries rather than a full chart-image pipeline.
- The explorer is generic, so some chart types are only available when the selected dimensions and values support them.

## Preparation for Stage 7

The explorer now has the right observation model, filter state, and table synchronization points for richer visualizations and comparison views.
