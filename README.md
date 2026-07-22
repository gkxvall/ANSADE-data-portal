# ANSADE Statistical Data Explorer

A modern, responsive foundation for exploring ANSADE statistical data. The project is being delivered in the 10 stages defined in [`docs/idea.md`](docs/idea.md). **Stages 1 and 2** are implemented at present.

## Current status

The project currently provides:

- Next.js App Router with strict TypeScript
- Tailwind CSS design tokens and a responsive French-first application shell
- a normalized PostgreSQL/Prisma model for catalogue hierarchy, statistical observations, provenance, imports, and revisions
- source-ID and source-timestamp preservation throughout the internal model
- framework-independent domain types and Zod validation rules
- an initial migration with constraints, indexes, and foreign keys
- an idempotent, unmistakably labelled development fixture seed
- Zod validation for server-only and public environment variables
- explicit presentation/application/domain/infrastructure boundaries
- global loading, error, and not-found states
- a liveness endpoint at `/api/health`
- ESLint, Prettier, Vitest, React Testing Library, and Playwright configuration

The importer, repository implementations, catalogue pages, statistical tables, and charts are intentionally not implemented yet. The landing content remains structural. The only fictitious statistical value is isolated in the `DEVELOPMENT_FIXTURE_ONLY` seed and is visibly labelled as non-official.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- PostgreSQL 15 or newer for migrations and the development seed (a connection is not needed to render or build the shell)

## Local setup

```bash
npm ci
cp .env.example .env
```

Edit `.env` with a local PostgreSQL URL. Do not commit `.env` or production credentials.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
DATA_SOURCE="postgres"
NEXT_PUBLIC_APP_NAME="ANSADE Statistical Data Explorer"
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

For a disposable local database, apply the committed migration and optionally load the clearly marked development fixture:

```bash
npm run prisma:migrate:deploy
npm run prisma:seed
```

Then start development:

```bash
npm run dev
```

Open `http://localhost:3000`. The liveness endpoint is available at `http://localhost:3000/api/health`.

## Quality commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

The Playwright smoke suite is configured separately:

```bash
npx playwright install chromium
npm run test:e2e
```

Additional useful commands:

```bash
npm run test:watch
npm run test:coverage
npm run prisma:validate
npm run prisma:migrate:deploy
npm run prisma:seed
npm run start
```

## Environment variables

| Variable               | Required                                    | Exposure    | Current behavior                                                   |
| ---------------------- | ------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| `DATABASE_URL`         | For database access and Prisma CLI commands | Server only | Must be a `postgresql://` or `postgres://` URL                     |
| `DATA_SOURCE`          | No                                          | Server only | Defaults to `postgres`; other providers are rejected until Stage 4 |
| `ANSADE_API_BASE_URL`  | No                                          | Server only | Reserved for a future provider                                     |
| `ANSADE_API_TOKEN`     | No                                          | Server only | Reserved for a future provider                                     |
| `NEXT_PUBLIC_APP_NAME` | No                                          | Public      | Defaults to the documented product name                            |

## Architecture

The dependency direction is:

```text
Presentation → Application → Domain
Infrastructure ─────────────→ Domain
```

Presentation files under `src/app` and `src/components` are linted against direct imports from Prisma, database infrastructure, and source adapters. Prisma is isolated in `src/infrastructure/database`; source-specific fields must remain in `src/infrastructure/adapters` when that layer is implemented.

The detailed rules live in [`docs/architecture.md`](docs/architecture.md). Stage outcomes are recorded under [`docs/reports`](docs/reports).

The domain layer contains no Next.js or Prisma imports. Database-to-domain conversion rules are documented now, while concrete repository mappers remain intentionally deferred to Stage 4.

## Documentation

- [Project stages](docs/idea.md)
- [Specifications](docs/specs.md)
- [Architecture](docs/architecture.md)
- [Task breakdown](docs/tasks.md)
- [Testing strategy](docs/testing.md)
- [Database and domain model](docs/database-model.md)
- [Known issues](docs/known-issues.md)
- [Stage 1 report](docs/reports/stage-01.md)
- [Stage 2 report](docs/reports/stage-02.md)

Do not start Stage 3 until it is explicitly authorized.
