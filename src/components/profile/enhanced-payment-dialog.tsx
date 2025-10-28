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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type PaymentMethod } from '@/types/user';
import { useState, useEffect } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { CreditCard, Smartphone } from 'lucide-react';

const cardSchema = z.object({
  type: z.literal('card'),
  cardNumber: z.string()
    .min(13, 'Card number must be at least 13 digits')
    .max(19, 'Card number must be at most 19 digits')
    .regex(/^\d+$/, 'Card number must contain only digits'),
  cardHolder: z.string().min(2, 'Cardholder name is required'),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(new Date().getFullYear()),
  cvv: z.string().min(3, 'CVV must be at least 3 digits').max(4, 'CVV must be at most 4 digits'),
  nickname: z.string().optional(),
  isDefault: z.boolean().default(false),
});

const upiSchema = z.object({
  type: z.literal('upi'),
  upiId: z.string()
    .min(1, 'UPI ID is required')
    .regex(/^[\w.-]+@[\w.-]+$/, 'Please enter a valid UPI ID (e.g., user@paytm)'),
  nickname: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type CardFormValues = z.infer<typeof cardSchema>;
type UpiFormValues = z.infer<typeof upiSchema>;

interface EnhancedPaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (paymentMethod: PaymentMethod) => void;
}

export function EnhancedPaymentDialog({ isOpen, onOpenChange, onSave }: EnhancedPaymentDialogProps) {
  const [activeTab, setActiveTab] = useState('card');

  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      type: 'card',
      cardNumber: '',
      cardHolder: '',
      expiryMonth: new Date().getMonth() + 1,
      expiryYear: new Date().getFullYear(),
      cvv: '',
      nickname: '',
      isDefault: false,
    },
  });

  const upiForm = useForm<UpiFormValues>({
    resolver: zodResolver(upiSchema),
    defaultValues: {
      type: 'upi',
      upiId: '',
      nickname: '',
      isDefault: false,
    },
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const detectCardType = (number: string): 'visa' | 'mastercard' | 'rupay' | 'amex' | undefined => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
    if (/^60|^65|^81|^82|^508/.test(cleaned)) return 'rupay';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return undefined;
  };

  const onCardSubmit = (data: CardFormValues) => {
    const cardType = detectCardType(data.cardNumber);
    const last4 = data.cardNumber.replace(/\s/g, '').slice(-4);
    
    const paymentMethod: PaymentMethod = {
      id: crypto.randomUUID(),
      userId: '', // Will be set by parent component
      type: 'card',
      cardLast4: last4,
      cardType,
      cardHolder: data.cardHolder,
      expiryMonth: data.expiryMonth,
      expiryYear: data.expiryYear,
      nickname: data.nickname || `${cardType ? cardType.charAt(0).toUpperCase() + cardType.slice(1) : 'Card'} ending in ${last4}`,
      isDefault: data.isDefault,
    };

    onSave(paymentMethod);
    resetForms();
    onOpenChange(false);
  };

  const onUpiSubmit = (data: UpiFormValues) => {
    const paymentMethod: PaymentMethod = {
      id: crypto.randomUUID(),
      userId: '', // Will be set by parent component
      type: 'upi',
      upiId: data.upiId,
      nickname: data.nickname || data.upiId,
      isDefault: data.isDefault,
    };

    onSave(paymentMethod);
    resetForms();
    onOpenChange(false);
  };

  const resetForms = () => {
    cardForm.reset();
    upiForm.reset();
    setActiveTab('card');
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 20; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForms();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a new payment method to your account for faster checkout.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="upi" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              UPI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4">
            <Form {...cardForm}>
              <form onSubmit={cardForm.handleSubmit(onCardSubmit)} className="space-y-4">
                <FormField
                  control={cardForm.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          {...field}
                          value={formatCardNumber(field.value)}
                          onChange={(e) => field.onChange(e.target.value.replace(/\s/g, ''))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={cardForm.control}
                  name="cardHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name as on card" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={cardForm.control}
                    name="expiryMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Month</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {month.toString().padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={cardForm.control}
                    name="expiryYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {generateYearOptions().map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={cardForm.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input placeholder="123" maxLength={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={cardForm.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nickname (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Personal Card, Work Card" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={cardForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as default payment method</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          This payment method will be selected by default during checkout.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Card</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="upi" className="space-y-4">
            <Form {...upiForm}>
              <form onSubmit={upiForm.handleSubmit(onUpiSubmit)} className="space-y-4">
                <FormField
                  control={upiForm.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPI ID</FormLabel>
                      <FormControl>
                        <Input placeholder="your-name@paytm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={upiForm.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nickname (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Personal UPI, Work UPI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={upiForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as default payment method</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          This payment method will be selected by default during checkout.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save UPI</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
