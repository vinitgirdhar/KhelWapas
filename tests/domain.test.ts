import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutFingerprint, checkoutSchema, transitions } from '../src/lib/orders';
import { pagination } from '../src/lib/api';
import { verifyToken, generateToken } from '../src/lib/auth';
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
