import { test, expect, type Page } from '@playwright/test';

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && /hydrat|server rendered|webgl|three\.js/i.test(message.text())) errors.push(message.text());
  });
  return errors;
}

test('desktop WebGL sports equipment supports drag, keyboard controls and sport selection', async ({ page }) => {
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const showcase = page.locator('[data-gear-showcase]');
  await expect(showcase).toHaveAttribute('data-renderer', 'webgl');
  const canvas = showcase.getByRole('img', { name: 'Interactive sports equipment', exact: true });
  await expect(canvas).toBeVisible();
  expect(await canvas.evaluate(element => (element as HTMLCanvasElement).width > 0 && (element as HTMLCanvasElement).height > 0)).toBe(true);
  const rotationBefore = await canvas.getAttribute('data-rotation');
  const bounds = (await canvas.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width * .4, bounds.y + bounds.height * .5);
  await page.mouse.down();
  await expect(canvas).toHaveAttribute('data-dragging', 'true');
  await page.mouse.move(bounds.x + bounds.width * .7, bounds.y + bounds.height * .6, { steps: 8 });
  await page.mouse.up();
  await expect(canvas).toHaveAttribute('data-dragging', 'false');
  await expect.poll(async () => Math.abs(Number(await canvas.getAttribute('data-rotation')) - Number(rotationBefore))).toBeGreaterThan(.2);
  await canvas.focus();
  const beforeKeyboard = await canvas.getAttribute('data-rotation');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => canvas.getAttribute('data-rotation')).not.toBe(beforeKeyboard);
  const beforeSpin = await canvas.getAttribute('data-rotation');
  await page.keyboard.press('Space');
  await expect.poll(() => canvas.getAttribute('data-rotation')).not.toBe(beforeSpin);
  for (const [index, sport] of ['cricket', 'badminton', 'basketball'].entries()) {
    const button = showcase.getByRole('button', { name: `Show ${sport} equipment`, exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas).toHaveAttribute('data-sport', String(index));
  }
  await expect(showcase.getByRole('link', { name: 'Find its next player' })).toHaveAttribute('href', '/shop/preowned');
  await expect(showcase.getByRole('button', { name: /Go wild|Give it a spin|Rotate left|Rotate right|Reset view/ })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('reduced-motion equipment remains still at rest and responds to explicit controls', async ({ page }) => {
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const showcase = page.locator('[data-gear-showcase]');
  await expect(showcase).toHaveAttribute('data-renderer', 'webgl');
  const canvas = showcase.getByRole('img', { name: 'Interactive sports equipment', exact: true });
  await expect.poll(async () => {
    const frames = await canvas.getAttribute('data-frames');
    const rotation = await canvas.getAttribute('data-rotation');
    await page.waitForTimeout(250);
    return frames === await canvas.getAttribute('data-frames') && rotation === await canvas.getAttribute('data-rotation');
  }).toBe(true);
  const before = await canvas.getAttribute('data-rotation');
  await canvas.focus();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => canvas.getAttribute('data-rotation')).not.toBe(before);
  await page.keyboard.press('r');
  await expect.poll(async () => Math.abs(Number(await canvas.getAttribute('data-rotation')) - Number(before))).toBeLessThan(.03);
  await showcase.getByRole('button', { name: 'Show basketball equipment', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-sport', '2');
  await expect(canvas).toHaveAttribute('data-rotation', before!);
  const beforeTap = await canvas.getAttribute('data-rotation');
  await canvas.click();
  await expect.poll(() => canvas.getAttribute('data-rotation')).not.toBe(beforeTap);
  expect(errors).toEqual([]);
});

test('mobile keeps the original hero and creates no WebGL canvas', async ({ page }) => {
  const errors = collectErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expect(page.locator('[data-hero] h1')).toHaveText('Keep thegame going.');
    await expect(page.locator('[data-gear-showcase]')).toBeHidden();
    await expect(page.locator('[data-hero] canvas')).toHaveCount(0);
    const shop = page.locator('[data-hero]').getByRole('link', { name: 'Shop gear', exact: true });
    const sell = page.locator('[data-hero]').getByRole('link', { name: 'Sell your gear', exact: true });
    await expect(shop).toBeVisible();
    await expect(sell).toBeVisible();
    expect((await shop.boundingBox())!.y).toBeCloseTo((await sell.boundingBox())!.y, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('interactive equipment fits tablet and desktop without overflowing', async ({ page }) => {
  const errors = collectErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('/');
    const showcase = page.locator('[data-gear-showcase]');
    await expect(showcase).toHaveAttribute('data-renderer', 'webgl');
    await expect(showcase.getByRole('img', { name: 'Interactive sports equipment', exact: true })).toBeVisible();
    const hint = await showcase.getByText('Drag to rotate · Tap the gear', { exact: true }).boundingBox();
    const canvasBounds = await showcase.locator('canvas').boundingBox();
    expect(hint!.y + hint!.height).toBeLessThan(canvasBounds!.y);
    const bounds = (await showcase.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});
