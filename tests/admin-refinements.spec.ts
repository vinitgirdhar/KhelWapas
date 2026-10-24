import { test, expect, request as requestFactory } from '@playwright/test';
import { randomUUID } from 'crypto';
import { adminContext } from './helpers/admin';

async function manager() {
  return adminContext();
}

test('admin user search, role filters and pagination return accurate totals', async () => {
  const admin = await manager();
  const buyer = await requestFactory.newContext({ baseURL: 'http://localhost:9003' });
  const email = `admin-review-${randomUUID()}@example.test`;
  const registration = await buyer.post('/api/auth/register', { data: { fullName: 'Review Player', email, password: 'Review prototype 2026!' } });
  expect(registration.status()).toBe(201);
  const response = await admin.get(`/api/admin/users?q=${encodeURIComponent(email)}&role=user&limit=1&page=1`);
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.users).toHaveLength(1); expect(data.users[0].email).toBe(email);
  expect(data.pagination).toMatchObject({ page: 1, limit: 1, total: 1, pages: 1 });
  expect((await admin.get('/api/admin/users?role=owner')).status()).toBe(400);
  expect((await admin.get('/api/admin/users?limit=101')).status()).toBe(400);
  await buyer.dispose(); await admin.dispose();
});

test('admin lists fit a narrow dark viewport and keep search failures distinct from empty data', async ({ page }) => {
  const admin = await manager(); await page.context().addCookies((await admin.storageState()).cookies);
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 640 });
  for (const path of ['/admin/products', '/admin/users', '/admin/requests', '/admin/orders']) {
    await page.goto(path);
    await expect(page.getByRole('link', { name: 'Back to marketplace', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log out', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/admin/users');
  await page.getByRole('combobox', { name: 'Account role' }).selectOption('admin');
  await expect(page.getByRole('cell', { name: 'Admin', exact: true }).first()).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search users' }).fill('no-matching-account-00000');
  await expect(page.getByText('No accounts match your search.', { exact: true })).toBeVisible();
  await page.route('**/api/products?**', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Products temporarily unavailable' }) }));
  await page.goto('/admin/products');
  await expect(page.getByRole('alert').filter({ hasText: 'Products temporarily unavailable' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
  await admin.dispose();
});

test('restocking a published zero-stock product preserves listing visibility and touch image controls', async ({ page }) => {
  const admin = await manager();
  const response = await admin.post('/api/products/create', { data: { name: 'Published restock review gear', category: 'Cricket', type: 'new', price: 900, description: 'A valid sports equipment listing for the admin stock refinement review.', imageUrls: ['/images/products/background.jpg'], stock: 0, isAvailable: true } });
  expect(response.status()).toBe(201); const product = (await response.json()).product;
  await page.context().addCookies((await admin.storageState()).cookies);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/admin/products/${product.id}`);
  await expect(page.getByRole('combobox', { name: 'Listing visibility' })).toHaveText('Published');
  await expect(page.getByRole('button', { name: 'Remove image 1', exact: true })).toBeVisible();
  await expect(page.getByLabel('SKU', { exact: true })).toHaveAttribute('readonly', '');
  await page.getByLabel('Stock', { exact: true }).fill('4');
  const saved = page.waitForResponse(r => r.url().endsWith(`/api/products/${product.id}`) && r.request().method() === 'PATCH');
  await page.getByRole('button', { name: 'Save Product', exact: true }).last().click();
  const result = await saved; expect(result.status()).toBe(200);
  expect((await result.json()).product).toMatchObject({ stock: 4, isAvailable: true, status: 'In Stock' });
  await admin.dispose();
});

test('review errors retain the decision note and completed requests cannot be reviewed again', async ({ page }) => {
  const admin = await manager(); await page.context().addCookies((await admin.storageState()).cookies);
  const fixture = { id: 'review-fixture', title: 'Equipment awaiting a careful condition review', category: 'Cricket', description: 'Clear condition details for a demonstration sports listing.', price: 900, status: 'Pending', fullName: 'Review Seller', email: 'seller@example.test', contactMethod: 'Email', imageUrls: ['/images/products/background.jpg'] };
  let attempts = 0;
  await page.route('**/api/admin/sell-requests/review-fixture', route => {
    if (route.request().method() === 'GET') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, sellRequest: fixture }) });
    attempts++;
    return route.fulfill({ status: attempts === 1 ? 500 : 200, contentType: 'application/json', body: JSON.stringify(attempts === 1 ? { message: 'Review temporarily unavailable' } : { success: true, message: 'Listing approved and published' }) });
  });
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/admin/requests/review-fixture');
  await page.getByLabel('Reason (optional)', { exact: true }).fill('Condition and photos checked.');
  await page.getByRole('button', { name: 'Approve Request', exact: true }).click();
  await expect(page.getByText('Review temporarily unavailable', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Reason (optional)', { exact: true })).toHaveValue('Condition and photos checked.');
  await page.getByRole('button', { name: 'Approve Request', exact: true }).click();
  await expect(page.getByText('This request has already been reviewed.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve Request', exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await admin.dispose();
});
