import { test, expect, request as requestFactory } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { seedDemoMarketplace } from '../src/server/demo/fixtures';
import { adminContext } from './helpers/admin';

const db = new PrismaClient();
test.afterAll(() => db.$disconnect());

test('demo seed creates four linked users and preserves stock, reviews and account edits on rerun', async () => {
  const users = await seedDemoMarketplace(db);
  expect(users).toHaveLength(4);
  expect(users.every(user => user.role === 'user' && user.email.endsWith('@demo.khelwapas.invalid'))).toBe(true);
  const userIds = users.map(user => user.id);
  const orders = await db.order.findMany({ where: { userId: { in: userIds } } });
  expect(orders).toHaveLength(16);
  expect(orders.filter(order => order.paymentStatus === 'paid')).toHaveLength(8);
  expect(orders.filter(order => order.paymentStatus === 'failed')).toHaveLength(4);
  expect(orders.filter(order => order.paymentStatus === 'refunded')).toHaveLength(4);
  const approved = await db.sellRequest.findFirstOrThrow({ where: { userId: users[0].id, status: 'Approved' } });
  const listing = await db.product.findUniqueOrThrow({ where: { sourceRequestId: approved.id } });
  expect(listing.sellerId).toBe(users[0].id);
  expect(await db.pickup.count({ where: { requestId: approved.id } })).toBe(1);
  await db.product.update({ where: { id: listing.id }, data: { stock: 7 } });
  await db.user.update({ where: { id: users[0].id }, data: { fullName: 'Edited Demo Player' } });
  await seedDemoMarketplace(db);
  expect((await db.product.findUniqueOrThrow({ where: { id: listing.id } })).stock).toBe(7);
  expect((await db.user.findUniqueOrThrow({ where: { id: users[0].id } })).fullName).toBe('Edited Demo Player');
  expect(await db.order.count({ where: { userId: { in: userIds } } })).toBe(16);
  expect(await db.product.count({ where: { id: listing.id, isAvailable: true } })).toBe(0);
});

test('demo login isolates account history and synchronizes admin orders, invoices and returned stock', async () => {
  const one = await requestFactory.newContext({ baseURL: 'http://localhost:9003' });
  const two = await requestFactory.newContext({ baseURL: 'http://localhost:9003' });
  try {
    const first = await one.post('/api/auth/demo', { data: {} });
    const second = await two.post('/api/auth/demo', { data: {} });
    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);
    const a = (await first.json()).user;
    const b = (await second.json()).user;
    expect(a.id).not.toBe(b.id);
    expect(a.role).toBe('user');
    expect((await (await one.post('/api/auth/demo', { data: {} })).json()).user.id).toBe(a.id);
    const orders = (await (await one.get('/api/orders')).json()).orders;
    expect(orders).toHaveLength(4);
    const delivered = orders.find((order: { status: string }) => order.status === 'Delivered');
    expect((await two.get(`/api/orders/${delivered.id}`)).status()).toBe(404);
    const manager = await adminContext();
    const detail = await manager.get(`/api/admin/orders/${delivered.id}`);
    expect(detail.status()).toBe(200);
    expect((await detail.json()).order.customer.id).toBe(a.id);
    const productId = delivered.items[0].productId;
    const before = await db.product.findUniqueOrThrow({ where: { id: productId } });
    for (let index = 0; index < 2; index++) expect((await manager.patch(`/api/admin/orders/${delivered.id}/status`, { data: { status: 'Returned' } })).status()).toBe(200);
    const after = await db.product.findUniqueOrThrow({ where: { id: productId } });
    expect(after.stock).toBe(before.stock + 1);
    expect(after.isAvailable).toBe(false);
    expect((await db.order.findUniqueOrThrow({ where: { id: delivered.id } })).paymentStatus).toBe('refunded');
    expect((await one.get(`/api/orders/${delivered.id}`)).status()).toBe(200);
    expect((await one.get('/api/admin/stats')).status()).toBe(403);
    await manager.dispose();
  } finally { await one.dispose(); await two.dispose(); }
});

test('admin credentials cannot sign in through the user login endpoint', async ({ request }) => {
  const response = await request.post('/api/auth/login', { data: { email: process.env.DEMO_ADMIN_EMAIL, password: process.env.DEMO_ADMIN_PASSWORD } });
  expect(response.status()).toBe(401);
  expect((await request.get('/api/auth/me')).status()).toBe(401);
});
