
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type PaymentMethod } from '@/types/user';
import { useEffect } from 'react';
import { Separator } from '../ui/separator';

const paymentSchema = z.object({
  cardHolder: z.string().min(2, 'Cardholder name is required.'),
  last4: z.string().length(4, 'Please enter the last 4 digits.'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry must be in MM/YY format.'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (paymentMethod: PaymentMethod) => void;
}

export function PaymentDialog({ isOpen, onOpenChange, onSave }: PaymentDialogProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardHolder: '',
      last4: '',
      expiry: '',
    },
  });
  
  useEffect(() => {
      form.reset();
  }, [isOpen, form]);


  const onSubmit = (data: PaymentFormValues) => {
    const newPaymentMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: 'visa', // Simulate card type detection
      ...data,
    };
    onSave(newPaymentMethod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
          <DialogDescription>
            Enter your card details securely.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cardHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* In a real app, use a secure payment element from Stripe/Braintree */}
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="last4" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Last 4 Digits</FormLabel>
                    <FormControl><Input placeholder="1234" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="expiry" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Expiry (MM/YY)</FormLabel>
                    <FormControl><Input placeholder="12/26" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Card</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
