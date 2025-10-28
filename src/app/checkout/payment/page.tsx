
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PaymentStep from '@/components/checkout/payment-step';
import OrderSummary from '@/components/checkout/order-summary';
import type { PaymentMethod, Address } from '@/types/user';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { savePurchaseIntent } from '@/lib/purchase-intent';

export default function PaymentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { items, removeAll } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Require login for payment step
    const loggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) {
      savePurchaseIntent({ action: 'checkout', createdAt: Date.now(), returnTo: '/checkout/payment' });
      toast({ title: 'Login required', description: 'Please login to continue with your purchase.' });
      router.push('/login?redirect=%2Fcheckout%2Fpayment');
      return;
    }
    const storedAddress = sessionStorage.getItem('selectedAddress');
    if (!storedAddress) {
      // Redirect if no address is selected
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a shipping address first.' });
      router.push('/checkout');
    } else {
        setShippingAddress(JSON.parse(storedAddress));
    }
  }, [router, toast]);

  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a payment method.' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((it) => ({ productId: it.id, quantity: it.quantity, price: it.price })),
          paymentMethod: selectedPayment,
        }),
      });

      if (response.status === 401) {
        // Not logged in; capture intent and redirect to login
        savePurchaseIntent({ action: 'checkout', createdAt: Date.now(), returnTo: '/checkout/payment' });
        toast({ title: 'Login required', description: 'Please login to continue with your purchase.' });
        router.push('/login?redirect=%2Fcheckout%2Fpayment');
        return;
      }

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'Failed to place order');
      }

      toast({ title: 'Order Placed!', description: 'Thank you for your purchase.' });
      removeAll();
      sessionStorage.removeItem('selectedAddress');
      router.push('/checkout/success');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Order Failed', description: err?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted || !shippingAddress) {
    return null; 
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="icon" className="h-8 w-8">
            <Link href="/checkout">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to shipping</span>
            </Link>
        </Button>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Payment</h1>
      </div>
      <div className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <PaymentStep
                selectedPayment={selectedPayment}
                onSelectPayment={setSelectedPayment}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 sticky top-24">
          <Card>
            <CardContent className="p-6 space-y-6">
              <OrderSummary items={items} />
              <div className='p-4 bg-muted/50 rounded-lg'>
                  <h3 className='font-semibold mb-2'>Shipping to:</h3>
                  <p className='text-sm text-muted-foreground'>
                      {shippingAddress.name}<br />
                      {shippingAddress.street}, {shippingAddress.city}<br />
                      {shippingAddress.state} - {shippingAddress.zip}
                  </p>
              </div>
              <Separator />
              <Button
                size="lg"
                className="w-full font-bold"
                onClick={handlePlaceOrder}
                disabled={!selectedPayment || loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
