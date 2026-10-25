import { test, expect } from '@playwright/test';

test.skip(process.env.NEXT_PUBLIC_BACKEND_WAKE !== 'true', 'Run with NEXT_PUBLIC_BACKEND_WAKE=true to exercise the split-host startup gate.');

test('wake screen waits for readiness before starting authentication or mounting forms', async ({ page }) => {
  let ready = false, checks = 0, authChecks = 0;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 700 });
  await page.route('**/api/backend-status', route => {
    checks++;
    return route.fulfill({ status: ready ? 200 : 503, json: { ready } });
  });
  page.on('request', request => { if (request.url().includes('/api/auth/me')) authChecks++; });
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Getting the game ready.' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Email Address' })).toHaveCount(0);
  expect(authChecks).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect.poll(() => checks).toBeGreaterThan(0);
  ready = true;
  await expect(page.getByRole('textbox', { name: 'Email Address' })).toBeVisible();
  await expect.poll(() => authChecks).toBeGreaterThan(0);
});

test('wake timeout offers a retry and a later reconnect preserves an unfinished form', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  let ready = false, checks = 0;
  await page.route('**/api/backend-status', route => {
    checks++;
    return route.fulfill({ status: ready ? 200 : 503, json: { ready } });
  });
  await page.goto('/login');
  await expect.poll(() => checks).toBeGreaterThan(0);
  await page.clock.fastForward(121_000);
  await expect(page.getByRole('heading', { name: 'Taking a little longer.' })).toBeVisible();
  ready = true;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  const email = page.getByRole('textbox', { name: 'Email Address' });
  await expect(email).toBeVisible();
  await email.fill('unsent@example.test');
  await page.clock.fastForward(301_000);
  ready = false;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', { name: 'Getting the game ready.' })).toBeVisible();
  expect(await page.locator('input[name="email"]').inputValue()).toBe('unsent@example.test');
  ready = true;
  await page.clock.fastForward(5000);
  await expect(email).toBeVisible();
  await expect(email).toHaveValue('unsent@example.test');
});
