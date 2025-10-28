"use client";

import * as React from 'react';
import type { Product } from '../components/product-card';
import { useLocalStorage } from './use-local-storage';
import { toast } from './use-toast';

export type CartItem = Product & { quantity: number };

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
		return Array.isArray(items) ? items : [];
	}, [items]);

	const addItem = React.useCallback((product: Product, quantity?: number) => {
		const qty = typeof quantity === 'number' ? quantity : (product as Partial<CartItem>).quantity ?? 1;
		setItems((currentItems) => {
			const safe = Array.isArray(currentItems) ? currentItems : [];
			const existingItem = safe.find((item) => item.id === product.id);
			if (existingItem) {
				const updated = safe.map((item) =>
					item.id === product.id
						? { ...item, quantity: item.quantity + qty }
						: item
				);
				toast({
					title: 'Added to cart',
					description: `${product.name} (x${qty}) has been added.`,
				});
				return updated;
			}
			toast({
				title: 'Added to cart',
				description: `${product.name} (x${qty}) has been added.`,
			});
			return [...safe, { ...(product as Product), quantity: qty } as CartItem];
		});
	}, [setItems]);

	const removeItem = React.useCallback((id: string) => {
		setItems((prev) => (Array.isArray(prev) ? prev.filter((item) => item.id !== id) : []));
		toast({
			title: 'Item removed',
			description: 'The item has been removed from your cart.',
		});
	}, [setItems]);

	const updateQuantity = React.useCallback((id: string, quantity: number) => {
		if (quantity < 1) {
			removeItem(id);
			return;
		}
		setItems((prev) => (Array.isArray(prev) ? prev.map((item) => (item.id === id ? { ...item, quantity } : item)) : prev));
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
