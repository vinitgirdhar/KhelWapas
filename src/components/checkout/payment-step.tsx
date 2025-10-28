
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle, CreditCard } from 'lucide-react';
import { PaymentMethod } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { PaymentDialog } from '@/components/profile/payment-dialog';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

const getCardIcon = (type: 'visa' | 'mastercard') => {
  if (type === 'visa') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" aria-label="visa">
        <path fill="#1A1F71" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
        <path fill="#fff" d="M11.6 15.9h-2.3c-.3 0-.5-.3-.4-.5l2-7c.1-.3.4-.3.5 0l2 7c.1.2 0 .5-.4.5h-1.4zM22.9 8.9c-.4-.3-1-.5-1.5-.5s-.9.2-1.3.4c-.2.1-.4.2-.6.4-.2.2-.3.4-.3.6s.1.4.3.6c.2.2.4.3.6.4.3.1.5.2.8.3s.5.2.7.3.4.3.5.4.2.4.2.6c0 .3-.1.6-.3.8s-.4.4-.7.5c-.3.1-.6.2-1 .2s-.7-.1-1-.2-.6-.2-.8-.4-.3-.4-.4-.6l-.1-.4h-1.9c0 .4.1.8.3 1.1s.4.6.7.8.6.4.9.5.7.2 1.1.2c.5 0 1-.1 1.4-.3.4-.2.7-.4.9-.7s.3-.6.3-1c0-.3-.1-.6-.2-.8s-.2-.4-.4-.5-.4-.4-.6-.5-.5-.3-.7-.4-.5-.3-.7-.4c-.2-.1-.4-.3-.5-.4s-.2-.4-.2-.6c0-.3.1-.5.3-.7s.4-.3.7-.4c.3-.1.6-.1.9-.1s.7.1 1 .2c.3.1.6.3.8.5.2.2.4.5.5.8l.1.5h1.9c0-.4-.1-.8-.2-1.2s-.4-.7-.7-.9-.7-.4-1.1-.5c-.4-.1-.8-.1-1.2-.1zM28.4 15.9h2V8.9h-2zM32.6 15.9h1.9l-2.6-7h-2.1l-2.6 7h2l.4-1.2h2.5zm-1.6-2.5.8-2.3.8 2.3zM16.5 13.4c-.1.3-.3.5-.6.7s-.6.2-.9.2c-.3 0-.7-.1-1-.2s-.5-.3-.7-.5-.3-.4-.4-.6-.1-.5-.1-.7c0-.4.1-.7.2-1s.3-.5.6-.7.6-.3.9-.3c.3 0 .7.1 1 .2s.5.3.7.5l.5-1.5c-.3-.2-.7-.4-1.1-.5s-.8-.1-1.3-.1c-.6 0-1.1.1-1.6.3-.5.2-.9.5-1.2.8-.3.4-.6.8-.7 1.3s-.2 1-.2 1.5.1 1 .3 1.5.3.9.6 1.3.6.7 1 .9c.4.2.8.3 1.3.3.6 0 1.1-.1 1.5-.3s.7-.4.9-.7c.2-.2.4-.5.5-.8l.1-.6h-1.9z"/>
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" aria-label="mastercard">
      <path fill="#fff" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
      <circle cx="15" cy="12" r="7" fill="#EB001B"/>
      <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
      <path d="M22 12c0 .9-.2 1.8-.5 2.6-.9 2.1-2.8 3.4-5.1 3.4-1.1 0-2.2-.4-3-1-.6.7-1.4 1.2-2.3 1.5.8.9 2 1.5 3.3 1.5 2.8 0 5.2-1.8 6-4.3.5-.2.8-.5 1.1-.8.2.2.3.4.5.6.2.2.4.4.7.5.5-3.3-1.5-6.3-4.2-7.1z" fill="#FF5F00"/>
    </svg>
  );
};


interface PaymentStepProps {
  selectedPayment: PaymentMethod | null;
  onSelectPayment: (payment: PaymentMethod) => void;
}

export default function PaymentStep({ selectedPayment, onSelectPayment }: PaymentStepProps) {
    const { toast } = useToast();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const storedMethods = localStorage.getItem('userPaymentMethods');
        const loadedMethods = storedMethods ? JSON.parse(storedMethods) : [];
        setPaymentMethods(loadedMethods);
        
        // Auto-select the first payment method initially
        if (loadedMethods.length > 0) {
            onSelectPayment(loadedMethods[0]);
        }
    }, [onSelectPayment]);

    const updateLocalStorage = (updatedMethods: PaymentMethod[]) => {
        localStorage.setItem('userPaymentMethods', JSON.stringify(updatedMethods));
        setPaymentMethods(updatedMethods);
    };

    const handleSaveCard = (card: PaymentMethod) => {
        const updatedMethods = [...paymentMethods, card];
        updateLocalStorage(updatedMethods);
        toast({ title: 'Payment Method Added' });
        setIsDialogOpen(false);
        onSelectPayment(card); // Select the newly added card
    };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">2</div>
            <div>
                <h2 className="font-headline text-2xl font-semibold">Payment Method</h2>
                <p className="text-muted-foreground">Choose how you'd like to pay for your order.</p>
            </div>
      </div>
        
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={cn(
              "p-4 border rounded-lg flex justify-between items-center cursor-pointer transition-all",
              selectedPayment?.id === method.id ? "border-primary ring-2 ring-primary/50" : "hover:border-primary/50"
            )}
            onClick={() => onSelectPayment(method)}
          >
            <div className="flex items-center gap-4">
              {getCardIcon(method.type)}
              <div>
                <p className="font-semibold">{method.cardHolder}</p>
                <p className="text-muted-foreground text-sm">
                  {method.type.charAt(0).toUpperCase() + method.type.slice(1)} ending in {method.last4}
                </p>
                <p className="text-muted-foreground text-sm">
                  Expires {method.expiry}
                </p>
              </div>
            </div>
             {selectedPayment?.id === method.id && (
                <CheckCircle className="h-6 w-6 text-green-500" />
            )}
          </div>
        ))}
        <Button variant="outline" className="w-full" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Card
        </Button>
      </div>

      <PaymentDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveCard}
      />
    </>
  );
}
