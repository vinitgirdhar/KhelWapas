
'use client';

import { useState } from 'react';
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

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Registration Successful!',
          description: `Welcome to Khelwapas, ${result.user.fullName}!`,
        });

        // Redirect user to the login page, preserving redirect
        const redirect = searchParams.get('redirect');
        router.push(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login');
      } else {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: result.message || 'Failed to create account.',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Error',
        description: 'An error occurred during registration. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-20 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
          <CardDescription>Join Khelwapas to start buying and selling.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                Create Account
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href={searchParams.get('redirect') ? `/login?redirect=${encodeURIComponent(searchParams.get('redirect') as string)}` : '/login'} className="font-semibold text-primary hover:underline">
              Log in here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
