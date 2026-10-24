import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { ApiError } from '@/server/api';
export const quoteSchema = z.object({
  items: z.array(z.object({ productId: z.string().min(1).max(100), quantity: z.number().int().min(1).max(100) })).min(1).max(50),
  addressId: z.string().min(1).max(100),
});
export const checkoutSchema = quoteSchema.extend({ outcome: z.enum(['success','failure']), expectedTotal: z.number().finite().positive() });
export function checkoutFingerprint(input: z.infer<typeof checkoutSchema>) {
  const quantities = new Map<string, number>();
  for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  return createHash('sha256').update(JSON.stringify({ addressId: input.addressId, outcome: input.outcome, expectedTotal: input.expectedTotal, items: [...quantities].sort(([a],[b]) => a.localeCompare(b)) })).digest('hex');
}
export async function quoteCheckout(tx: Prisma.TransactionClient, userId: string, input: z.infer<typeof quoteSchema>) {
  const address = await tx.address.findFirst({ where: { id: input.addressId, userId } });
  if (!address) throw new ApiError(400, 'Choose a saved shipping address');
  const quantities = new Map<string, number>();
  for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  const products = await tx.product.findMany({ where: { id: { in: [...quantities.keys()] } } });
  if (products.length !== quantities.size) throw new ApiError(409, 'An item is no longer available');
  let subtotalPaise = 0;
  const items = products.map(product => {
    const quantity = quantities.get(product.id)!;
    if (!product.isAvailable || product.stock < quantity) throw new ApiError(409, `${product.name} does not have enough stock`);
    if (product.sellerId === userId) throw new ApiError(400, 'You cannot buy your own listing');
    const pricePaise = Math.round(Number(product.price) * 100);
    subtotalPaise += pricePaise * quantity;
    return { productId: product.id, productName: product.name, id: product.id, name: product.name, price: pricePaise / 100, quantity, type: product.type, image: Array.isArray(product.imageUrls) ? String(product.imageUrls[0] || '') : '', sellerId: product.sellerId };
  });
  const { id, userId: owner, isDefault, createdAt, updatedAt, ...shippingAddress } = address;
  return { items, shippingAddress, shippingFee: 50, totalPrice: (subtotalPaise + 5000) / 100 };
}
export async function createDemoOrder(userId: string, input: z.infer<typeof checkoutSchema>, key: string) {
  const fingerprint = checkoutFingerprint(input);
  return prisma.$transaction(async tx => {
    const existing = await tx.order.findUnique({ where: { idempotencyKey: key } });
    if (existing) {
      if (existing.userId !== userId || existing.checkoutFingerprint !== fingerprint) throw new ApiError(409, 'This checkout key was used for a different request. Refresh checkout to continue.');
      return existing;
    }
    const quote = await quoteCheckout(tx, userId, input);
    if (Math.round(input.expectedTotal * 100) !== Math.round(quote.totalPrice * 100)) throw new ApiError(409, 'A price changed. Refresh checkout to review the updated total.');
    if (input.outcome === 'success') for (const item of quote.items) {
      const reserved = await tx.product.updateMany({ where: { id: item.productId, isAvailable: true, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
      if (reserved.count !== 1) throw new ApiError(409, 'This item just sold. Please refresh your bag');
    }
    return tx.order.create({ data: { userId, ...quote, idempotencyKey: key, checkoutFingerprint: fingerprint, paymentReference: `DEMO-${crypto.randomUUID()}`, paymentStatus: input.outcome === 'success' ? 'paid' : 'failed', fulfillmentStatus: input.outcome === 'success' ? 'Confirmed' : 'PaymentFailed', events: { create: { status: input.outcome === 'success' ? 'Confirmed' : 'PaymentFailed' } } } });
  }, { maxWait: 10000, timeout: 15000 });
}
export const transitions: Record<string, readonly string[]> = {
  Pending: ['Confirmed', 'Cancelled'], Confirmed: ['Shipped', 'Cancelled'], Shipped: ['Delivered'], Delivered: ['Returned'], PaymentFailed: [], Cancelled: [], Returned: [],
};
export async function changeOrderStatus(id: string, status: string, cancellationReason?: string) {
  return prisma.$transaction(async tx => {
    const order = await tx.order.findUnique({ where: { id } });
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.fulfillmentStatus === status) return order;
    if (!transitions[order.fulfillmentStatus]?.includes(status)) throw new ApiError(409, `Cannot move ${order.fulfillmentStatus} to ${status}`);
    const restore = ['Cancelled','Returned'].includes(status) && order.paymentStatus === 'paid';
    const reason = status === 'Cancelled' ? cancellationReason?.trim() : undefined;
    const adminNotes = reason ? [order.adminNotes, `Cancellation reason: ${reason}`].filter(Boolean).join('\n\n') : undefined;
    const result = await tx.order.updateMany({ where: { id, fulfillmentStatus: order.fulfillmentStatus }, data: { fulfillmentStatus: status, ...(restore ? { paymentStatus: 'refunded' as const } : {}), ...(adminNotes ? { adminNotes } : {}) } });
    if (!result.count) throw new ApiError(409, 'Order changed. Please refresh');
    if (restore) for (const raw of order.items as Prisma.JsonArray) {
      const item = raw as { productId: string; quantity: number };
      if (item.productId && Number.isInteger(item.quantity) && item.quantity > 0) await tx.product.updateMany({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
    await tx.orderEvent.create({ data: { orderId: id, status } });
    return tx.order.findUniqueOrThrow({ where: { id } });
  });
}
export async function findOrder(id: string) {
  if (/^[0-9a-f-]{36}$/i.test(id)) return prisma.order.findUnique({ where: { id } });
  if (!/^ORD-[0-9a-f]{8}$/i.test(id)) throw new ApiError(400, 'Invalid order ID');
  const orders = await prisma.order.findMany({ where: { id: { startsWith: id.slice(4).toLowerCase() } }, take: 2 });
  if (orders.length > 1) throw new ApiError(409, 'Use the full order ID');
  return orders[0] ?? null;
}
