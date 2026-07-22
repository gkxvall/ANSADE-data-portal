# Stage 01 Report — Foundation and Project Setup

## Status and scope

Stage 1 is implemented. The repository initially contained no application code: it held the seven planning documents, five inspiration images, and Git metadata. This stage establishes the project foundation only. It does not implement the Stage 2 domain schema or any later-stage data feature.

## What was implemented

- a Next.js 16 App Router application with React and strict TypeScript
- Tailwind CSS 4 with shared visual tokens
- a responsive French-first shell with desktop sidebar, mobile drawer, header, and content area
- explicit loading, route error, global error, and not-found experiences
- PostgreSQL datasource and Prisma 6 client configuration, without models or credentials
- Zod validation for server and browser-safe configuration
- a cached development Prisma client isolated in infrastructure
- a process-liveness endpoint at `/api/health`
- architecture-aligned source directories for presentation, application, domain, and infrastructure
- ESLint import restrictions preventing presentation code from importing Prisma, database infrastructure, or source adapters
- Prettier, Vitest, React Testing Library, and Playwright configuration
- unit, component, route, and browser-smoke test files
- dependency security overrides for patched transitive versions of `effect`, `postcss`, and `sharp`

TanStack Table and Recharts are installed to preserve the required project stack, but they are not used before their planned stages.

## How it works

The root layout reads only public configuration and wraps pages in `AppShell`. The shell owns responsive navigation behavior but has no data access. Future navigation entries are deliberately disabled and labelled “Bientôt” so the foundation does not imply that catalogue features already exist.

Server configuration is parsed only when a server-side consumer asks for it. `DATABASE_URL` must use a PostgreSQL protocol, `DATA_SOURCE` is limited to `postgres`, and future API values remain optional. The Prisma singleton calls this validation and exists only under `src/infrastructure/database`.

`GET /api/health` reports application-process liveness and explicitly returns `database: "not-checked"`. It does not create a misleading readiness claim before a real database is configured.

## Important decisions

### Stage boundary

`prisma/schema.prisma` contains only the generator and PostgreSQL datasource. Entities, migrations, seeds, source identifiers, and timestamps belong to Stage 2 and were not guessed in Stage 1.

No statistical values or ANSADE source content were invented. The landing page describes technical readiness and clearly states that no statistical data is loaded.

### Architecture boundary

Presentation imports are guarded through ESLint. UI code cannot directly import `@prisma/client`, `src/infrastructure/database`, or `src/infrastructure/adapters`. This makes the intended `Presentation → Application → Domain` dependency direction enforceable from the first stage.

### Environment handling

`.env.example` contains placeholders rather than usable credentials. Server-only variables are separated from `NEXT_PUBLIC_APP_NAME`. API credentials are optional and unused until the API provider is implemented.

### Version and security posture

The foundation uses the current installed Next.js/React/Tailwind toolchain and Prisma 6. Prisma 7 was not introduced because it would expand the database configuration migration beyond the Stage 1 need. Narrow npm overrides replace transitive versions with versions that clear the npm security audit. ESLint 9 and TypeScript 6 are pinned to versions supported by the Next.js lint stack instead of using incompatible major versions.

## Visual system derived from `inspo/`

All five images were inspected. The useful repeated principles were:

- persistent, compact navigation
- generous neutral canvas around white content cards
- strong page-level hierarchy with restrained supporting text
- rounded but not playful containers
- subtle borders and low-elevation shadows
- small status treatments and disciplined accent colors
- responsive composition built from a few clear regions

These were adapted into a calm navy/teal institutional palette, a small amber accent, a spacious shell, readable cards, and explicit status language. The design uses system typography to keep builds deterministic and avoid runtime font downloads.

Patterns rejected for this portal include saturated rainbow KPI strips, fabricated charts, dense admin-template widget grids, social/finance content, decorative maps without ANSADE geographic codes, copied brands, and a dark mode without a documented product requirement.

## Files created or changed

### Project and tooling

- `package.json`, `package-lock.json`
- `.gitignore`, `.env.example`
- `.prettierrc.json`, `.prettierignore`
- `eslint.config.mjs`, `tsconfig.json`, `next.config.ts`
- `postcss.config.mjs`, `vitest.config.ts`, `playwright.config.ts`
- `prisma/schema.prisma`

### Application

- `src/app/layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`
- `src/app/api/health/route.ts`
- `src/components/layout/app-shell.tsx`
- `src/styles/globals.css`
- `src/lib/env/public.ts`, `src/lib/env/server.ts`
- `src/infrastructure/database/prisma.ts`
- placeholder directory markers under `src/application`, `src/domain`, `src/components`, and `src/infrastructure`

### Tests and documentation

- `src/**/*.test.ts(x)`, `src/tests/setup.ts`
- `e2e/foundation.spec.ts`
- `README.md`
- `docs/known-issues.md`
- `docs/reports/stage-01.md`

## How to run and test

```bash
npm ci
cp .env.example .env
npm run prisma:generate
npm run dev
```

Quality suite:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Browser suite, when Chromium is available:

```bash
npx playwright install chromium
npm run test:e2e
```

## Verification results

| Check                          | Result                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Prisma schema validation       | Passed                                                                                                   |
| Prisma client generation       | Passed                                                                                                   |
| ESLint                         | Passed, zero warnings                                                                                    |
| TypeScript                     | Passed                                                                                                   |
| Vitest + React Testing Library | Passed, 4 files / 10 tests                                                                               |
| Production build               | Passed; `/` static and `/api/health` dynamic                                                             |
| npm security audit             | Passed, 0 vulnerabilities                                                                                |
| Built-server HTTP checks       | Passed; `/` and `/api/health` returned 200                                                               |
| In-app visual verification     | Not available in this execution environment                                                              |
| Playwright runtime execution   | Not run because the required in-app browser surface was unavailable; test files are configured and ready |

The initial sandboxed build failed because Turbopack was not allowed to bind its local worker port. The same production build passed outside that sandbox constraint; this was an execution-environment restriction, not an application failure.

## Limitations and risks

- A real PostgreSQL connection was not available, so Stage 1 validates connection syntax but does not perform a readiness query.
- The Prisma schema intentionally has no domain models or migrations before Stage 2.
- The health route is liveness-only; database readiness belongs to a later stage with real schema and infrastructure.
- The catalogue navigation and search control are intentionally disabled structural placeholders.
- Browser-based visual and E2E execution remains to be run in an environment exposing the in-app browser and Chromium.
- Documentation refers to `Inso/`, while the repository folder is named `inspo/`; Stage 1 used the folder that actually exists.

## Preparation for Stage 2

The domain, repository-contract, value-object, database, and adapter locations now exist without premature implementations. Stage 2 can add source-ID-preserving entities, Prisma models, constraints, migrations, and development fixtures inside these boundaries. No Stage 2 code has been started.
