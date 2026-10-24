import type { Product } from '../components/product-card';

export type CartItem = Product & { quantity: number };
export const MAX_CART_ITEMS = 50;

/** Persisted browser state is untrusted and can predate the current product shape. */
export function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const result: CartItem[] = [];
  const seen = new Set<string>();
  const localImage = (image: unknown): image is string => typeof image === 'string' && /^\/(?:images|uploads)\/[\w/.-]+$/.test(image);
  for (const item of value.slice(0, 100)) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    if (typeof item.id !== 'string' || !item.id.trim() || item.id.length > 200 || typeof item.name !== 'string' || !item.name.trim()) continue;
    if (typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price <= 0 || item.price > 10000000) continue;
    if (typeof item.quantity !== 'number' || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || seen.has(item.id)) continue;
    const stock = typeof item.stock === 'number' && Number.isSafeInteger(item.stock) && item.stock >= 0 ? Math.min(item.stock, 10000) : 1;
    const category = typeof item.category === 'string' ? item.category.slice(0, 60) : 'Sports equipment';
    result.push({
      id: item.id, name: item.name.slice(0, 160), price: item.price,
      quantity: Math.min(item.quantity, Math.max(1, stock), 100), stock,
      category, type: item.type === 'new' ? 'new' : 'preowned',
      status: item.status === 'Out of Stock' || stock === 0 ? 'Out of Stock' : 'In Stock',
      image: localImage(item.image) ? item.image : '/images/products/background.jpg',
      images: Array.isArray(item.images) ? item.images.filter(localImage).slice(0, 10) : undefined,
      sellerId: typeof item.sellerId === 'string' ? item.sellerId : undefined,
      grade: ['A', 'B', 'C', 'D'].includes(item.grade) ? item.grade : undefined,
      dataAiHint: category.toLowerCase(), listingDate: typeof item.listingDate === 'string' ? item.listingDate : '',
      sku: typeof item.sku === 'string' ? item.sku : '',
    });
    seen.add(item.id);
    if (result.length === MAX_CART_ITEMS) break;
  }
  return result;
}
