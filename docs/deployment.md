# Render backend and Netlify frontend

The same repository supports local SQLite development and a split cloud deployment.

- Netlify builds the Next.js frontend with its automatic OpenNext adapter.
- Render runs the API with PostgreSQL and compressed uploads stored in `upload_assets`.
- Frontend middleware forwards `/api/*` and `/uploads/*` to the configured backend origin. `/api/backend-status` stays on Netlify and performs a bounded readiness check.
- Browser authentication uses first-party HttpOnly cookies through the frontend origin; the database and signing secret belong only on Render.

## Render

Use Node 22, region Singapore, the Free web-service plan, and:

```sh
npm ci --include=dev && npm run cloud:build
npm run cloud:start
```

`cloud:build` generates Prisma from `prisma/postgres/schema.prisma`. Startup applies its independent migration history before opening the HTTP port. Local SQLite migrations and retained assets are preserved.

Set these environment variables securely in Render:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | The PostgreSQL internal connection URL, in the same region. |
| `JWT_SECRET` | A cryptographically generated secret of at least 32 characters. |
| `APP_URL` | The exact HTTPS frontend origin. |
| `DEPLOYMENT_ROLE` | `backend` |
| `UPLOAD_STORAGE` | `database` |
| `SEED_DEMO_DATA` | `true` to seed the catalog, four fictional users, and sample activity idempotently. |
| `DEMO_ADMIN_EMAIL` | The administrator's sign-in email. |
| `DEMO_ADMIN_PASSWORD` | A strong administrator password; seed does not reset an existing account. |

Use `/api/health` as the health-check path. `render.yaml` describes an equivalent reproducible Blueprint; do not apply it over manually created services without reviewing resource ownership first.

## Netlify

`netlify.toml` sets `npm run build` and the `.next` publish directory. The Next adapter is detected automatically. Do not add a static SPA catch-all redirect.

Set `DEPLOYMENT_ROLE=frontend`, `APP_URL` to the site's primary HTTPS origin, `BACKEND_ORIGIN` to the Render HTTPS origin, and `NEXT_PUBLIC_BACKEND_WAKE=true` for both builds and runtime where applicable. Do not add database credentials or JWT signing secrets to Netlify.

Linking writes `.netlify/state.json`; `.netlify/` is ignored. For a manual deployment, use a clean Git archive so local `.env` files, databases, and untracked uploads cannot be published. A later Git-connected deployment would replace a manual deployment.

## Sleeping and storage

The startup screen checks readiness before mounting authentication and API consumers. It retries for up to two minutes, respects reduced motion, and offers an explicit retry after timeout. Returning to an old tab can trigger a fresh readiness check while preserving open forms. It never automatically replays payments or other write requests and does not run an always-on keep-alive timer.

Render Free web services sleep after inactivity. The PostgreSQL database preserves this prototype's records and uploaded images across web-service restarts, but **Free Render PostgreSQL expires after 30 days**. Export or replace the database before its expiry date; the wake animation cannot prevent database expiry. For larger or long-term use, move images to object storage and use a database plan with backups.

For local development after generating a PostgreSQL client, run `npx prisma generate` to restore the SQLite client, then follow the README's normal setup. Never point the local seed command at a live database unintentionally.
