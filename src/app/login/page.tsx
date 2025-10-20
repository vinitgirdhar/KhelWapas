
'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCart } from '@/hooks/use-cart';
import { getPurchaseIntent, clearPurchaseIntent } from '@/lib/purchase-intent';
// Users will be authenticated via API

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPageInner() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Store user info in localStorage for frontend state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userProfile', JSON.stringify({
          fullName: result.user.fullName,
          email: result.user.email,
          role: result.user.role,
        }));
        
        window.dispatchEvent(new Event('storage'));

        toast({
          title: 'Login Successful!',
          description: `Welcome back, ${result.user.fullName}!`,
        });

        // If we have a saved purchase intent, complete it
        const intent = getPurchaseIntent();
        if (intent) {
          try {
            if (intent.product && intent.quantity) {
              addItem({ ...intent.product, quantity: intent.quantity });
            }
          } catch {}
          clearPurchaseIntent();
          if (intent.action === 'buy' || intent.action === 'checkout') {
            router.push('/checkout');
            return;
          }
          if (intent.action === 'add') {
            router.push('/cart');
            return;
          }
        }

        // Else follow redirect param or go home
        const redirect = searchParams.get('redirect');
        router.push(redirect ? decodeURIComponent(redirect) : '/');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: result.message || 'Invalid credentials.',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Error',
        description: 'An error occurred during login. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-20 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Welcome Back</CardTitle>
          <CardDescription>Log in to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams.get('redirect') && (
            <div className="mb-4">
              <Alert>
                <AlertDescription>
                  Please login to continue with your purchase.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log In
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Register here
            </Link>
          </p>
          {searchParams.get('redirect') && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              <Link href={decodeURIComponent(searchParams.get('redirect') || '/')}>Cancel and go back</Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
