
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
import { useAuth } from '@/hooks/use-auth';
import { safeReturnPath } from '@/lib/navigation';
// Users will be authenticated via API

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPageInner() {
  const [loading, setLoading] = useState<'account' | 'demo' | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { login } = useAuth();
  const redirect = safeReturnPath(searchParams.get('redirect'));

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function signIn(data?: LoginFormValues) {
    if (loading) return;
    const isDemo = !data;
    setLoading(isDemo ? 'demo' : 'account');
    
    try {
      const response = await fetch(isDemo ? '/api/auth/demo' : '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data ?? {}),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await login();

        toast({
          title: isDemo ? 'Your demo account is ready' : 'Login Successful!',
          description: isDemo ? 'Explore your sample orders and try a simulated checkout.' : `Welcome back, ${result.user.fullName}!`,
        });

        // If we have a saved purchase intent, complete it
        const intent = getPurchaseIntent();
        if (intent) {
          try {
            if (intent.product && intent.quantity) {
              addItem(intent.product, intent.quantity);
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

        // Demo visitors start with their sample history unless continuing a journey.
        router.push(isDemo && !searchParams.get('redirect') ? '/profile/orders' : redirect);
      } else {
        toast({
          variant: 'destructive',
          title: isDemo ? 'Demo login unavailable' : 'Login Failed',
          description: result.message || (isDemo ? 'Could not prepare your demo account. Please try again.' : 'Invalid credentials.'),
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: isDemo ? 'Demo login unavailable' : 'Login Error',
        description: 'Could not connect. Check your connection and try again.',
      });
    } finally {
      setLoading(null);
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
            <form onSubmit={form.handleSubmit(data => signIn(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
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
                      <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold" disabled={!!loading}>
                {loading === 'account' && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
                {loading === 'account' ? 'Logging in…' : 'Log In'}
              </Button>
            </form>
          </Form>
          <Button type="button" variant="outline" className="mt-3 w-full font-semibold" disabled={!!loading} onClick={() => void signIn()} aria-describedby="demo-login-description">
            {loading === 'demo' && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
            {loading === 'demo' ? 'Preparing your demo…' : 'Demo Login'}
          </Button>
          <p id="demo-login-description" className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
            Explore a personal demo account with sample orders and transactions. All activity is simulated; no money moves.
          </p>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href={searchParams.get('redirect') ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'} className="font-semibold text-primary hover:underline">
              Register here
            </Link>
          </p>
          {searchParams.get('redirect') && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              <Link href={redirect}>Cancel and go back</Link>
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
