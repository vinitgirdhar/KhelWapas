import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { backendOrigin } from '../src/lib/deployment';
import { middleware } from '../src/middleware';
import { GET as readiness } from '../src/app/api/backend-status/route';
import { containsText } from '../src/server/search';

test('text search keeps SQLite-compatible filters and adds case-insensitivity for Postgres', t => {
  const previous = process.env.DATABASE_URL;
  t.after(() => { if (previous === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previous; });
  process.env.DATABASE_URL = 'file:./test.db';
  assert.deepEqual(containsText('Cricket'), { contains: 'Cricket' });
  process.env.DATABASE_URL = 'postgresql://example.invalid/db';
  assert.deepEqual(containsText('Cricket'), { contains: 'Cricket', mode: 'insensitive' });
});

test('deployment destinations reject credentials, paths and non-HTTP protocols', () => {
  assert.equal(backendOrigin(undefined), null);
  assert.equal(backendOrigin('https://api.example.test/'), 'https://api.example.test');
  for (const destination of ['https://user:password@api.example.test', 'https://api.example.test/private', 'https://api.example.test/?secret=value', 'file:///tmp/anything']) {
    assert.throws(() => backendOrigin(destination));
  }
});

test('frontend proxies API/uploads to the configured backend but checks readiness locally', t => {
  const previous = { role: process.env.DEPLOYMENT_ROLE, backend: process.env.BACKEND_ORIGIN, app: process.env.APP_URL };
  t.after(() => {
    for (const [key, value] of Object.entries({ DEPLOYMENT_ROLE: previous.role, BACKEND_ORIGIN: previous.backend, APP_URL: previous.app })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  process.env.DEPLOYMENT_ROLE = 'frontend';
  process.env.BACKEND_ORIGIN = 'https://api.example.test';
  process.env.APP_URL = 'https://shop.example.test';
  const response = middleware(new NextRequest('https://shop.example.test/api/products?type=new'));
  assert.equal(response.headers.get('x-middleware-rewrite'), 'https://api.example.test/api/products?type=new');
  assert.equal(middleware(new NextRequest('https://shop.example.test/uploads/products/example.webp')).headers.get('x-middleware-rewrite'), 'https://api.example.test/uploads/products/example.webp');
  assert.equal(middleware(new NextRequest('https://shop.example.test/api/backend-status')).headers.get('x-middleware-rewrite'), null);
  const crossSite = middleware(new NextRequest('https://shop.example.test/api/orders', { method: 'POST', headers: { Origin: 'https://attacker.example' } }));
  assert.equal(crossSite.status, 403);
  delete process.env.BACKEND_ORIGIN;
  assert.equal(middleware(new NextRequest('https://shop.example.test/api/orders')).status, 503);
});

test('readiness rejects Render HTML/loading responses and accepts only the healthy API', async t => {
  const previous = process.env.BACKEND_ORIGIN;
  t.after(() => { if (previous === undefined) delete process.env.BACKEND_ORIGIN; else process.env.BACKEND_ORIGIN = previous; });
  process.env.BACKEND_ORIGIN = 'https://api.example.test';
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>Loading Render</html>', { headers: { 'Content-Type': 'text/html' } }));
  assert.equal((await readiness()).status, 503);
  t.mock.method(globalThis, 'fetch', async () => Response.json({ ready: true, service: 'someone-else' }));
  assert.equal((await readiness()).status, 503);
  t.mock.method(globalThis, 'fetch', async () => Response.json({ ready: true, service: 'khelwapas-api' }));
  const ready = await readiness();
  assert.equal(ready.status, 200);
  assert.equal(ready.headers.get('cache-control'), 'no-store');
});
