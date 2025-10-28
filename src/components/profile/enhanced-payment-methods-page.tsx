'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { PaymentMethod } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EnhancedPaymentDialog } from '@/components/profile/enhanced-payment-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const getCardIcon = (type?: 'visa' | 'mastercard' | 'rupay' | 'amex') => {
  switch (type) {
    case 'visa':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="20" viewBox="0 0 38 24" aria-label="visa">
          <path fill="#1A1F71" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
          <path fill="#fff" d="M11.6 15.9h-2.3c-.3 0-.5-.3-.4-.5l2-7c.1-.3.4-.3.5 0l2 7c.1.2 0 .5-.4.5h-1.4zM22.9 8.9c-.4-.3-1-.5-1.5-.5s-.9.2-1.3.4c-.2.1-.4.2-.6.4-.2.2-.3.4-.3.6s.1.4.3.6c.2.2.4.3.6.4.3.1.5.2.8.3s.5.2.7.3.4.3.5.4.2.4.2.6c0 .3-.1.6-.3.8s-.4.4-.7.5c-.3.1-.6.2-1 .2s-.7-.1-1-.2-.6-.2-.8-.4-.3-.4-.4-.6l-.1-.4h-1.9c0 .4.1.8.3 1.1s.4.6.7.8.6.4.9.5.7.2 1.1.2c.5 0 1-.1 1.4-.3.4-.2.7-.4.9-.7s.3-.6.3-1c0-.3-.1-.6-.2-.8s-.2-.4-.4-.5-.4-.4-.6-.5-.5-.3-.7-.4-.5-.3-.7-.4c-.2-.1-.4-.3-.5-.4s-.2-.4-.2-.6c0-.3.1-.5.3-.7s.4-.3.7-.4c.3-.1.6-.1.9-.1s.7.1 1 .2c.3.1.6.3.8.5.2.2.4.5.5.8l.1.5h1.9c0-.4-.1-.8-.2-1.2s-.4-.7-.7-.9-.7-.4-1.1-.5c-.4-.1-.8-.1-1.2-.1zM28.4 15.9h2V8.9h-2zM32.6 15.9h1.9l-2.6-7h-2.1l-2.6 7h2l.4-1.2h2.5zm-1.6-2.5.8-2.3.8 2.3z"/>
        </svg>
      );
    case 'mastercard':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="20" viewBox="0 0 38 24" aria-label="mastercard">
          <path fill="#fff" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
          <circle cx="15" cy="12" r="7" fill="#EB001B"/>
          <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
          <path d="M22 12c0 .9-.2 1.8-.5 2.6-.9 2.1-2.8 3.4-5.1 3.4-1.1 0-2.2-.4-3-1-.6.7-1.4 1.2-2.3 1.5.8.9 2 1.5 3.3 1.5 2.8 0 5.2-1.8 6-4.3.5-.2.8-.5 1.1-.8.2.2.3.4.5.6.2.2.4.4.7.5.5-3.3-1.5-6.3-4.2-7.1z" fill="#FF5F00"/>
        </svg>
      );
    case 'rupay':
      return (
        <div className="w-8 h-5 bg-gradient-to-r from-green-500 to-orange-500 rounded flex items-center justify-center text-xs text-white font-bold">
          R
        </div>
      );
    case 'amex':
      return (
        <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-xs text-white font-bold">
          AX
        </div>
      );
    default:
      return <CreditCard className="h-5 w-5" />;
  }
};

const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
  switch (type) {
    case 'card':
      return <CreditCard className="h-5 w-5" />;
    case 'upi':
      return <Smartphone className="h-5 w-5" />;
    case 'wallet':
      return <Wallet className="h-5 w-5" />;
    default:
      return <CreditCard className="h-5 w-5" />;
  }
};

