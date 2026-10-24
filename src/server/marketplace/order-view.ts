import { Prisma } from '@prisma/client';
export function orderView(order: Prisma.OrderGetPayload<{ include: { user: { select: { id: true; fullName: true; email: true; phone: true } }; events: true } }>) {
  const items = Array.isArray(order.items) ? order.items : [];
  const shipping = order.shippingAddress as Record<string,string> | null;
  return { id: order.id, orderId: `ORD-${order.id.slice(0,8).toUpperCase()}`, customer: { id: order.user.id, name: order.user.fullName, email: order.user.email, phone: order.user.phone }, items, amount: Number(order.totalPrice), shippingFee: Number(order.shippingFee), orderStatus: order.fulfillmentStatus, paymentStatus: order.paymentStatus, paymentMethod: 'Demo simulator', paymentReference: order.paymentReference, orderDate: order.createdAt.toISOString(), shippingAddress: shipping, billingAddress: shipping, adminNotes: order.adminNotes, timeline: order.events.map(e => ({ status: e.status, timestamp: e.createdAt.toISOString(), description: `Demo order ${e.status.toLowerCase()}` })) };
}
