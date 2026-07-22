# System Architecture

## Architectural Goal

Build the user interface and application logic against a stable internal domain model so the underlying data source can change from a PostgreSQL snapshot to a live API without rewriting the product.

## High-Level Architecture

```text
Source Portal / Exported Files / Future API
                  ↓
             Source Adapter
                  ↓
             Normalization
                  ↓
          Internal Domain Model
                  ↓
      Repository / Provider Interface
          ↓                    ↓
 PostgreSQL Provider      Future API Provider
          ↓                    ↓
         Application Services
                  ↓
       Next.js Pages and Components
```

## Layers

### 1. Presentation layer

Responsibilities:

- pages
- layouts
- forms
- filters
- tables
- charts
- loading states
- error states

Rules:

- no Prisma imports
- no source-portal field names
- no direct external API requests
- no database-specific logic

### 2. Application layer

Responsibilities:

- catalogue queries
- dataset exploration
- search
- comparisons
- exports
- saved views
- chart preparation

Application services accept domain objects and repository interfaces.

### 3. Domain layer

Core entities:

- Category
- Theme
- Dataset
- Dimension
- DimensionValue
- Observation
- DatasetMetadata
- SourceReference
- ImportRun

The domain layer must not depend on Next.js, Prisma, or external API formats.

### 4. Repository layer

Repository contracts describe what the application needs, not how data is stored.

Example:

```ts
export interface DatasetRepository {
  list(input: DatasetListInput): Promise<PaginatedResult<DatasetSummary>>;
  getById(id: string): Promise<Dataset | null>;
  search(query: DatasetSearchInput): Promise<PaginatedResult<DatasetSummary>>;
}
```

### 5. Infrastructure layer

Contains:

- Prisma repositories
- source import clients
- future API client
- file readers
- cache adapters
- logging
- database migrations

## Recommended Project Structure

```text
src/
├── app/
│   ├── (portal)/
│   ├── admin/
│   └── api/
├── components/
│   ├── charts/
│   ├── datasets/
│   ├── filters/
│   ├── layout/
│   └── ui/
├── domain/
│   ├── entities/
│   ├── repositories/
│   ├── services/
│   └── value-objects/
├── application/
│   ├── catalogue/
│   ├── datasets/
│   ├── search/
│   ├── compare/
│   └── exports/
├── infrastructure/
│   ├── database/
│   ├── providers/
│   ├── importers/
│   ├── adapters/
│   └── logging/
├── lib/
├── styles/
└── tests/
```

## Data Model Strategy

### Category

- internal ID
- source ID
- name
- slug
- display order

### Theme

- internal ID
- source ID
- category ID
- name
- slug

### Dataset

- internal ID
- source ID
- theme ID
- title
- description
- source organization
- publication status
- source updated timestamp
- source published timestamp
- checksum

### Dimension

Represents concepts such as:

- year
- sex
- wilaya
- age group
- indicator
- measure

### Observation

An observation represents one value at one coordinate across dimensions.

Recommended conceptual form:

```ts
{
  datasetId: string;
  dimensions: Record<string, string>;
  value: number | null;
  rawValue: string | null;
  status?: string;
}
```

The physical PostgreSQL representation may use normalized dimension tables or a JSONB coordinate field. The chosen design must be justified through query patterns and tested for performance.

## Static-to-API Migration Strategy

### Current mode

```env
DATA_SOURCE=postgres
```

The provider factory returns PostgreSQL repositories.

### Future mode

```env
DATA_SOURCE=api
```

The provider factory returns API-backed repositories.

Both implementations must satisfy the same contract and return the same domain types.

### Adapter rule

External fields such as `nom_cat`, `nom_theme`, or nested table structures must exist only inside source adapter modules.

## Import Architecture

```text
Fetcher
  ↓
Raw source schema validation
  ↓
Source-to-domain adapter
  ↓
Normalization
  ↓
Domain validation
  ↓
Upsert transaction
  ↓
Checksum and revision calculation
  ↓
Import report
```

## API Routes

Use Next.js route handlers only where browser clients need server endpoints, such as:

- dataset search
- dynamic observation queries
- exports
- admin import triggers

Server components should call application services directly when possible.

## Caching

- Cache stable catalogue metadata.
- Invalidate caches after imports.
- Do not cache user-specific saved views globally.
- Keep cache behavior behind an adapter when possible.

## Observability

Use structured logs for:

- imports
- database failures
- slow queries
- export failures
- unexpected source formats

Every import run must have a unique identifier and summary.

## Dependency Rules

Allowed:

```text
Presentation → Application → Domain
Infrastructure → Domain
Application → Repository interfaces
```

Forbidden:

```text
Domain → Next.js
Domain → Prisma
UI → Prisma
UI → source portal format
Application → concrete repository implementation
```
