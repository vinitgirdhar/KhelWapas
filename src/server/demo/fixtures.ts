import { createHash, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Prisma, type PrismaClient } from '@prisma/client';

const DEMO_NAMES = ['Aarav Patil', 'Meera Shah', 'Kabir Rao', 'Ananya Deshmukh'];
const equipment = [
  { name: 'Cricket practice bat', category: 'Cricket', image: '/images/demo-catalog/cricket-practice-bat.webp', price: 1800, type: 'preowned' as const },
  { name: 'Training football', category: 'Football', image: '/images/demo-catalog/football-size-5-ball.webp', price: 950, type: 'new' as const },
  { name: 'Badminton practice racket', category: 'Badminton', image: '/images/demo-catalog/badminton-lightweight-racket.webp', price: 1250, type: 'preowned' as const },
];

/** Stable UUIDs keep seed reruns idempotent without touching catalog identities. */
function fixtureId(namespace: string, label: string) {
  const hash = createHash('sha256').update(`khelwapas-demo:${namespace}:${label}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

async function populateAccount(tx: Prisma.TransactionClient, account: { id: string; fullName: string; email: string }, passwordHash: string, historyOffsetDays = 0) {
  const existing = await tx.user.findUnique({ where: { id: account.id } });
  if (existing) {
    if (existing.email !== account.email) throw new Error('Demo fixture ID belongs to another account');
    return existing;
  }
  const now = Date.now();
  const daysAgo = (days: number) => new Date(now - (days + historyOffsetDays) * 86400000);
  const user = await tx.user.create({ data: { ...account, passwordHash, role: 'user', status: 'Active', createdAt: daysAgo(40) } });
  const address = {
    title: 'Demo home', fullName: account.fullName, phone: '9000000000',
    street: '12 Prototype Sports Lane (fictional address)', city: 'Pune', state: 'Maharashtra', postalCode: '411001', country: 'India',
  };
  await tx.address.create({ data: { ...address, id: fixtureId(user.id, 'address'), userId: user.id, isDefault: true } });
  // These are separate, archived historical listings. Demo history never consumes
  // public inventory, replaces catalog IDs, or exposes a visitor's listing.
  const products = await Promise.all(equipment.map((item, index) => tx.product.create({ data: {
    id: fixtureId(user.id, `product-${index}`), name: `${item.name} · Demo history`, category: item.category,
    type: item.type, price: item.price, grade: item.type === 'preowned' ? 'B' : null,
    imageUrls: [item.image], description: 'Fictional prototype equipment used only to illustrate account and transaction history. No real sale or delivery occurred.',
    badge: 'Demo history', isAvailable: false, stock: index === 2 ? 2 : 1,
    specs: { 'Catalog use': 'Archived demo transaction history', 'Image source': 'Prototype illustration' }, createdAt: daysAgo(35),
  } })));
  const examples = [
    { product: products[0], paymentStatus: 'paid' as const, status: 'Delivered', age: 24, events: ['Confirmed', 'Shipped', 'Delivered'] },
    { product: products[1], paymentStatus: 'paid' as const, status: 'Shipped', age: 5, events: ['Confirmed', 'Shipped'] },
    { product: products[2], paymentStatus: 'failed' as const, status: 'PaymentFailed', age: 3, events: ['PaymentFailed'] },
    { product: products[2], paymentStatus: 'refunded' as const, status: 'Cancelled', age: 2, events: ['Confirmed', 'Cancelled'] },
  ];
  for (const [index, example] of examples.entries()) {
    const item = example.product;
    const createdAt = daysAgo(example.age);
    await tx.order.create({ data: {
      id: fixtureId(user.id, `order-${index}`), userId: user.id,
      items: [{ productId: item.id, productName: item.name, id: item.id, name: item.name, price: Number(item.price), quantity: 1, type: item.type, image: equipment[index < 2 ? index : 2].image, sellerId: null }],
      shippingAddress: address, shippingFee: 50, totalPrice: Number(item.price) + 50,
      paymentStatus: example.paymentStatus, fulfillmentStatus: example.status,
      paymentReference: `DEMO-${fixtureId(user.id, `payment-${index}`)}`,
      adminNotes: 'Fictional prototype transaction. No money moved and no courier was booked.', createdAt,
      events: { create: example.events.map((status, position) => ({ status, createdAt: new Date(createdAt.getTime() + position * 3600000) })) },
    } });
  }
  for (const [index, status] of (['Approved', 'Pending', 'Rejected'] as const).entries()) {
    const requestId = fixtureId(user.id, `request-${index}`);
    const item = equipment[index];
    await tx.sellRequest.create({ data: {
      id: requestId, userId: user.id, fullName: user.fullName, email: user.email,
      category: item.category, title: `${item.name} · Demo submission`,
      description: 'Fictional equipment submission with light signs of practice wear. This example demonstrates the seller review process; it is not real inventory.',
      price: item.price, contactMethod: 'Email', imageUrls: [item.image, item.image, item.image], status,
      reviewReason: status === 'Rejected' ? 'Demo decision: please provide clearer photographs of the equipment.' : status === 'Approved' ? 'Demo review completed; historical listing archived.' : null,
      createdAt: daysAgo(10 - index),
    } });
    if (status === 'Approved') {
      await tx.product.create({ data: {
        id: fixtureId(user.id, 'seller-product'), sellerId: user.id, sourceRequestId: requestId,
        name: `${item.name} · Demo submission`, category: item.category, type: 'preowned', grade: 'B', price: item.price,
        imageUrls: [item.image], description: 'Approved fictional seller submission, archived to preserve demo history.',
        isAvailable: false, stock: 1, badge: 'Demo history', createdAt: daysAgo(9),
      } });
      await tx.pickup.create({ data: {
        id: fixtureId(user.id, 'pickup'), requestId, scheduledAt: new Date(now + 2 * 86400000),
        assignee: 'Demo pickup team', status: 'Scheduled',
      } });
    }
  }
  return user;
}

export async function seedDemoMarketplace(db: PrismaClient) {
  const passwordHash = await bcrypt.hash(randomUUID() + randomUUID(), 12);
  return db.$transaction(async tx => {
    const users = [];
    for (const [index, name] of DEMO_NAMES.entries()) {
      users.push(await populateAccount(tx, {
        id: fixtureId('showcase', `user-${index}`), fullName: `${name} (Demo)`, email: `showcase-${index + 1}@demo.khelwapas.invalid`,
      }, passwordHash, index * 30));
    }
    return users;
  }, { maxWait: 10000, timeout: 20000 });
}

export async function createDemoVisitor(db: PrismaClient) {
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(randomUUID() + randomUUID(), 12);
  return db.$transaction(tx => populateAccount(tx, {
    id, fullName: 'Demo Player', email: `demo-${id}@visitors.khelwapas.invalid`,
  }, passwordHash), { maxWait: 10000, timeout: 20000 });
}
