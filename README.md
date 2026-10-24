# KhelWapas

A prototype marketplace for new and pre-owned sports equipment, built with Next.js, React, TypeScript, Tailwind CSS, Prisma and SQLite.

Buyers can browse and filter gear, save addresses, run a simulated checkout and view demo invoices. Sellers submit photographed equipment for admin review. Admins manage listings, inventory, requests, orders and demo pickup plans. Payments, refunds, delivery and pickups are simulations; the app does not collect banking details or book couriers.

The interface supports mobile two-column product grids, light/dark themes, glass surfaces and GSAP motion with reduced-motion support. KhelBot provides offline marketplace guidance. The price guide uses comparable asking-price listings and reports an indicative estimate.

## Local setup

Use Node.js 22 or 24 and npm. The commands below use a Bash-compatible shell; the browser test runner also requires OpenSSL.

```sh
npm ci
cp .env.example .env
```

Edit `.env` before starting:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite connection, for example `file:./prototype.db`; relative paths resolve from `prisma/`. |
| `JWT_SECRET` | A unique random secret of at least 32 characters. Generate one with `openssl rand -hex 32`. |
| `APP_URL` | The app origin, `http://localhost:9002` for local development. |
| `DEMO_ADMIN_EMAIL` | Optional admin account created by the seed command. |
| `DEMO_ADMIN_PASSWORD` | Required with the admin email; use at least 12 characters. |

```sh
touch prisma/prototype.db
npm run db:migrate
npm run db:seed:mocks
npm run dev
```

Open **http://localhost:9002**. Register to create a buyer/seller account. If admin credentials were configured, sign in at `/admin/login`. There is no built-in password, and seeding does not reset existing passwords.

For a local production build, run `npm run build` and `npm start -- --port 9002`.

## Project structure

```text
src/
  app/          Next.js pages, layouts, API routes and global styles
  components/   Feature components and shared UI primitives
  data/         Demo product catalog and image mapping
  hooks/        Client authentication, cart, storage and UI state
  lib/          Shared validation, categories and client-safe utilities
  server/       Authentication, database, uploads and server business logic
    marketplace/  Catalog serialization, checkout and order operations
    pricing/      Indicative asking-price estimation
    support/      Offline KhelBot help
  types/        Shared domain interfaces
prisma/         Database schema, migration history and seed commands
scripts/        Browser-test runner and catalog image export utility
tests/          Unit and Playwright tests, with shared test helpers
public/         Static assets, generated demo photos and retained upload assets
docs/           Maintained catalog production guide
.github/        Continuous integration
```

Next.js, TypeScript, Tailwind, PostCSS and Playwright configuration files stay at the root where their tools expect them. `.idx/` contains the Firebase Studio workspace configuration; `apphosting.yaml` contains the existing hosting configuration. Generated build output, local data, secrets and browser artifacts are ignored by Git. Contributor rules are in [AGENTS.md](AGENTS.md).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server on port 9002. |
| `npm run build` / `npm start` | Build and start the production server. |
| `npm run typecheck` | Strict TypeScript checks, including unused imports and parameters. |
| `npm run db:migrate` | Apply committed database migrations. |
| `npm run db:seed` | Create only the configured admin account. |
| `npm run db:seed:mocks` | Create or refresh the generated demo catalog. |
| `npm run db:remove-mocks` | Archive controlled demo listings without deleting history. |
| `npm run test:unit` | Run domain, validation and generated-asset checks. |
| `npm test` | Run Playwright against a disposable seeded database. |

## Demo catalog

The catalog contains **110 products: five per sport/equipment category**, with 66 pre-owned and 44 new listings. Each has its own generated image, price, description, condition and SKU. Photos are bundled as WebP files and labeled as AI-generated demonstration imagery on product pages.

Refreshing demo content preserves stock and publication decisions and protects seller-linked records. Retired bat IDs retain their original identities for old orders. Archiving demos is reversible through the admin editor. See [the catalog guide](docs/demo-catalog.md) for mappings, image export and seed behavior.

## Verification

```sh
npm run typecheck
npm run test:unit
npm run build
npx playwright install --with-deps chromium
npm test
```

Playwright generates temporary credentials and uses a separate SQLite database; it does not use the local prototype database. The suite covers authentication and ownership, seller review/uploads, server-priced checkout, idempotency, inventory concurrency, cancellations, invoices, generated catalog assets, responsive layouts, themes and admin flows. CI also runs the production dependency audit. Local screenshots and failure traces are ignored under `artifacts/`, `test-results/` and `playwright-report/`.

## Hosting requirements

The current SQLite database and uploaded images require **one Node.js server with persistent storage** for `prisma/prototype.db` and `public/uploads/`. Back up both together. The hosting configuration does not provision that storage; ephemeral or serverless filesystems are unsuitable for persisted marketplace data. Move to managed database and object storage before horizontal scaling.

Use HTTPS, a strong signing secret and the correct `APP_URL` in hosting. Cookies are secure in production, write APIs reject cross-origin requests, and current database authorization and rate limits are enforced. A reverse proxy should enforce request-size limits.

A public commercial launch still needs real payment/webhook and seller-payout integration, courier and email services, account recovery/verification, privacy/returns policies, identity/dispute handling, monitoring and backups. The prototype does not claim those services are connected.
