// Data Access Layer - Replaces Prisma Client
export { userDAL } from './users';
export { productDAL } from './products';
export { orderDAL } from './orders';
export { sellRequestDAL } from './sell-requests';
export { addressDAL } from './addresses';
export { paymentMethodDAL } from './payment-methods';
export { reviewDAL } from './reviews';

// Re-export types
export type { User } from './users';
export type { Product } from './products';
export type { Order } from './orders';
export type { SellRequest } from './sell-requests';
export type { Address } from './addresses';
export type { PaymentMethod } from './payment-methods';
export type { Review } from './reviews';
