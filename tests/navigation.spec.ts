import { test, expect } from '@playwright/test';

test('desktop home motion starts after hydration without a development issue badge', async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error' && /hydrat|server rendered HTML/i.test(message.text())) hydrationErrors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect.poll(() => page.locator('h1').evaluate(element => Number(getComputedStyle(element).opacity))).toBe(1);
  await expect(page.locator('.product-card').first()).toBeVisible();
  expect(hydrationErrors).toEqual([]);
  await expect(page.getByRole('button', { name: 'Open issues overlay' })).toHaveCount(0);
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'New gear', exact: true }).click();
  await expect(page).toHaveURL('/shop/new');
  await page.getByRole('link', { name: 'KhelWapas home', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect.poll(() => page.locator('h1').evaluate(element => Number(getComputedStyle(element).opacity))).toBe(1);
  expect(hydrationErrors).toEqual([]);
});

test('catalog starts fetching immediately while only search typing is debounced', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const now = new Date();
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  const queries: string[] = [];
  await page.route('**/api/products?**', async route => {
    const params = new URL(route.request().url()).searchParams;
    if (params.get('type') === 'new') queries.push(params.get('q') || '');
    await route.fulfill({ json: {
      success: true,
      products: [{ id: 'navigation-gear', name: 'Navigation cricket bat', category: 'Cricket', type: 'new', price: 1000, stock: 1, status: 'In Stock', image: '/images/demo-catalog/cricket-practice-bat.webp' }],
      categories: ['Cricket'], pagination: { total: 1, pages: 1 },
    } });
  });
  await page.goto('/shop/new');
  // The clock is paused: an initial fetch behind any debounce cannot complete.
  await expect(page.locator('.product-card')).toHaveCount(1);
  expect(queries.length).toBeGreaterThan(0);
  expect(queries.every(query => query === '')).toBe(true);
  const initialRequests = queries.length;
  await page.getByRole('textbox', { name: 'Search gear' }).fill('bat');
  await page.clock.runFor(179);
  expect(queries).toHaveLength(initialRequests);
  await page.clock.runFor(1);
  await expect.poll(() => queries.length).toBe(initialRequests + 1);
  expect(queries.at(-1)).toBe('bat');
  await page.getByRole('combobox', { name: 'Sport', exact: true }).selectOption('Cricket');
  await expect.poll(() => queries.length).toBe(initialRequests + 2);
});

test('page changes keep navigation responsive and reduced motion leaves no entrance animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/shop/preowned');
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'New gear', exact: true }).click();
  await expect(page).toHaveURL('/shop/new');
  await expect(page.getByRole('heading', { name: 'Fresh gear. Fresh possibilities.' })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Opening page', exact: true })).toHaveCount(0);
  expect(await page.locator('main').evaluate(element => element.getAnimations().length)).toBe(0);
});
