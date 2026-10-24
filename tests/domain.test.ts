import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutFingerprint, checkoutSchema, transitions } from '@/server/marketplace/orders';
import { pagination } from '@/server/api';
import { verifyToken, generateToken } from '@/server/auth';
import { safeReturnPath } from '../src/lib/navigation';
import { normalizeCart } from '../src/lib/cart';
const base = { items: [{ productId: 'a', quantity: 1 }, { productId: 'b', quantity: 2 }], addressId: 'home', outcome: 'success' as const, expectedTotal: 200 };
test('idempotency canonicalizes ordering and duplicate product rows', () => {
  assert.equal(checkoutFingerprint(base), checkoutFingerprint({ ...base, items: [{ productId: 'b', quantity: 1 }, { productId: 'a', quantity: 1 }, { productId: 'b', quantity: 1 }] }));
  assert.notEqual(checkoutFingerprint(base), checkoutFingerprint({ ...base, outcome: 'failure' }));
});
test('invalid quantities, totals and pagination cannot enter checkout', () => {
  assert.equal(checkoutSchema.safeParse({ ...base, items: [{ productId: 'a', quantity: -1 }] }).success, false);
  assert.equal(checkoutSchema.safeParse({ ...base, expectedTotal: Infinity }).success, false);
  assert.throws(() => pagination(new URLSearchParams('limit=100000')));
  assert.throws(() => pagination(new URLSearchParams('page=NaN')));
});
test('failed and terminal orders cannot advance through fulfillment', () => {
  assert.deepEqual(transitions.PaymentFailed, []); assert.deepEqual(transitions.Cancelled, []); assert.deepEqual(transitions.Returned, []);
  assert.equal(transitions.Shipped.includes('Cancelled'), false);
});
test('sessions require a strong secret and reject tampered signatures', () => {
  const prior = process.env.JWT_SECRET; delete process.env.JWT_SECRET;
  assert.throws(() => generateToken({ userId: '1', email: 'test@example.test', role: 'user' }));
  process.env.JWT_SECRET = 'test-only-secret-at-least-thirty-two-characters';
  const token = generateToken({ userId: '1', email: 'test@example.test', role: 'user', sessionVersion: 3 });
  assert.equal(verifyToken(token)?.sessionVersion, 3); assert.equal(verifyToken(token + 'x'), null);
  if (prior) process.env.JWT_SECRET = prior; else delete process.env.JWT_SECRET;
});

test('partial product and address updates never reset omitted default fields', async () => {
  const { productUpdateSchema, addressUpdateSchema } = await import('../src/lib/validation');
  assert.deepEqual(productUpdateSchema.parse({ isAvailable: false }), { isAvailable: false });
  assert.deepEqual(addressUpdateSchema.parse({ street: '456 Changed Street' }), { street: '456 Changed Street' });
});

test('return paths reject external and malformed redirects without decoding twice', () => {
  for (const value of ['https://attacker.test', '//attacker.test', '/\\attacker.test', '/\n/attacker.test', 'javascript:alert(1)']) assert.equal(safeReturnPath(value, '/profile'), '/profile');
  assert.equal(safeReturnPath('/shop/preowned?q=bat#gear'), '/shop/preowned?q=bat#gear');
  assert.equal(safeReturnPath('/products/%25'), '/products/%25');
  assert.equal(safeReturnPath(null), '/');
});

test('persisted carts discard malformed entries and bound quantities to available stock', () => {
  const item = { id: 'gear', name: 'Practice bat', price: 1200, quantity: 3, stock: 2, image: 'javascript:alert(1)' };
  assert.deepEqual(normalizeCart({ items: [item] }), []);
  const normalized = normalizeCart([null, {}, { ...item, price: NaN }, { ...item, quantity: -1 }, { ...item, quantity: '2' }, item, item]);
  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].quantity, 2);
  assert.equal(normalized[0].image, '/images/products/background.jpg');
  assert.equal(normalized[0].category, 'Sports equipment');
  assert.equal(normalizeCart([{ ...item, quantity: Infinity }]).length, 0);
  const distinct = Array.from({ length: 51 }, (_, index) => ({ ...item, id: `gear-${index}` }));
  assert.equal(normalizeCart(distinct.slice(0, 50)).length, 50);
  const capped = normalizeCart([null, distinct[0], distinct[0], ...distinct]);
  assert.equal(capped.length, 50);
  assert.equal(capped[49].id, 'gear-49');
  assert.equal(capped.some(row => row.id === 'gear-50'), false);
});
