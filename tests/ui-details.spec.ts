import { test, expect, type Page } from '@playwright/test';

const player = { id: 'ui-player', fullName: 'Detail Player', email: 'detail@example.test', role: 'user' };
const listing = {
  id: 'ui-detail', name: 'Professional'.repeat(13), category: 'Strength and conditioning',
  type: 'preowned', price: 10000000, originalPrice: 10000001, grade: 'A',
  image: '/images/products/background.jpg', images: ['/images/logo.png'],
  description: 'LongDescription'.repeat(40), specs: { 'Manufacturer reference': 'Reference'.repeat(50) },
  status: 'In Stock', stock: 2, sellerId: 'another-player', dataAiHint: 'gear',
};
async function signInUI(page: Page) {
  await page.route('**/api/auth/me', route => route.fulfill({ json: { success: true, user: player } }));
}
async function fitsScreen(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test('long listing details stay inside narrow screens and repeated adds respect stock', async ({ page }) => {
  await signInUI(page);
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.route('**/api/products/ui-detail', route => route.fulfill({ json: { success: true, product: listing } }));
  await page.route('**/api/products?*', route => route.fulfill({ status: 503, json: { message: 'Recommendations unavailable' } }));
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/products/ui-detail');
  await expect(page.getByRole('heading', { name: listing.name, exact: true })).toBeVisible();
  for (const width of [320, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await fitsScreen(page);
  }
  await page.getByRole('button', { name: 'View image 2 of 2' }).click();
  await expect(page.getByRole('button', { name: 'View image 2 of 2' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Increase quantity', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
  await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('cart-storage') || '[]')[0]?.quantity)).toBe(2);
});

test('seller photo controls work on touch screens and validate upload limits immediately', async ({ page }) => {
  await signInUI(page);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/sell');
  await expect(page.getByLabel('Full Name', { exact: true })).toHaveValue(player.fullName);
  await expect(page.getByText('Upload Images (Min 3, Max 10)', { exact: true })).toBeVisible();
  const upload = page.locator('input[type="file"]');
  await upload.setInputFiles({ name: 'oversized.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
  await expect(page.getByText('Each image must be 5 MB or smaller.', { exact: true })).toBeVisible();
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  await upload.setInputFiles([1, 2, 3].map(n => ({ name: `image-${n}.png`, mimeType: 'image/png', buffer: png })));
  await expect(page.getByRole('button', { name: 'Remove image', exact: false })).toHaveCount(3);
  const remove = page.getByRole('button', { name: 'Remove image 2', exact: true });
  await expect(remove).toBeVisible();
  expect(await remove.evaluate(el => Number(getComputedStyle(el).opacity))).toBe(1);
  await remove.click();
  await expect(page.getByRole('button', { name: 'Remove image', exact: false })).toHaveCount(2);
  await fitsScreen(page);
});

test('account long content wraps and address dialog fits a short mobile viewport', async ({ page }) => {
  await signInUI(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 480 });
  const address = { id: 'address-ui', title: 'Home', fullName: 'LongName'.repeat(10), street: 'LongStreet'.repeat(24), city: 'Bengaluru', state: 'Karnataka', postalCode: '560001', phone: '9876543210' };
  await page.route('**/api/profile/addresses', route => route.fulfill({ json: [address] }));
  await page.route('**/api/orders?*', route => route.fulfill({ json: { orders: [{ id: 'ui-order', orderId: 'OrderReference'.repeat(8), orderDate: '2026-10-24', orderStatus: 'Confirmed', amount: 10000000, items: [{ productName: listing.name, quantity: 1, price: 10000000, image: listing.image }] }] } }));
  await page.goto('/profile/orders');
  await expect(page.getByText(listing.name, { exact: true })).toBeVisible();
  await fitsScreen(page);
  await page.goto('/profile/addresses');
  await expect(page.getByText(address.fullName, { exact: true })).toBeVisible();
  await fitsScreen(page);
  await page.getByRole('button', { name: 'Add an address', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Add New Address' });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(15);
  expect(box!.y).toBeGreaterThanOrEqual(15);
  expect(box!.x + box!.width).toBeLessThanOrEqual(305);
  expect(box!.y + box!.height).toBeLessThanOrEqual(465);
  await dialog.getByRole('button', { name: 'Save Address', exact: true }).scrollIntoViewIfNeeded();
  await expect(dialog.getByRole('button', { name: 'Save Address', exact: true })).toBeInViewport();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).not.toBeVisible();
});
