import { test, expect } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { DEMO_PRODUCTS } from '../src/data/demo-catalog';
import { SPORTS_CATEGORIES } from '../src/lib/categories';
import { adminContext } from './helpers/admin';
import { PrismaClient } from '@prisma/client';

test('all 22 categories expose five correctly mapped demo products and every image is served', async ({ request, page }) => {
  for (const category of SPORTS_CATEGORIES) {
    const response = await request.get('/api/products?' + new URLSearchParams({ category, limit: '100', available: 'true' }));
    expect(response.status()).toBe(200);
    const products = (await response.json()).products.filter((p: { badge: string }) => p.badge === 'Demo listing');
    const expected = DEMO_PRODUCTS.filter(p => p.category === category);
    expect(products.map((p: { id: string }) => p.id).sort()).toEqual(expected.map(p => p.id).sort());
    for (const product of products) {
      const item = expected.find(p => p.id === product.id)!;
      expect(product).toMatchObject({ name: item.name, image: item.imageUrls[0], sku: item.specs.SKU, type: item.type });
    }
  }
  for (let index = 0; index < DEMO_PRODUCTS.length; index += 10) {
    await Promise.all(DEMO_PRODUCTS.slice(index, index + 10).map(async product => {
      const response = await request.get(product.imageUrls[0]);
      expect(response.status(), product.name).toBe(200);
      expect(response.headers()['content-type']).toContain('image/webp');
    }));
  }
  const featured = (await (await request.get('/api/products?available=true&featured=true&limit=4')).json()).products;
  expect(featured).toHaveLength(4);
  expect(new Set(featured.map((p: { category: string }) => p.category)).size).toBe(4);
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/products/demo-football-size-5-ball');
  await expect(page.getByRole('heading', { name: 'Size 5 training football', exact: true })).toBeVisible();
  await expect(page.getByText('AI-generated demo image · Illustrative product and condition.', { exact: true })).toBeVisible();
  await expect.poll(() => page.locator('main img').first().evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
});

test('refreshing demo content preserves inventory, archives and other listings without duplicates', async () => {
  const manager = await adminContext();
  const original = (await (await manager.get('/api/products/demo-cricket')).json()).product;
  const database = new PrismaClient();
  const administrator = (await (await manager.get('/api/auth/me')).json()).user;
  await database.product.create({ data: { id: 'demo-club-bat', name: 'Club cricket bat', category: 'Cricket', type: 'preowned', grade: 'B', price: 899, stock: 1, badge: 'Demo listing', description: 'Legacy bat listing with one unit already reserved by an existing demo order.', imageUrls: ['/images/products/background.jpg'] } });
  const oldOrder = await database.order.create({ data: { userId: administrator.id, items: [{ productId: 'demo-club-bat', productName: 'Club cricket bat', price: 899, quantity: 1, type: 'preowned' }], totalPrice: 949, paymentStatus: 'paid', fulfillmentStatus: 'Confirmed' } });
  const created = await manager.post('/api/products/create', { data: { name: 'Independent archived inventory fixture', category: 'Cricket', type: 'preowned', grade: 'A', price: 730, stock: 7, isAvailable: false, description: 'An independent archived listing that demo seeding must leave untouched.', imageUrls: ['/images/products/background.jpg'] } });
  expect(created.status()).toBe(201); const separate = (await created.json()).product;
  try {
    expect((await manager.patch('/api/products/demo-cricket', { data: { stock: 2, isAvailable: false } })).status()).toBe(200);
    await promisify(execFile)(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'prisma/seed.ts'], { env: { ...process.env, SEED_MOCK_PRODUCTS: 'true' }, timeout: 30000 });
    await expect((await manager.get('/api/products/demo-cricket')).json()).resolves.toMatchObject({ product: { stock: 2, isAvailable: false, image: '/images/demo-catalog/cricket-practice-bat.webp' } });
    await expect((await manager.get(`/api/products/${separate.id}`)).json()).resolves.toMatchObject({ product: { stock: 7, isAvailable: false, price: 730 } });
    await expect((await manager.get('/api/products/demo-club-bat')).json()).resolves.toMatchObject({ product: { name: 'Club cricket bat', stock: 1, type: 'preowned', isAvailable: false, badge: 'Retired demo listing' } });
    expect((await manager.post(`/api/admin/orders/${oldOrder.id}/cancel`, { data: {} })).status()).toBe(200);
    await expect((await manager.get('/api/products/demo-club-bat')).json()).resolves.toMatchObject({ product: { name: 'Club cricket bat', stock: 2, isAvailable: false } });
    const result = (await (await manager.get('/api/products?category=Cricket&limit=100')).json()).products;
    expect(result.filter((p: { badge: string }) => p.badge === 'Demo listing')).toHaveLength(5);
  } finally {
    await manager.patch('/api/products/demo-cricket', { data: { stock: original.stock, isAvailable: original.isAvailable } });
    await database.$disconnect();
    await manager.dispose();
  }
});
