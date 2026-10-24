import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

test('mobile landing has a two-by-two product grid, paired footer groups and no app dock', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const cards = page.locator('.product-grid .product-card');
  await expect(cards).toHaveCount(4);
  const boxes = await cards.evaluateAll(elements => elements.map(el => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width }; }));
  expect(boxes[0].y).toBeCloseTo(boxes[1].y, 0);
  expect(boxes[0].x).toBeCloseTo(boxes[2].x, 0);
  expect(boxes[2].y).toBeCloseTo(boxes[3].y, 0);
  expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
  expect(boxes[2].y).toBeGreaterThan(boxes[0].y);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThan(2400);
  const left = await page.locator('footer nav[aria-label="Explore"]').boundingBox();
  const right = await page.locator('footer nav[aria-label="Your account"]').boundingBox();
  expect(left!.y).toBeCloseTo(right!.y, 0);
  expect(right!.x).toBeGreaterThan(left!.x);
  await expect(page.getByRole('navigation', { name: 'Mobile navigation', exact: true })).toHaveCount(0);
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const columns = await page.locator('.product-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(2);
  }
});

test('app dock appears only on authenticated app screens and goes away after logout', async ({ page, playwright }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/shop/preowned');
  await expect(page.getByRole('navigation', { name: 'Mobile navigation', exact: true })).toHaveCount(0);
  const api = await playwright.request.newContext({ baseURL: 'http://localhost:9003' });
  const response = await api.post('/api/auth/register', { data: { fullName: 'Mobile Player', email: `mobile-${randomUUID()}@example.test`, password: 'Mobile prototype 2026!' } });
  expect(response.status()).toBe(201);
  await page.context().addCookies((await api.storageState()).cookies);
  await page.reload();
  const dock = page.getByRole('navigation', { name: 'Mobile navigation', exact: true });
  await expect(dock).toBeVisible();
  await expect(dock.getByRole('link', { name: 'Explore' })).toHaveAttribute('aria-current', 'page');
  await page.goto('/'); await expect(dock).toHaveCount(0);
  await page.goto('/shop/preowned'); await expect(dock).toBeVisible();
  await page.request.post('/api/auth/logout'); await page.reload(); await expect(dock).toHaveCount(0);
  await api.dispose();
});

test('dark mode follows system preference, toggles, persists and works across routes and tabs', async ({ page, context }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'Turn on light mode' })).toBeVisible();
  const color = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
  expect(color).not.toBe('rgb(255, 255, 255)');
  const channels = color.match(/[\d.]+/g)!.slice(0,3).map(Number);
  expect(Math.max(...channels) - Math.min(...channels)).toBeLessThanOrEqual(2);
  await page.getByRole('button', { name: 'Turn on light mode' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.reload(); await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.getByRole('button', { name: 'Turn on dark mode' }).click();
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Pre-owned gear', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  const other = await context.newPage(); await other.goto('/help'); await expect(other.locator('html')).toHaveClass(/dark/);
  await other.getByRole('button', { name: 'Turn on light mode' }).click(); await expect(page.locator('html')).not.toHaveClass(/dark/);
  await other.close(); expect(errors).toEqual([]);
});

test('dark mobile menu, catalog and form surfaces stay readable with no overflow', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/shop/preowned');
  await expect(page.locator('.product-card').first()).toBeVisible();
  expect(await page.locator('.product-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(2);
  const cardColor = await page.locator('.product-card').first().evaluate(el => getComputedStyle(el).backgroundColor);
  expect(cardColor).not.toBe('rgb(255, 255, 255)');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const menuColor = await page.getByRole('dialog').evaluate(el => getComputedStyle(el).backgroundColor);
  expect(menuColor).not.toBe('rgb(255, 255, 255)');
  await page.getByRole('dialog').getByRole('link', { name: 'Sign in / Register' }).click();
  await expect(page.getByText('Welcome Back', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('desktop motion cleans up on navigation and disables for reduced motion', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/'); await expect.poll(() => page.locator('h1').evaluate(el => Number(getComputedStyle(el).opacity))).toBe(1);
  const panel = page.locator('.hero-glass'); const box = await panel.boundingBox();
  await page.mouse.move(box!.x + 20, box!.y + 20);
  await expect.poll(() => panel.evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-hero-background]')).not.toHaveAttribute('style', /transform/);
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Pre-owned gear', exact: true }).click();
  await expect(page.locator('.product-card').first()).toBeVisible();
  await expect(page.locator('.product-card').first()).not.toHaveAttribute('style', /transform|opacity/);
  expect(errors).toEqual([]);
});
