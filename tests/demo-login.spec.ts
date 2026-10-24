import { expect, test } from '@playwright/test';
import { adminContext } from './helpers/admin';

test('demo login opens personal sample orders that are also visible to admins', async ({ page }) => {
  await page.goto('/login');
  const demoButton = page.getByRole('button', { name: 'Demo Login', exact: true });
  await expect(demoButton).toBeVisible();
  await demoButton.click();
  await expect(page).toHaveURL(/\/profile\/orders$/);
  await expect(page.getByRole('heading', { name: 'Your orders', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View demo invoice' }).first()).toBeVisible();
  const session = await (await page.request.get('/api/auth/me')).json();
  expect(session.user.role).toBe('user');
  const orders = await (await page.request.get('/api/orders')).json();
  expect(orders.orders.length).toBeGreaterThan(0);
  const admin = await adminContext();
  const adminOrders = await (await admin.get('/api/orders?limit=100')).json();
  expect(adminOrders.orders.some((order: { id: string }) => order.id === orders.orders[0].id)).toBe(true);
  await admin.dispose();
});

test('demo login retains the destination after a recoverable API error', async ({ page }) => {
  await page.route('**/api/auth/demo', route => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ success: false, message: 'Demo setup is temporarily unavailable. Try again.' }),
  }));
  await page.goto('/login?redirect=%2Fshop%2Fnew');
  await page.getByRole('button', { name: 'Demo Login', exact: true }).click();
  await expect(page.getByText('Demo setup is temporarily unavailable. Try again.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Demo Login', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Log In', exact: true })).toBeEnabled();
  await page.unroute('**/api/auth/demo');
  await page.getByRole('button', { name: 'Demo Login', exact: true }).click();
  await expect(page).toHaveURL(/\/shop\/new$/);
  expect((await (await page.request.get('/api/auth/me')).json()).user.role).toBe('user');
});
