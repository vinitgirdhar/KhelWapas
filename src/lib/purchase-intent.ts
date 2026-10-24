'use client';

import type { Product } from '@/components/product-card';
import { getSessionValue, setSessionValue, removeSessionValue } from './session-storage';

// Lightweight client-only helpers to persist and consume a user's purchase intent

export type PurchaseAction = 'add' | 'buy' | 'checkout';

export type PurchaseIntent = {
  action: PurchaseAction;
  // Optional product snapshot to avoid refetch before adding to cart
  // Shape should be compatible with the Product used by use-cart
  product?: Product;
  quantity?: number;
  returnTo?: string;
  createdAt: number;
};

const STORAGE_KEY = 'postLoginPurchaseIntent';

export function savePurchaseIntent(intent: PurchaseIntent) {
  try {
    if (typeof window === 'undefined') return;
    setSessionValue(STORAGE_KEY, JSON.stringify(intent));
  } catch {}
}

export function getPurchaseIntent(): PurchaseIntent | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = getSessionValue(STORAGE_KEY);
    if (!raw) return null;
    const intent = JSON.parse(raw) as PurchaseIntent;
    if (!intent || !['add','buy','checkout'].includes(intent.action) || !Number.isFinite(intent.createdAt)
      || Date.now() - intent.createdAt > 30 * 60 * 1000 || intent.createdAt > Date.now() + 60000
      || (intent.product && (typeof intent.product.id !== 'string' || typeof intent.product.name !== 'string' || !Number.isFinite(intent.product.price)))
      || (intent.quantity !== undefined && (!Number.isInteger(intent.quantity) || intent.quantity < 1 || intent.quantity > 100))) {
      clearPurchaseIntent();
      return null;
    }
    return intent;
  } catch {
    return null;
  }
}

export function clearPurchaseIntent() {
  try {
    if (typeof window === 'undefined') return;
    removeSessionValue(STORAGE_KEY);
  } catch {}
}


