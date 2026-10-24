# KhelWapas

A prototype marketplace for new and pre-owned sports equipment. The original navy/orange palette and logo are preserved, with glass navigation, Apple system fonts, responsive shopping pages, signed-in mobile navigation, and GSAP animation that respects reduced motion. Mobile products use two columns, with four featured items on the home page and paired footer navigation groups. A header toggle switches between light and dark themes; the initial theme follows the device and an explicit choice persists across visits and tabs.

## Run locally

Requires Node.js 22 or 24 and npm.

```sh
npm ci
cp .env.example .env
# Set JWT_SECRET to a unique value, for example: openssl rand -hex 32
# Optionally set DEMO_ADMIN_EMAIL and DEMO_ADMIN_PASSWORD (12+ characters).
touch prisma/prototype.db
npm run db:migrate
npm run db:seed:mocks
npm run dev
```

Open http://localhost:9002. Create a buyer/seller account through Register. If admin credentials were configured before seeding, sign in at `/admin/login` with those credentials. Seeding never resets an existing user's password and includes no built-in login.

`npm run db:seed` creates only the configured admin. `npm run db:seed:mocks` additionally creates clearly labeled sample sports listings using the existing image assets. The tracked development database and credential document have been removed from the working tree.

## Marketplace flow

1. Sellers sign in and upload 3–10 JPEG/PNG/WebP photos, describe equipment, and set an asking price. The form supports sports from athletics through yoga and other equipment.
2. Admins review requests at `/admin/requests`. Approval publishes one seller-linked listing in a transaction. Rejection preserves a review note. Sellers can follow status from their account.
3. Buyers search/filter/sort the catalog, add gear to their bag, and save an address. Checkout obtains a current server quote.
4. The clearly labeled payment simulator offers success or failure. It never requests card numbers, CVVs, UPI IDs, or bank credentials. Successful demo checkout reserves stock; failed checkout leaves stock and the bag unchanged.
5. Admins update valid fulfillment transitions. Cancellation and returns restore inventory once and mark a simulated refund. Orders retain item prices, delivery addresses, events, and notes. Buyers can print their own demo invoices.
6. Demo pickup plans persist without booking a courier. Email invoice delivery explicitly reports that it is not connected. Khelbot provides offline marketplace help. The price guide uses current listing asking prices and clearly marks estimates as indicative.

## Validation

```sh
npm run typecheck
npm run build
npm run test:unit
npx playwright install --with-deps chromium
npm test
```

Tests create and remove an isolated SQLite database and generate disposable admin credentials. They never use the local prototype database. The suite covers ownership, session invalidation, pricing tampering, quotes, idempotency, last-item concurrency, cancellation restocking, seller approval, image spoofing, demo failure/success, invoices, and mobile cart layout. Screenshots are saved in ignored `artifacts/` and failures in `test-results/`.

## Hosting and launch boundaries

This is a **working prototype**, not an approval to collect live payments or launch a public commercial marketplace. SQLite and uploaded images currently require one Node server with a persistent volume for `prisma/prototype.db` and `public/uploads/`. An ephemeral/serverless filesystem will lose data. Back up both together; migrate to managed Postgres and object storage before horizontal scaling.

Set a strong JWT_SECRET and the correct public HTTPS APP_URL in hosting. Production cookies use Secure, HttpOnly and SameSite=Lax. API writes reject cross-origin requests, authorization is checked against current database role/status, and sensitive routes use database-backed rate limits. A trusted reverse proxy should enforce request-body and upload limits before requests reach Node.

Before any live rollout: connect a real gateway with verified webhooks and seller payouts, courier integration, verified email/password recovery, privacy/returns policies, seller identity/dispute handling, monitoring/backups, an external abuse limiter, and a dependency audit. Existing credentials or personal data from earlier Git history need rotation/removal through the repository owner's process; deleting current files does not erase history. This change deliberately does not rewrite history.

See [implementation and review notes](docs/marketplace-upgrade.md) for scope and validation results.
