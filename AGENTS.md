# Repository rules

## Structure

- Keep Next.js routes and API entry points in `src/app`.
- Keep server database, authentication and marketplace operations in `src/server`. Client components may call server actions but must not import database/authentication modules directly.
- Use `src/lib` for shared validation and client-safe utilities, `src/components` for reusable UI, and `src/hooks` for client state.
- Put maintained operational scripts in `scripts`, database commands in `prisma`, and automated checks in `tests`.
- Keep required tool configurations at the root. Avoid duplicate `page-new` files, unused components, debug data-dump scripts and progress-report documents.
- Use meaningful component names. The pricing guide and KhelBot run locally; do not present them as connected external AI services.

## Marketplace invariants

- This is a prototype: payments, refunds, pickups and delivery stay explicitly simulated unless a real integration is requested and implemented.
- Enforce authorization and ownership on the server. Never trust client prices, totals, stock, roles or user IDs.
- Preserve checkout snapshots, idempotency, transactional stock updates and exactly-once cancellation/restocking behavior.
- Do not reuse product IDs for different equipment. Catalog refreshes must preserve stock, archives, seller records and historical order links.
- Preserve database migrations and retained upload assets. They can support existing records even when source imports do not reference them.
- Never commit secrets, local databases, generated build output or test credentials. Curated images in `public/images/demo-catalog` are intentional tracked assets.

## Interface and verification

- Preserve the logo, navy/orange light theme and neutral charcoal dark surfaces.
- Keep two-column mobile product grids and paired footer navigation. The application dock belongs on signed-in app screens; help opens from navigation.
- Respect reduced motion, keyboard access, visible focus and mobile viewport bounds.
- TypeScript rejects unused imports and parameters. Remove unused dependencies when their last consumer is removed, while preserving framework requirements such as `react-dom`.
- Run relevant checks from the README. Use the isolated test runner for browser tests; do not seed test fixtures into the local prototype database.
