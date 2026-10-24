import { test, expect } from '@playwright/test';

function catalog(type: string, updated = false) {
  return { success: true, products: [{ id: type, name: `${type} ${updated ? 'updated' : 'original'} gear`, type, category: 'Cricket', price: updated ? 900 : 1000, stock: updated ? 2 : 3, status: 'In Stock', image: '/images/demo-catalog/cricket-practice-bat.webp' }], categories: ['Cricket'], pagination: { total: 1, pages: 1 } };
}

test('rapid catalog revisits keep matching cards visible while one shared read refreshes stock', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 960 });
  const requests: Record<string, number> = { new: 0, preowned: 0 };
  let hold = false;
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/products?**', async route => {
    const type = new URL(route.request().url()).searchParams.get('type');
    if (!type) return route.continue();
    requests[type]++;
    const refresh = hold;
    if (refresh) await gate;
    await route.fulfill({ json: catalog(type, refresh) });
  });
  await page.goto('/shop/preowned');
  await expect(page.getByRole('heading', { name: 'preowned original gear', exact: true })).toBeVisible();
  await expect.poll(() => requests.new).toBeGreaterThan(0);
  // Warm both public listings, then hold real freshness checks until after navigation.
  const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
  await nav.getByRole('link', { name: 'New gear', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'new original gear', exact: true })).toBeVisible();
  await nav.getByRole('link', { name: 'Pre-owned gear', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'preowned original gear', exact: true })).toBeVisible();
  const initial = { ...requests };
  hold = true;
  try {
    await nav.getByRole('link', { name: 'New gear', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'new original gear', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'preowned original gear', exact: true })).toHaveCount(0);
    await nav.getByRole('link', { name: 'Pre-owned gear', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'preowned original gear', exact: true })).toBeVisible();
    await nav.getByRole('link', { name: 'New gear', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'new original gear', exact: true })).toBeVisible();
    await expect.poll(() => requests.new).toBe(initial.new + 1);
    await expect.poll(() => requests.preowned).toBe(initial.preowned + 1);
  } finally { release(); }
  await expect(page.getByRole('heading', { name: 'new updated gear', exact: true })).toBeVisible();
  await expect(page.locator('.product-card')).toContainText('900');
});

test('a failed background refresh keeps recently viewed gear and retry refreshes it', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 960 });
  let fail = false, updated = false;
  await page.route('**/api/products?**', async route => {
    const type = new URL(route.request().url()).searchParams.get('type');
    if (!type) return route.continue();
    if (fail) return route.fulfill({ status: 503, json: { message: 'Connection unavailable' } });
    await route.fulfill({ json: catalog(type, updated) });
  });
  await page.goto('/shop/new');
  await expect(page.getByRole('heading', { name: 'new original gear', exact: true })).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
  await nav.getByRole('link', { name: 'Sell your gear', exact: true }).click();
  await expect(page).toHaveURL('/sell');
  fail = true;
  await nav.getByRole('link', { name: 'New gear', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'new original gear', exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Showing recently viewed gear. Connection unavailable');
  fail = false; updated = true;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'new updated gear', exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});
