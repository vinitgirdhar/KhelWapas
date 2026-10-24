import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogKey, getCatalogSnapshot, invalidateCatalogCache, loadCatalog } from '../src/lib/catalog-cache';

const payload = (name: string, stock = 1) => ({ products: [{ id: name, name, stock }], categories: ['Cricket'], pagination: { total: 1, pages: 1 } });

test('public catalog reads deduplicate and revalidate the current stock without mixing query keys', async t => {
  invalidateCatalogCache();
  let complete!: (response: Response) => void;
  let calls = 0;
  t.mock.method(globalThis, 'fetch', () => { calls++; return new Promise<Response>(resolve => { complete = resolve; }); });
  const key = catalogKey({ type: 'new' });
  const first = loadCatalog(key), second = loadCatalog(key);
  assert.equal(first, second);
  assert.equal(calls, 1);
  complete(Response.json(payload('New bat', 3)));
  await first;
  assert.equal(getCatalogSnapshot(key)?.data.products[0].stock, 3);
  await loadCatalog(key);
  assert.equal(calls, 1);
  const refresh = loadCatalog(key, true);
  assert.equal(calls, 2);
  assert.equal(getCatalogSnapshot(key)?.data.products[0].stock, 3);
  complete(Response.json(payload('New bat', 0)));
  await refresh;
  assert.equal(getCatalogSnapshot(key)?.data.products[0].stock, 0);
  assert.equal(getCatalogSnapshot(catalogKey({ type: 'preowned' })), undefined);
  assert.notEqual(catalogKey({ type: 'new', search: 'bat' }), key);
  assert.notEqual(catalogKey({ type: 'new', category: 'Cricket', page: 2 }), key);
});

test('marketplace mutation invalidation prevents an older in-flight result restoring stale stock', async t => {
  invalidateCatalogCache();
  const completions: ((response: Response) => void)[] = [];
  t.mock.method(globalThis, 'fetch', () => new Promise<Response>(resolve => completions.push(resolve)));
  const key = catalogKey({ type: 'preowned' });
  const old = loadCatalog(key);
  invalidateCatalogCache();
  const current = loadCatalog(key);
  completions[1](Response.json(payload('Current stock', 0)));
  await current;
  completions[0](Response.json(payload('Before checkout', 1)));
  await old;
  assert.equal(getCatalogSnapshot(key)?.data.products[0].name, 'Current stock');
});

test('catalog snapshots expire, stay bounded and a failed refresh preserves recent visible gear', async t => {
  invalidateCatalogCache();
  let now = 1000;
  t.mock.method(Date, 'now', () => now);
  t.mock.method(globalThis, 'fetch', async () => Response.json(payload('Catalog gear')));
  for (let page = 1; page <= 25; page++) await loadCatalog(catalogKey({ type: 'new', page }));
  assert.equal(getCatalogSnapshot(catalogKey({ type: 'new', page: 1 })), undefined);
  const key = catalogKey({ type: 'new', page: 25 });
  assert.ok(getCatalogSnapshot(key));
  t.mock.method(globalThis, 'fetch', async () => Response.json({ message: 'Connection unavailable' }, { status: 503 }));
  await assert.rejects(loadCatalog(key, true), /Connection unavailable/);
  assert.equal(getCatalogSnapshot(key)?.data.products[0].name, 'Catalog gear');
  now += 30_001;
  assert.equal(getCatalogSnapshot(key), undefined);
});
