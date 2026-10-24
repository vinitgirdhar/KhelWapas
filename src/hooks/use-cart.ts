"use client";

import * as React from 'react';
import type { Product } from '../components/product-card';
import { MAX_CART_ITEMS, normalizeCart, type CartItem } from '@/lib/cart';
import { useLocalStorage } from './use-local-storage';
import { toast } from './use-toast';

export type { CartItem } from '@/lib/cart';

type CartContextType = {
	items: CartItem[];
	addItem: (product: Product, quantity?: number) => void;
	removeItem: (id: string) => void;
	updateQuantity: (id: string, quantity: number) => void;
	removeAll: () => void;
	clearCart: () => void;
	totalItems: number;
	totalPrice: number;
};

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useLocalStorage<CartItem[]>('cart-storage', []);

	// Ensure we always work with an array, even if localStorage contains invalid data
	const normalizedItems = React.useMemo<CartItem[]>(() => {
		return normalizeCart(items);
	}, [items]);

	const addItem = React.useCallback((product: Product, quantity?: number) => {
		const requested = quantity ?? (product as Partial<CartItem>).quantity ?? 1;
		const qty = Number.isFinite(requested) ? Math.max(1, Math.floor(requested)) : 1;
		const stock = product.status === 'Out of Stock' ? 0 : Math.max(0, product.stock ?? 1);
		setItems((currentItems) => {
			const safe = normalizeCart(currentItems);
			const existingItem = safe.find((item) => item.id === product.id);
			if (!existingItem && safe.length >= MAX_CART_ITEMS) {
				toast({ title: 'Your bag has 50 different items', description: 'Check out or remove an item before adding another.' });
				return safe;
			}
			const currentQuantity = existingItem?.quantity ?? 0;
			const nextQuantity = Math.min(stock, currentQuantity + qty, 100);
			const added = Math.max(0, nextQuantity - currentQuantity);
			if (!added) {
				toast({ title: 'No more available', description: stock ? 'The available quantity is already in your bag.' : 'This gear is currently out of stock.' });
				return safe;
			}
			if (existingItem) {
				const updated = safe.map((item) =>
					item.id === product.id
						? { ...product, quantity: nextQuantity }
						: item
				);
				toast({
					title: 'Added to cart',
					description: `${product.name} (x${added}) has been added.`,
				});
				return updated;
			}
			toast({
				title: 'Added to cart',
				description: `${product.name} (x${added}) has been added.`,
			});
			return [...safe, { ...product, quantity: nextQuantity }];
		});
	}, [setItems]);

	const removeItem = React.useCallback((id: string) => {
		setItems((prev) => normalizeCart(prev).filter((item) => item.id !== id));
		toast({
			title: 'Item removed',
			description: 'The item has been removed from your cart.',
		});
	}, [setItems]);

	const updateQuantity = React.useCallback((id: string, quantity: number) => {
		if (!Number.isFinite(quantity)) return;
		if (quantity < 1) {
			removeItem(id);
			return;
		}
		setItems((prev) => normalizeCart(prev).map((item) => (item.id === id ? { ...item, quantity: Math.max(1, Math.min(Math.floor(quantity), item.stock ?? 1, 100)) } : item)));
	}, [removeItem, setItems]);

	const removeAll = React.useCallback(() => {
		setItems([]);
	}, [setItems]);

	const totalItems = React.useMemo(() => normalizedItems.reduce((acc, item) => acc + item.quantity, 0), [normalizedItems]);
	const totalPrice = React.useMemo(() => normalizedItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [normalizedItems]);

	const value = React.useMemo(
		() => ({
			items: normalizedItems,
			addItem,
			removeItem,
			updateQuantity,
			removeAll,
			clearCart: removeAll,
			totalItems,
			totalPrice,
		}),
		[normalizedItems, addItem, removeItem, updateQuantity, removeAll, totalItems, totalPrice]
	);

	return React.createElement(CartContext.Provider, { value }, children as any);
}

export function useCart() {
	const ctx = React.useContext(CartContext);
	if (!ctx) throw new Error('useCart must be used within a CartProvider');
	return ctx;
}
