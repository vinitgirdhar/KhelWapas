#!/usr/bin/env bash
set -euo pipefail
# Every test run uses a disposable database and generated credentials.
khel_test_dir=$(mktemp -d /tmp/khelwapas-test.XXXXXX)
trap 'rm -rf "$khel_test_dir"' EXIT
# Prisma runs in native Node on Windows, so translate Git Bash's /tmp path.
khel_test_db="$khel_test_dir/test.db"
if command -v cygpath >/dev/null 2>&1; then
  khel_test_db=$(cygpath -m "$khel_test_db")
fi
export DATABASE_URL="file:$khel_test_db"
export JWT_SECRET="$(openssl rand -hex 32)"
export DEMO_ADMIN_EMAIL="admin@example.test"
export DEMO_ADMIN_PASSWORD="$(openssl rand -hex 24)"
export APP_URL="http://localhost:9003"
touch "$khel_test_dir/test.db"
npx prisma migrate deploy
SEED_MOCK_PRODUCTS=true npm run db:seed
npx playwright test "$@"
