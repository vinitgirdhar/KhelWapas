import type { Product } from '@/components/product-card';

export type CatalogQuery = {
  type: 'new' | 'preowned';
  search?: string;
  category?: string;
  grade?: string;
  sort?: string;
  page?: number;
};
export type CatalogData = {
  products: Product[];
  categories: string[];
  pagination: { total: number; pages: number };
};
type Snapshot = { data: CatalogData; updatedAt: number };
const MAX_ENTRIES = 24;
const MAX_AGE = 30_000;
const PREFETCH_FRESHNESS = 10_000;
const entries = new Map<string, Snapshot>();
const requests = new Map<string, Promise<CatalogData>>();
const listeners = new Map<string, Set<() => void>>();
let generation = 0;

/** Public catalog data only; never cache sessions, addresses or private orders. */
export function catalogKey(query: CatalogQuery) {
  const params = new URLSearchParams({ type: query.type, available: 'true', q: query.search || '', sort: query.sort || 'newest', page: String(query.page || 1), limit: '12' });
  if (query.category) params.set('category', query.category);
  if (query.grade) params.set('grade', query.grade);
  return `/api/products?${params}`;
}

export function getCatalogSnapshot(key: string): Snapshot | undefined {
  const entry = entries.get(key);
  return entry && Date.now() - entry.updatedAt < MAX_AGE ? entry : undefined;
}

export function subscribeCatalog(key: string, listener: () => void) {
  let subscribers = listeners.get(key);
  if (!subscribers) { subscribers = new Set(); listeners.set(key, subscribers); }
  subscribers.add(listener);
  return () => { subscribers.delete(listener); if (!subscribers.size) listeners.delete(key); };
}

function notify(key: string) { listeners.get(key)?.forEach(listener => listener()); }

/** Navigation does not abort shared reads: a quick return can reuse the response. */
export function loadCatalog(key: string, revalidate = false): Promise<CatalogData> {
  const pending = requests.get(key);
  if (pending) return pending;
  const cached = getCatalogSnapshot(key);
  if (!revalidate && cached && Date.now() - cached.updatedAt < PREFETCH_FRESHNESS) return Promise.resolve(cached.data);
  const startedGeneration = generation;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  const request: Promise<CatalogData> = (async () => {
    try {
      const response = await fetch(key, { signal: controller.signal, cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not load gear');
      if (!Array.isArray(data.products) || !Array.isArray(data.categories) || !data.pagination || !Number.isFinite(data.pagination.total) || !Number.isFinite(data.pagination.pages)) throw new Error('Could not read the gear catalog');
      const result: CatalogData = { products: data.products, categories: data.categories, pagination: data.pagination };
      if (generation === startedGeneration) {
        entries.delete(key);
        entries.set(key, { data: result, updatedAt: Date.now() });
        while (entries.size > MAX_ENTRIES) {
          const oldest = [...entries.keys()].find(candidate => !listeners.has(candidate)) || entries.keys().next().value;
          if (!oldest) break;
          entries.delete(oldest); notify(oldest);
        }
        notify(key);
      }
      return result;
    } catch (error) {
      if (controller.signal.aborted) throw new Error('The catalog took too long to respond. Try again.');
      throw error;
    }
  })().finally(() => {
    clearTimeout(timeout);
    if (requests.get(key) === request) requests.delete(key);
  });
  requests.set(key, request);
  return request;
}

export function prefetchCatalog(type: 'new' | 'preowned') {
  return loadCatalog(catalogKey({ type })).catch(() => undefined);
}

/** Discard stock snapshots after a marketplace mutation; old reads cannot refill it. */
export function invalidateCatalogCache() {
  generation++;
  const keys = [...entries.keys()];
  entries.clear(); requests.clear();
  keys.forEach(notify);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('khelwapas:catalog-change'));
}
