'use client';

// Lightweight client-only helpers to persist and consume a user's purchase intent

export type PurchaseAction = 'add' | 'buy' | 'checkout';

export type PurchaseIntent = {
  action: PurchaseAction;
  // Optional product snapshot to avoid refetch before adding to cart
  // Shape should be compatible with the Product used by use-cart
  product?: any;
  quantity?: number;
  returnTo?: string;
  createdAt: number;
};

const STORAGE_KEY = 'postLoginPurchaseIntent';

export function savePurchaseIntent(intent: PurchaseIntent) {
  try {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
  } catch {}
}

export function getPurchaseIntent(): PurchaseIntent | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPurchaseIntent() {
  try {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}


