# Testing Strategy

## Goals

Testing must prove that:

- imported data is normalized correctly
- hierarchy relationships remain valid
- repositories are interchangeable
- UI filters produce correct queries
- charts reflect the same filtered observations as tables
- static PostgreSQL mode can later be replaced by API mode

## Test Types

### Unit tests

Use Vitest for:

- number parsing
- date parsing
- dimension normalization
- table flattening
- checksum generation
- slug generation
- chart configuration validation
- export transformations
- repository utility functions

### Repository contract tests

Define one shared test suite and run it against:

- PostgreSQL repository
- mock repository
- future API repository

Required contract behaviors:

- stable IDs
- deterministic pagination
- consistent not-found behavior
- identical domain output shapes
- normalized null handling
- search behavior
- filtering behavior

### Integration tests

Test:

- importer to PostgreSQL
- category-theme-dataset relationships
- idempotent imports
- source revision detection
- dataset query endpoints
- export endpoints
- import failure recording

Use an isolated test database.

### Component tests

Use React Testing Library for:

- category cards
- dataset cards
- search controls
- dynamic filters
- table states
- metadata panels
- chart configuration controls
- empty and error states

### End-to-end tests

Use Playwright for critical journeys:

1. Open categories.
2. Select a category.
3. Open a theme.
4. Open a dataset.
5. Apply filters.
6. Confirm table updates.
7. Switch visualization.
8. Export filtered data.
9. Copy a shareable URL.
10. Reload and confirm state restoration.

Admin journey:

1. Open import dashboard.
2. Review the latest import.
3. Inspect an issue.
4. Confirm dataset counts.

## Importer Test Fixtures

Create fixtures for:

- simple flat table
- grouped columns
- nested indicators
- percentages
- comma decimals
- spaces in numbers
- missing values
- non-numeric symbols
- duplicate observations
- missing parent theme
- changed source record
- removed source record
- malformed table response

## Data Integrity Tests

Every import should verify:

- each theme has a category
- each dataset has a theme
- each observation has a dataset
- source IDs are unique within their source type
- checksums are deterministic
- no duplicate observation coordinate exists unless revisions are supported explicitly
- numeric and raw values are preserved correctly

## Performance Tests

Measure:

- catalogue query time
- full-text search time
- dataset metadata load time
- filtered observation query time
- large export generation time
- importer throughput

Create at least one large synthetic dataset to test pagination and visualization limits.

## Accessibility Tests

Check:

- keyboard navigation
- focus visibility
- form labels
- table semantics
- heading order
- contrast
- chart alternatives
- screen-reader announcements for loading and errors

## Security Tests

Check:

- malformed route parameters
- invalid filter parameters
- unauthorized admin access when authentication is introduced
- secret leakage
- dangerous CSV formula values
- export filename sanitization
- oversized query limits

## Stage Completion Checks

Before declaring a stage complete, Codex must run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Run Playwright tests for stages that change user journeys.

## Final Acceptance Tests

The final project passes when:

- a dataset can be imported from a representative ANSADE source fixture
- it appears under the correct category and theme
- it can be searched
- it can be filtered
- the table and chart show the same values
- filtered data can be exported
- a repository contract test passes against PostgreSQL and mock API providers
- the frontend requires no changes when switching providers
