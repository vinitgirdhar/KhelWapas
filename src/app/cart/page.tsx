
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ShoppingCart, BaggageClaim, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { savePurchaseIntent } from '@/lib/purchase-intent';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = items.length > 0 ? 50 : 0;
  const total = subtotal + shipping;

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <BaggageClaim className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
        <h1 className="font-headline text-4xl font-bold">Your Cart is Empty</h1>
        <p className="mt-4 text-lg text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="mt-8">
          <Link href="/shop/preowned">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  const handleProceedToCheckout = () => {
    const loggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) {
      savePurchaseIntent({ action: 'checkout', createdAt: Date.now(), returnTo: '/cart' });
      toast({ title: 'Login required', description: 'Please login to continue with your purchase.' });
      router.push('/login?redirect=%2Fcart');
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className="container py-12 md:py-16">
      <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex gap-4 items-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover"
                />
                <div className="flex-grow">
                  <Link href={`/products/${item.id}`} className="font-semibold hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                   <p className="text-lg font-bold text-primary mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2 border rounded-md p-1">
                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity === 1}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-md w-8 text-center">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <p className="font-bold text-lg w-24 text-right">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
                <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-1 sticky top-24">
          <Card>
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
               <Separator />
               <Button size="lg" className="w-full font-bold" onClick={handleProceedToCheckout}>
                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5"/>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
