# CPAMaRKeT.Uz – CPA Platform Monorepo

CPAMaRKeT.Uz is a production-focused CPA (Cost Per Action) marketing platform delivered as a Turborepo monorepo. It bundles a NestJS API, Next.js App Router frontend, shared UI/components, Prisma ORM, and infrastructure for running end-to-end via Docker.

## Repository structure

```
.
├─ apps/
│  ├─ api/        # NestJS 10 backend (REST, RBAC, Prisma)
│  └─ web/        # Next.js 14 frontend (App Router, next-intl, shadcn/ui)
├─ packages/
│  ├─ config/     # Shared eslint/tsconfig/env schemas
│  ├─ ui/         # Tailwind + shadcn based design system
│  └─ utils/      # Cross-app helpers (currency, dates, api client)
├─ prisma/        # Schema, migrations, seed script
├─ docker-compose.yml
└─ .github/workflows/ci.yml
```

## Features at a glance

- **RBAC & portals**: admin, operator, targetolog, advertiser, affiliate – each with dedicated dashboards.
- **Auth**: JWT access + refresh tokens, argon2 hashing, optional email verification & password reset flows.
- **Statistics**: Clicks/leads dashboards with timeseries, top performers, CR/EPC calculations, BullMQ-ready architecture.
- **Data & storage**: PostgreSQL via Prisma, Redis, MinIO S3-compatible storage, Nodemailer + Mailpit previews.
- **Security & ops**: Helmet, CORS, CSRF, rate limiting, request logging, audit logs, JWT blacklist on logout.
- **Dev experience**: Turborepo pipelines, shared config packages, Playwright-ready Next.js UI, Jest/Supertest e2e tests.
- **Docker-first**: Single `docker compose up --build` brings API, web, Postgres, Redis, MinIO, Mailpit online.

## Getting started (local)

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Environment variables**

   ```bash
   cp .env.example .env
   ```

   Adjust values as needed (database, redis, JWT secrets, SMTP, S3 endpoints).

3. **Database**

   ```bash
   pnpm --filter apps-api exec prisma db push
   pnpm --filter apps-api db:seed
   ```

4. **Run locally**

   ```bash
   pnpm dev    # runs turbo dev (api + web)
   ```

Front-end at http://localhost:3000 (Uzbek default). API at http://localhost:4000/api.

## Docker deployment

```bash
docker compose up --build
```

Services:

- `web`: Next.js (port 3000)
- `api`: NestJS (port 4000)
- `postgres`: PostgreSQL 15 (port 5432)
- `redis`: Redis 7 (port 6379)
- `minio`: S3-compatible storage (9000, console 9001 – credentials `minioadmin`)
- `mailpit`: SMTP testing (SMTP 1025 / UI 8025)

On boot the API container runs `prisma generate`, `prisma db push`, and seeds demo data automatically.

## Seed accounts

| Role       | Email                     | Password    |
|------------|---------------------------|-------------|
| Admin      | `admin@cpamarket.uz`      | `Admin123!` |
| Operator   | `operator@cpamarket.uz`   | `Admin123!` |
| Targetolog | `targetolog@cpamarket.uz` | `Admin123!` |
| Advertiser | `advertiser@cpamarket.uz` | `Admin123!` |
| Affiliate1 | `affiliate1@cpamarket.uz` | `Admin123!` |
| Affiliate2 | `affiliate2@cpamarket.uz` | `Admin123!` |

## Scripts

- `pnpm dev` – run web + api in dev via Turborepo
- `pnpm build` – build all packages/apps
- `pnpm lint` – lint via shared ESLint config
- `pnpm --filter apps-api test` – run Jest + Supertest e2e tests
- `pnpm --filter apps-api db:seed` – seed database
- `pnpm --filter apps-api exec prisma db push` – sync Prisma schema

## CI/CD

GitHub Actions workflow (`ci.yml`) checks out the repo, installs dependencies, performs Prisma generate & schema push against a service Postgres, lints, typechecks, and runs API tests.

## Frontend overview

- Next.js App Router with locale segment (`/[locale]/`) using `next-intl`. Default locale Uzbek, additional Russian/English translations in `src/i18n/messages`.
- Shared UI via `@cpamarket/ui` (shadcn-based buttons, cards, stats, toast provider).
- Auth flows implemented with server actions to call NestJS API, storing tokens as HTTP-only cookies.
- Dashboard fetches secure stats via server components (`apiFetch` helper) and renders charts (Recharts) plus KPI cards.

## Backend overview

- Modular NestJS (`apps/api/src/modules`) covering Auth, Users, Offers, Products, Creatives, Clicks, Leads, Stats, Campaigns, Payouts, Notifications, Tickets, Audit, Uploads.
- Prisma ORM schema under `prisma/schema.prisma` with enums, relations, indexes.
- JWT guard + role guard wired globally, response interceptor ensures consistent `{ success, data }` payloads.
- Upload service returns S3 presigned URLs (MinIO in Docker).
- BullMQ-ready queue module (connection via REDIS_URL) for future async jobs/cron extensibility.
- Mail service uses Nodemailer (Mailpit for local preview) for verification & reset flows.

## RBAC summary

| Role       | Access highlights                                                  |
|------------|--------------------------------------------------------------------|
| Admin      | Manage users, offers, payouts, view audit logs & system settings   |
| Operator   | Lead review/approval, ticket triage                                |
| Targetolog | Campaign & creative management, performance tracking               |
| Advertiser | Offer/product control, lead quality insights, tickets              |
| Affiliate  | Offer catalog, KPIs, payout tracking, support tickets              |

Role guards applied via `@Roles()` decorator and enforced by the `RolesGuard`.

## Testing

Sample Jest + Supertest suites ensure critical paths:

- `auth.e2e-spec.ts` – registration & login
- `offers.e2e-spec.ts` – authenticated CRUD operations
- `stats.e2e-spec.ts` – totals endpoint with seeded data

Update / extend with additional coverage as modules evolve.

## Contributing

1. Fork & clone.
2. Install deps (`pnpm install`).
3. Branch off (`feat/...`, `fix/...`).
4. Ensure lint/tests pass (`pnpm lint`, `pnpm --filter apps-api test`).
5. Submit PR with context + screenshots where relevant.

## License

MIT © CPAMaRKeT.Uz contributors. See [LICENSE](LICENSE) (create if required).