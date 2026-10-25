import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('cloud Postgres and local SQLite schemas retain the same marketplace models', async () => {
  const [local, cloud] = await Promise.all([
    readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8'),
    readFile(new URL('../prisma/postgres/schema.prisma', import.meta.url), 'utf8'),
  ]);
  const normalize = (value: string) => value.replace(/\r\n/g, '\n').trim();
  assert.equal(normalize(local.replace('provider = "sqlite"', 'provider = "postgresql"')), normalize(cloud));
  const baseline = await readFile(new URL('../prisma/postgres/migrations/20261025100000_cloud_baseline/migration.sql', import.meta.url), 'utf8');
  assert.match(baseline, /CREATE TABLE "upload_assets"/);
  assert.match(baseline, /"contentBytes" BYTEA NOT NULL/);
  assert.match(baseline, /orders_userId_fkey/);
});
