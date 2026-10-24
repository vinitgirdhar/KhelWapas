import type { Product } from '@prisma/client';
import { normalizeMany } from './image';
export function serializeProduct(p: Product) {
  const images = Array.isArray(p.imageUrls) ? normalizeMany(p.imageUrls.filter((v): v is string => typeof v === 'string')) : [];
  return { id: p.id, name: p.name, category: p.category, type: p.type, price: Number(p.price), originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined, grade: p.grade, image: images[0] || '/images/products/background.jpg', images, badge: p.badge, description: p.description, specs: p.specs || {}, isAvailable: p.isAvailable, status: p.isAvailable && p.stock > 0 ? 'In Stock' : 'Out of Stock', stock: p.stock, sellerId: p.sellerId, listingDate: p.createdAt.toISOString().slice(0,10), dataAiHint: p.category.toLowerCase(), sku: `KW-${p.id.slice(0,8).toUpperCase()}` };
}
