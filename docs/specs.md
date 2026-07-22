# Project Specifications

## Product Name

Working title: **ANSADE Statistical Data Explorer**

## Technology Stack

- TypeScript
- Next.js with App Router
- React
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- Zod
- TanStack Table
- Apache ECharts or Recharts
- Vitest
- React Testing Library
- Playwright
- ESLint
- Prettier

Codex must not replace this stack without a documented technical reason and explicit approval.

## Functional Requirements

### Data hierarchy

The application must support:

```text
Category
  └── Theme
       └── Dataset/Table
            ├── Dimensions
            ├── Observations
            └── Metadata
```

### Catalogue

- List all categories.
- Show themes belonging to a category.
- Show datasets belonging to a theme.
- Search datasets globally.
- Sort and paginate dataset results.
- Display dataset source and last-update information.

### Dataset explorer

- Generate filters from dataset dimensions.
- Display observations in a dynamic table.
- Support column visibility.
- Support sorting and pagination.
- Persist filters in the URL.
- Display metadata and source information.
- Show useful empty, loading, and error states.

### Visualizations

- Support line, bar, area, pie/donut, and scatter charts where valid.
- Allow users to select dimensions for axes and series.
- Keep charts synchronized with active filters.
- Export charts as image files when supported.
- Reject invalid chart configurations gracefully.

### Exports

- CSV
- XLSX
- JSON
- printable report
- chart image

### Import system

- Import categories, themes, datasets, and observations.
- Preserve source IDs.
- Normalize nested data.
- Prevent duplicate imports.
- Record import runs.
- Record warnings and failures.
- Compute source checksums.
- Store source update timestamps.

### Provider abstraction

The application must support interchangeable providers:

- PostgreSQL snapshot provider
- future ANSADE API provider
- mock provider for testing

UI components must never access Prisma or external APIs directly.

## Non-Functional Requirements

### Performance

- Catalogue pages should render quickly with server-side queries.
- Large tables must use pagination or virtualization.
- Database queries must use indexes.
- Avoid loading every observation into the browser.
- Cache stable metadata where appropriate.

### Accessibility

- Meet WCAG 2.1 AA where practical.
- Keyboard-accessible navigation.
- Proper labels and semantic HTML.
- Sufficient contrast.
- Charts must include textual context or table alternatives.

### Security

- Keep database credentials server-side.
- Validate all environment variables.
- Validate request parameters with Zod.
- Never expose external API credentials to the browser.
- Prevent SQL injection through ORM-safe queries.
- Avoid rendering unsafe HTML.
- Rate-limit expensive endpoints when deployed publicly.

### Reliability

- Graceful handling of malformed observations.
- Preserve raw source values.
- Partial importer failures must be recorded.
- Successful imports must not be rolled back because one unrelated dataset failed unless strict mode is enabled.

### Maintainability

- Strong TypeScript typing.
- Small focused modules.
- Clear repository and service boundaries.
- No duplicated transformation logic.
- Public functions documented where intent is not obvious.
- Tests for critical data mappings.

## Database Requirements

Minimum entities:

- Category
- Theme
- Dataset
- Dimension
- DimensionValue
- Observation
- DatasetMetadata
- SourceReference
- ImportRun
- ImportIssue
- DatasetRevision

Recommended indexes:

- theme.categoryId
- dataset.themeId
- dataset.sourceId
- dataset.updatedAt
- observation.datasetId
- observation.dimension signature or lookup fields
- full-text search fields where supported

## Routing Requirements

Suggested routes:

```text
/
/categories
/categories/[categoryId]
/themes/[themeId]
/datasets
/datasets/[datasetId]
/search
/compare
/admin
/admin/imports
```

## Environment Variables

```env
DATABASE_URL=
DATA_SOURCE=postgres
ANSADE_API_BASE_URL=
ANSADE_API_TOKEN=
NEXT_PUBLIC_APP_NAME=ANSADE Statistical Data Explorer
```

API credentials must remain optional until the API provider is implemented.

## Definition of Done

A stage is complete only when:

- implementation works
- tests pass
- linting passes
- types pass
- documentation is updated
- no stage-specific placeholder remains unless documented
- a stage report is written
- known issues are updated
