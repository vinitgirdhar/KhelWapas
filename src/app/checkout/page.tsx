
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AddressStep from '@/components/checkout/address-step';
import type { Address } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { savePurchaseIntent } from '@/lib/purchase-intent';


export default function CheckoutPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { items } = useCart();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Require login for checkout entry
    const loggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) {
      savePurchaseIntent({ action: 'checkout', createdAt: Date.now(), returnTo: '/checkout' });
      toast({ title: 'Login required', description: 'Please login to continue with your purchase.' });
      router.push('/login?redirect=%2Fcheckout');
      return;
    }
    // Persist selected address across reloads if needed, e.g., in sessionStorage
    const storedAddress = sessionStorage.getItem('selectedAddress');
    if (storedAddress) {
      setSelectedAddress(JSON.parse(storedAddress));
    }
  }, []);

  const handleSelectAddress = (address: Address | null) => {
    setSelectedAddress(address);
    // Store selected address to persist it if user navigates away and comes back
    if (address) {
      sessionStorage.setItem('selectedAddress', JSON.stringify(address));
    } else {
      sessionStorage.removeItem('selectedAddress');
    }
  }

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a shipping address.' });
      return;
    }
    router.push('/checkout/payment');
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  if (items.length === 0 && isMounted) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="container py-12 md:py-16">
       <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="icon" className="h-8 w-8">
            <Link href="/cart">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to cart</span>
            </Link>
        </Button>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Shipping Address</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <AddressStep
                selectedAddress={selectedAddress}
                onSelectAddress={handleSelectAddress}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 sticky top-24">
          <Card>
            <CardContent className="p-6 space-y-6">
               <h2 className="font-headline text-2xl font-semibold">Next Step</h2>
               <p className="text-muted-foreground">
                Once you select an address, you can proceed to the payment page to complete your order.
               </p>
              <Button
                size="lg"
                className="w-full font-bold"
                onClick={handleContinueToPayment}
                disabled={!selectedAddress}
              >
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