export default function EnhancedPaymentMethodsPage() {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; method: PaymentMethod | null }>({
    isOpen: false,
    method: null,
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = () => {
    // In a real app, this would be an API call
    const storedMethods = localStorage.getItem('userPaymentMethods');
    if (storedMethods) {
      setPaymentMethods(JSON.parse(storedMethods));
    } else {
      // Initialize with demo data
      const demoMethods: PaymentMethod[] = [
        {
          id: '1',
          userId: 'demo-user-1',
          type: 'card',
          cardLast4: '1234',
          cardType: 'visa',
          cardHolder: 'Rohan Sharma',
          expiryMonth: 12,
          expiryYear: 2028,
          nickname: 'Personal Visa Card',
          isDefault: true,
        },
        {
          id: '2',
          userId: 'demo-user-1',
          type: 'upi',
          upiId: 'rohan@paytm',
          nickname: 'Paytm UPI',
          isDefault: false,
        },
      ];
      setPaymentMethods(demoMethods);
      localStorage.setItem('userPaymentMethods', JSON.stringify(demoMethods));
    }
  };

  const updateLocalStorage = (updatedMethods: PaymentMethod[]) => {
    localStorage.setItem('userPaymentMethods', JSON.stringify(updatedMethods));
    setPaymentMethods(updatedMethods);
  };

  const handleSavePaymentMethod = (method: PaymentMethod) => {
    // Set userId for new methods
    const methodWithUserId = { ...method, userId: 'demo-user-1' };
    
    const updatedMethods = [...paymentMethods, methodWithUserId];

    // Handle default payment method logic
    if (methodWithUserId.isDefault) {
      const methodsWithDefault = updatedMethods.map(m => ({
        ...m,
        isDefault: m.id === methodWithUserId.id
      }));
      updateLocalStorage(methodsWithDefault);
    } else {
      updateLocalStorage(updatedMethods);
    }

    toast({ 
      title: 'Payment Method Added', 
      description: 'A new payment method has been added to your account.' 
    });
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (method: PaymentMethod) => {
    setDeleteConfirm({ isOpen: true, method });
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm.method) return;

    const updatedMethods = paymentMethods.filter(method => method.id !== deleteConfirm.method!.id);
    
    // If we're deleting the default method and there are other methods, make the first one default
    if (deleteConfirm.method.isDefault && updatedMethods.length > 0) {
      updatedMethods[0].isDefault = true;
    }

    updateLocalStorage(updatedMethods);
    setDeleteConfirm({ isOpen: false, method: null });
    
    toast({ 
      title: 'Payment Method Removed', 
      description: 'The payment method has been removed from your account.',
      variant: 'destructive'
    });
  };

  const handleSetDefault = (method: PaymentMethod) => {
    const updatedMethods = paymentMethods.map(m => ({
      ...m,
      isDefault: m.id === method.id
    }));
    
    updateLocalStorage(updatedMethods);
    toast({ 
      title: 'Default Payment Method Updated', 
      description: 'Your default payment method has been changed.' 
    });
  };

  const formatCardExpiry = (month?: number, year?: number) => {
    if (!month || !year) return '';
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  const isCardExpired = (month?: number, year?: number) => {
    if (!month || !year) return false;
    const now = new Date();
    const expiryDate = new Date(year, month - 1);
    return expiryDate < now;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage your saved payment methods for faster and secure checkout.
            </CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4"/>
            Add Payment Method
          </Button>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No payment methods saved</p>
              <p>Add your first payment method for quick and secure checkout.</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4"/>
                Add Payment Method
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {method.type === 'card' ? getCardIcon(method.cardType) : getPaymentMethodIcon(method.type)}
                        <div>
                          <h3 className="font-semibold">
                            {method.nickname || 
                              (method.type === 'card' 
                                ? `${method.cardType?.toUpperCase()} ending in ${method.cardLast4}`
                                : method.upiId
                              )
                            }
                          </h3>
                          {method.isDefault && (
                            <Badge variant="default" className="mt-1">Default</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(method)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete payment method</span>
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      {method.type === 'card' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cardholder</span>
                            <span>{method.cardHolder}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expires</span>
                            <span className={isCardExpired(method.expiryMonth, method.expiryYear) ? 'text-destructive' : ''}>
                              {formatCardExpiry(method.expiryMonth, method.expiryYear)}
                              {isCardExpired(method.expiryMonth, method.expiryYear) && (
                                <Badge variant="destructive" className="ml-2 text-xs">Expired</Badge>
                              )}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {method.type === 'upi' && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">UPI ID</span>
                          <span className="font-mono">{method.upiId}</span>
                        </div>
                      )}
                    </div>

                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => handleSetDefault(method)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EnhancedPaymentDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSavePaymentMethod}
      />

      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(open) => 
        setDeleteConfirm({ isOpen: open, method: null })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment method? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Payment Method
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
