import { test, expect } from '@playwright/test';
import { adminContext } from './helpers/admin';

test('admin order status selection survives pagination and stays consistent with rows', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const manager = await adminContext();
  await page.context().addCookies((await manager.storageState()).cookies);
  await page.route('**/api/orders?*', route => {
    const number = Number(new URL(route.request().url()).searchParams.get('page'));
    const orders = Array.from({ length: 20 }, (_, index) => ({
      id: `order-${number}-${index}`, orderId: `ORD-${number}-${index}`, customer: { name: `Player ${number}-${index}`, email: 'player@example.test' },
      product: { name: 'Cricket bat' }, amount: 1200, orderDate: '2026-10-24T00:00:00Z',
      orderStatus: index % 2 ? 'Shipped' : 'Pending', pickupStatus: 'Completed',
    }));
    return route.fulfill({ json: { success: true, orders } });
  });
  await page.goto('/admin/orders');
  const tab = page.getByRole('tab', { name: 'Shipped', exact: true });
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
  for (const [button, number] of [['Next', 2], ['Previous', 1]] as const) {
    await page.getByRole('button', { name: button, exact: true }).click();
    await expect(page.getByText(`Page ${number} · 20 orders`, { exact: true })).toBeVisible();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('cell', { name: 'Shipped', exact: true })).toHaveCount(10);
    await expect(page.getByRole('cell', { name: 'Pending', exact: true })).toHaveCount(0);
  }
  await manager.dispose();
});
