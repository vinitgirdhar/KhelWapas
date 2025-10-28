
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function OrderSuccessPage() {
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        // In a real app, you might get this from the URL or state management
        setOrderId(`ORD-${Date.now().toString().slice(-6)}`);
    }, []);

  return (
    <div className="container py-20 md:py-32 flex items-center justify-center">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="font-headline text-4xl">Thank You for Your Order!</CardTitle>
          <CardDescription className="text-lg">
            Your purchase has been confirmed. A confirmation email and invoice will be sent to you shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-semibold">Order ID: <span className="font-normal text-muted-foreground">#{orderId}</span></p>
            <p className="font-semibold mt-1">Estimated Delivery: <span className="font-normal text-muted-foreground">3-5 business days</span></p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button asChild variant="outline" size="lg">
                <Link href={`/invoice/${orderId}`} target="_blank">
                    <FileText className="mr-2 h-5 w-5"/>
                    Download Invoice
                </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
