
'use client';

import { useCart, CartItem } from '@/hooks/use-cart';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

interface OrderSummaryProps {
    items: CartItem[];
}

export default function OrderSummary({ items }: OrderSummaryProps) {
  const { removeItem } = useCart();
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 50; // Example flat shipping rate
  const total = subtotal + shipping;

  return (
    <div className="space-y-4">
      <h2 className="font-headline text-2xl font-semibold">Order Summary</h2>
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {items.map(item => (
          <div key={item.id} className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Image
                src={item.image}
                alt={item.name}
                width={64}
                height={64}
                className="rounded-md object-cover"
              />
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
            </div>
            <div className="text-right">
                <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          </div>
        ))}
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-semibold">₹{shipping.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <Separator />
      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>₹{total.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}
