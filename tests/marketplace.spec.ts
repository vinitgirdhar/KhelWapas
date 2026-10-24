import { test, expect, request as requestFactory, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'crypto';
import { adminContext } from './helpers/admin';
import sharp from 'sharp';
const origin = 'http://localhost:9003';
const addressData = { title: 'Home', fullName: 'Prototype Player', phone: '9876543210', street: '123 Demo Street', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', country: 'India', isDefault: true };
async function account() {
  const api = await requestFactory.newContext({ baseURL: origin });
  const email = `player-${randomUUID()}@example.test`, password = 'Player prototype 2026!';
  const response = await api.post('/api/auth/register', { data: { fullName: 'Prototype Player', email, password } });
  expect(response.status()).toBe(201);
  return { api, email, password, user: (await response.json()).user };
}
async function admin() {
  return adminContext();
}
async function product(api: APIRequestContext, stock = 2) {
  const response = await api.post('/api/products/create', { data: { name: 'Test practice equipment', category: 'Cricket', type: 'preowned', price: 1200, description: 'A fully described piece of sports equipment for a prototype checkout.', imageUrls: ['/images/products/background.jpg'], grade: 'B', stock } });
  expect(response.status()).toBe(201); return (await response.json()).product;
}
async function address(api: APIRequestContext) {
  const response = await api.post('/api/profile/addresses', { data: addressData }); expect(response.status()).toBe(201); return response.json();
}
async function checkout(api: APIRequestContext, productId: string, addressId: string, outcome: 'success'|'failure' = 'success', key = randomUUID()) {
  return api.post('/api/orders', { headers: { 'Idempotency-Key': key }, data: { items: [{ productId, quantity: 1 }], addressId, outcome, expectedTotal: 1250, price: 1, fulfillmentStatus: 'Delivered' } });
}

test('private APIs and product mutations reject anonymous access', async ({ request }) => {
  for (const url of ['/api/profile?userId=anyone','/api/profile/addresses?userId=anyone','/api/profile/payment-methods?userId=anyone','/api/orders']) expect((await request.get(url)).status()).toBe(401);
  expect((await request.post('/api/products/create', { data: {} })).status()).toBe(401);
  expect((await request.patch('/api/products/demo-cricket', { data: { price: 1 } })).status()).toBe(401);
  expect((await request.post('/api/upload', { multipart: {} })).status()).toBe(401);
  expect((await request.get('/api/test-db')).status()).toBe(404);
});

test('ownership, validation, origin checks, and password session revocation', async () => {
  const a = await account(), b = await account(), saved = await address(a.api);
  expect((await b.api.put(`/api/profile/addresses/${saved.id}`, { data: { ...addressData, userId: a.user.id } })).status()).toBe(404);
  expect((await b.api.delete(`/api/profile/addresses/${saved.id}?userId=${a.user.id}`)).status()).toBe(404);
  await expect((await b.api.get(`/api/profile?userId=${a.user.id}`)).json()).resolves.toMatchObject({ id: b.user.id });
  expect((await a.api.post('/api/profile/addresses', { data: { ...addressData, postalCode: 'bad' } })).status()).toBe(400);
  expect((await a.api.put('/api/profile', { headers: { Origin: 'https://attacker.example' }, data: { fullName: 'Bad edit' } })).status()).toBe(403);
  const oldSession = await a.api.storageState();
  expect((await a.api.post('/api/profile/change-password', { data: { currentPassword: a.password, newPassword: 'Updated prototype 2026!' } })).status()).toBe(200);
  const old = await requestFactory.newContext({ baseURL: origin, storageState: oldSession });
  expect((await old.get('/api/auth/me')).status()).toBe(401);
  expect((await a.api.get('/api/auth/me')).status()).toBe(200);
});

test('server pricing, quote, idempotency, inventory and cancellation are consistent', async () => {
  const manager = await admin(), buyer = await account(), p = await product(manager), a = await address(buyer.api), key = randomUUID();
  const input = { items: [{ productId: p.id, quantity: 1 }], addressId: a.id };
  const quote = await buyer.api.post('/api/checkout/quote', { data: input }); expect((await quote.json()).quote.totalPrice).toBe(1250);
  expect((await buyer.api.post('/api/orders', { headers: { 'Idempotency-Key': randomUUID() }, data: { ...input, outcome: 'success', expectedTotal: 1 } })).status()).toBe(409);
  const response = await checkout(buyer.api, p.id, a.id, 'success', key); expect(response.status()).toBe(201);
  const order = (await response.json()).order; expect(Number(order.totalPrice)).toBe(1250); expect(order.fulfillmentStatus).toBe('Confirmed');
  const repeat = await checkout(buyer.api, p.id, a.id, 'success', key); expect((await repeat.json()).order.id).toBe(order.id);
  expect((await checkout(buyer.api, p.id, a.id, 'failure', key)).status()).toBe(409);
  await expect((await manager.get(`/api/products/${p.id}`)).json()).resolves.toMatchObject({ product: { stock: 1 } });
  const outsider = await account(); expect((await outsider.api.get(`/api/orders/${order.id}`)).status()).toBe(404);
  expect((await manager.patch(`/api/admin/orders/${order.id}/status`, { data: { status: 'Delivered' } })).status()).toBe(409);
  expect((await manager.post(`/api/admin/orders/${order.id}/notes`, { data: { adminNotes: 'Buyer requested a change.' } })).status()).toBe(200);
  expect((await manager.post(`/api/admin/orders/${order.id}/cancel`, { data: { reason: 'x'.repeat(1001) } })).status()).toBe(400);
  const cancelled = await manager.post(`/api/admin/orders/${order.id}/cancel`, { data: { reason: '  Buyer no longer needs this gear.  ' } });
  expect(cancelled.status()).toBe(200);
  const expectedNote = 'Buyer requested a change.\n\nCancellation reason: Buyer no longer needs this gear.';
  expect((await cancelled.json()).order.adminNotes).toBe(expectedNote);
  const cancelledAgain = await manager.post(`/api/admin/orders/${order.id}/cancel`, { data: { reason: 'Do not append this duplicate.' } });
  expect((await cancelledAgain.json()).order.adminNotes).toBe(expectedNote);
  await expect((await manager.get(`/api/admin/orders/${order.id}`)).json()).resolves.toMatchObject({ order: { adminNotes: expectedNote, timeline: expect.arrayContaining([expect.objectContaining({ status: 'Cancelled' })]) } });
  await expect((await manager.get(`/api/products/${p.id}`)).json()).resolves.toMatchObject({ product: { stock: 2 } });
  const invoice = await buyer.api.get(`/api/orders/${order.id}`); expect((await invoice.json()).order).toMatchObject({ amount: 1250, paymentStatus: 'refunded', shippingAddress: { street: addressData.street } });
});

test('failed payment leaves inventory unchanged and admin detail renders', async ({ page }) => {
  const manager = await admin(), buyer = await account(), p = await product(manager, 1), a = await address(buyer.api);
  const response = await checkout(buyer.api, p.id, a.id, 'failure'); expect(response.status()).toBe(201);
  const order = (await response.json()).order; expect(order.paymentStatus).toBe('failed');
  await expect((await manager.get(`/api/products/${p.id}`)).json()).resolves.toMatchObject({ product: { stock: 1 } });
  await page.context().addCookies((await manager.storageState()).cookies);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`/admin/orders/${order.id}`); await expect(page.getByText('PaymentFailed', { exact: true }).first()).toBeVisible(); expect(errors).toEqual([]);
});

test('concurrent buyers cannot oversell the last item', async () => {
  const manager = await admin(), one = await account(), two = await account(), p = await product(manager, 1), a = await address(one.api), b = await address(two.api);
  const responses = await Promise.all([checkout(one.api, p.id, a.id), checkout(two.api, p.id, b.id)]);
  expect(responses.filter(r => r.status() === 201)).toHaveLength(1);
  expect(responses.filter(r => r.status() === 409)).toHaveLength(1);
  await expect((await manager.get(`/api/products/${p.id}`)).json()).resolves.toMatchObject({ product: { stock: 0, status: 'Out of Stock' } });
});

test('seller submission, review, duplicate protection, own-purchase prevention, pickup and notes persist', async () => {
  const manager = await admin(), seller = await account(), a = await address(seller.api);
  const bytes = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#19336c' } }).png().toBuffer();
  const files = [1,2,3].map(n => ({ name: 'images', file: { name: `${n}.png`, mimeType: 'image/png', buffer: bytes } }));
  // FormData preserves repeated image entries via append, unlike object multipart fields.
  const form = new FormData();
  Object.entries({ fullName: 'Prototype Seller', email: seller.email, category: 'Cycling', title: 'Pre-owned bicycle helmet', description: 'A clean and well maintained sports helmet with clear condition details.', price: '1200', contactMethod: 'Email' }).forEach(([k,v]) => form.append(k,v));
  for (const { file } of files) form.append('images', new Blob([new Uint8Array(file.buffer)], { type: file.mimeType }), file.name);
  const cookie = (await seller.api.storageState()).cookies.map(c => `${c.name}=${c.value}`).join('; ');
  const submission = await fetch(origin + '/api/manual-sell', { method: 'POST', headers: { Cookie: cookie }, body: form });
  expect(submission.status).toBe(201); const id = (await submission.json()).sellRequest.id;
  expect((await seller.api.patch(`/api/admin/sell-requests/${id}`, { data: { action: 'approve' } })).status()).toBe(403);
  const approved = await manager.patch(`/api/admin/sell-requests/${id}`, { data: { action: 'approve', grade: 'A' } }); expect(approved.status()).toBe(200);
  const listing = (await approved.json()).product;
  expect((await manager.patch(`/api/admin/sell-requests/${id}`, { data: { action: 'approve' } })).status()).toBe(409);
  expect((await checkout(seller.api, listing.id, a.id)).status()).toBe(400);
  const pickup = await manager.post('/api/admin/pickups', { data: { requestId: id, assignee: 'Demo Team', scheduledAt: new Date(Date.now()+86400000).toISOString() } }); expect(pickup.status()).toBe(200);
  await expect((await manager.get('/api/admin/pickups')).json()).resolves.toMatchObject({ pickups: expect.arrayContaining([expect.objectContaining({ requestId: id })]) });
});

test('admin blocking persists and invalidates an existing session', async () => {
  const manager = await admin(), user = await account();
  const self = (await manager.get('/api/auth/me')).json(); const id = (await self).user.id;
  expect((await manager.patch(`/api/admin/users/${id}`, { data: { fullName: 'Updated Admin', role: 'admin', status: 'Active' } })).status()).toBe(200);
  await expect((await manager.get('/api/auth/me')).status()).toBe(200);
  expect((await manager.patch(`/api/admin/users/${user.user.id}`, { data: { status: 'Blocked' } })).status()).toBe(200);
  expect((await user.api.get('/api/auth/me')).status()).toBe(401);
});

test('invalid pagination and spoofed image uploads are rejected', async ({ request }) => {
  expect((await request.get('/api/products?limit=-1')).status()).toBe(400);
  expect((await request.get('/api/products?type=nonsense')).status()).toBe(400);
  const user = await account();
  expect((await user.api.post('/api/upload', { multipart: { file: { name: 'fake.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('<svg onload="alert(1)"></svg>') } } })).status()).toBe(400);
});

test('desktop home and mobile shop/cart preserve layout and hydrate without errors', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto('/'); await expect(page.getByRole('heading', { name: 'Keep the game going.' })).toBeVisible();
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/shop/preowned');
  await expect(page.locator('a[href="/products/demo-cricket"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(async () => { const p = (await (await fetch('/api/products/demo-cricket')).json()).product; localStorage.setItem('cart-storage', JSON.stringify([{ ...p, quantity: 1 }])); });
  await page.goto('/cart'); await expect(page.getByRole('heading', { name: 'Your Cart', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload(); await expect(page.getByText('Cricket practice bat', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'artifacts/cart-mobile.png', fullPage: true });
  await page.goto('/'); await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('browser checkout completes with a demo failure then success and a real invoice', async ({ page }) => {
  const user = await account(), saved = await address(user.api);
  await page.context().addCookies((await user.api.storageState()).cookies);
  await page.goto('/products/demo-cricket'); await page.getByRole('button', { name: 'Add to Cart' }).click();
  await page.goto('/checkout'); await expect(page.getByRole('radio', { name: /Prototype Player/ })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to Payment' }).click();
  await page.getByRole('radio', { name: /Simulate declined payment/ }).click();
  await page.getByRole('button', { name: 'Run demo payment' }).click(); await expect(page.getByRole('alert').filter({ hasText: 'Demo payment declined' })).toBeVisible();
  await page.getByRole('radio', { name: /Simulate successful payment/ }).click(); await page.getByRole('button', { name: 'Run demo payment' }).click();
  await expect(page).toHaveURL(/checkout\/success\?order=/); const order = new URL(page.url()).searchParams.get('order');
  await page.goto(`/invoice/${order}`); await expect(page.getByRole('heading', { name: 'Demo invoice' })).toBeVisible(); await expect(page.getByText('Cricket practice bat', { exact: true })).toBeVisible();
});

test('admin product form creates uploaded images and saves numeric price and stock', async ({ page }) => {
  const manager = await admin(); await page.context().addCookies((await manager.storageState()).cookies);
  await page.goto('/admin/products/new');
  await page.getByLabel('Name', { exact: true }).fill('Browser-created practice bat');
  await page.getByLabel('Description', { exact: true }).fill('A well described practice bat created through the admin product form.');
  await page.getByLabel('Price (₹)', { exact: true }).fill('1800');
  await page.getByLabel('Stock', { exact: true }).fill('7');
  await page.getByLabel('Category', { exact: true }).fill('Cricket');
  const bytes = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#c0cae0' } }).png().toBuffer();
  const upload = page.waitForResponse(r => r.url().endsWith('/api/upload'));
  await page.locator('input[type="file"]').setInputFiles({ name: 'gear.png', mimeType: 'image/png', buffer: bytes });
  expect((await upload).status()).toBe(200);
  const creation = page.waitForResponse(r => r.url().endsWith('/api/products/create'));
  await page.getByRole('button', { name: 'Save Product', exact: true }).first().click();
  const created = await creation; expect(created.status()).toBe(201); const p = (await created.json()).product;
  expect(p).toMatchObject({ price: 1800, stock: 7 }); expect(p.images).toHaveLength(1);
  await page.goto(`/admin/products/${p.id}`); await expect(page.getByLabel('Stock', { exact: true })).toHaveValue('7');
  await page.getByLabel('Price (₹)', { exact: true }).fill('1700'); await page.getByLabel('Stock', { exact: true }).fill('4');
  const edit = page.waitForResponse(r => r.url().endsWith(`/api/products/${p.id}`) && r.request().method() === 'PATCH');
  await page.getByRole('button', { name: 'Save Product', exact: true }).first().click();
  expect((await edit).status()).toBe(200);
  await expect((await manager.get(`/api/products/${p.id}`)).json()).resolves.toMatchObject({ product: { price: 1700, stock: 4 } });
});

test('address dialog retains data on API failure and saves to account on retry', async ({ page }) => {
  const user = await account(); await page.context().addCookies((await user.api.storageState()).cookies);
  await page.goto('/profile/addresses'); await page.getByRole('button', { name: 'Add an address', exact: true }).click();
  const dialog = page.getByRole('dialog');
  for (const [label, value] of [['Address Title','Home'],['Full Name','Prototype Player'],['Phone Number','9876543210'],['Street Address','123 Demo Street'],['City','Mumbai'],['Postal Code','400001']]) await dialog.getByLabel(label, { exact: true }).fill(value);
  await dialog.getByLabel('State', { exact: true }).click(); await page.getByRole('option', { name: 'Maharashtra', exact: true }).click();
  await page.route('**/api/profile/addresses', route => route.request().method() === 'POST' ? route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Demo save failed' }) }) : route.continue());
  await dialog.getByRole('button', { name: 'Save Address', exact: true }).click();
  await expect(page.getByText('Demo save failed', { exact: true })).toBeVisible(); await expect(dialog).toBeVisible();
  await page.unroute('**/api/profile/addresses');
  await dialog.getByRole('button', { name: 'Save Address', exact: true }).click(); await expect(dialog).not.toBeVisible();
  await page.reload(); await expect(page.getByText('123 Demo Street, Mumbai, Maharashtra 400001')).toBeVisible();
});

test('restocking a cancelled last-item order preserves an admin archive decision', async () => {
  const manager = await admin(), buyer = await account(), p = await product(manager, 1), a = await address(buyer.api);
  const placed = await checkout(buyer.api, p.id, a.id); const order = (await placed.json()).order;
  expect(placed.status()).toBe(201);
  await manager.patch(`/api/products/${p.id}`, { data: { isAvailable: false } });
  expect((await manager.post(`/api/admin/orders/${order.id}/cancel`, { data: {} })).status()).toBe(200);
  await expect((await manager.get(`/api/products/${p.id}`)).json()).resolves.toMatchObject({ product: { stock: 1, status: 'Out of Stock' } });
  const published = await manager.get(`/api/products?available=true&q=${encodeURIComponent(p.name)}`);
  expect((await published.json()).products.some((item: { id: string }) => item.id === p.id)).toBe(false);
});

test('GSAP finishes visible animations and narrow two-column catalogs fit the viewport', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 430, height: 900 }); await page.goto('/');
  await expect.poll(() => page.locator('h1').evaluate(el => Number(getComputedStyle(el).opacity))).toBe(1);
  const featured = page.getByRole('heading', { name: 'Featured Gear', exact: true }); await featured.scrollIntoViewIfNeeded();
  await expect.poll(() => featured.locator('xpath=ancestor::section').evaluate(el => Number(getComputedStyle(el).opacity))).toBe(1);
  await page.goto('/shop/preowned'); await expect(page.locator('a[href="/products/demo-cricket"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('revenue uses saved product types and matching order references, then excludes refunds', async () => {
  const manager = await admin(), buyer = await account(), p = await product(manager), a = await address(buyer.api);
  const before = (await (await manager.get('/api/admin/revenue')).json()).data;
  const placed = await checkout(buyer.api, p.id, a.id);
  expect(placed.status()).toBe(201);
  const order = (await placed.json()).order;
  const current = (await (await manager.get('/api/admin/revenue')).json()).data;
  const preowned = (data: typeof current) => data.salesTypeData.find((row: { name: string }) => row.name === 'Pre-Owned')?.value || 0;
  expect(preowned(current)).toBe(preowned(before) + 1);
  expect(current.summary.itemsSold).toBe(before.summary.itemsSold + 1);
  expect(current.summary.totalSales).toBe(before.summary.totalSales + 1);
  const sale = current.recentSales.find((row: { id: string }) => row.id === `ORD-${order.id.slice(0,8).toUpperCase()}`);
  expect(sale).toMatchObject({ type: 'Pre-Owned', amount: 1250 });
  expect((await manager.get(`/api/admin/orders/${sale.id}`)).status()).toBe(200);
  await manager.post(`/api/admin/orders/${order.id}/cancel`, { data: {} });
  const refunded = (await (await manager.get('/api/admin/revenue')).json()).data;
  expect(refunded.summary).toEqual(before.summary);
});

test('cookie authentication survives blocked local storage and logout still succeeds', async ({ page }) => {
  const user = await account();
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    for (const method of ['getItem','setItem','removeItem'] as const) {
      const original = Storage.prototype[method];
      Object.defineProperty(Storage.prototype, method, { value: function (...args: string[]) {
        if (this === window.localStorage) throw new DOMException('Storage blocked', 'SecurityError');
        return Reflect.apply(original, this, args);
      } });
    }
  });
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(user.password);
  await page.getByRole('button', { name: 'Log In', exact: true }).click();
  await expect(page).toHaveURL(origin + '/');
  await expect(page.getByRole('button', { name: 'Your account', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Your account', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Log out', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
  expect((await page.request.get('/api/auth/me')).status()).toBe(401);
  expect(errors).toEqual([]);
});

test('guest buying intent survives login to registration and malformed return links remain safe', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/login?redirect=%25');
  await expect(page.getByRole('link', { name: 'Cancel and go back' })).toHaveAttribute('href', '/');
  await page.goto('/products/demo-cricket');
  await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?redirect=/);
  await page.getByRole('link', { name: 'Register here' }).click();
  await expect(page).toHaveURL(/\/register\?redirect=/);
  await page.getByLabel('Full Name', { exact: true }).fill('New Gear Player');
  await page.getByLabel('Email Address', { exact: true }).fill(`new-${randomUUID()}@example.test`);
  await page.getByLabel('Password', { exact: true }).fill('New player prototype 2026!');
  await page.getByRole('button', { name: 'Create Account', exact: true }).click();
  await expect(page).toHaveURL(origin + '/cart');
  await expect(page.getByText('Cricket practice bat', { exact: true })).toBeVisible();
  expect((await page.request.get('/api/auth/me')).status()).toBe(200);
  expect(errors).toEqual([]);
});

test('checkout works with browser storage blocked and displays the current quoted address', async ({ page }) => {
  const manager = await admin(), buyer = await account(), p = await product(manager), saved = await address(buyer.api);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.context().addCookies((await buyer.api.storageState()).cookies);
  await page.addInitScript(() => {
    for (const method of ['getItem','setItem','removeItem'] as const) Object.defineProperty(Storage.prototype, method, {
      value: () => { throw new DOMException('Storage blocked', 'SecurityError'); },
    });
  });
  await page.goto(`/products/${p.id}`);
  await expect(page.getByRole('button', { name: 'Your account', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Buy Now', exact: true }).click();
  await expect(page.getByRole('radio', { name: /Prototype Player/ })).toBeVisible();
  expect((await buyer.api.put(`/api/profile/addresses/${saved.id}`, { data: { street: '456 Updated Demo Street' } })).status()).toBe(200);
  await page.getByRole('button', { name: 'Continue to Payment' }).click();
  await expect(page.getByText('456 Updated Demo Street, Mumbai, Maharashtra 400001', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Run demo payment' }).click();
  await expect(page).toHaveURL(/checkout\/success\?order=/);
  expect(errors).toEqual([]);
});
