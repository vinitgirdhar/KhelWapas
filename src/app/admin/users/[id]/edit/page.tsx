
'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
// User data will be fetched and updated via API
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';


const editUserSchema = z.object({
  name: z.string().min(2, 'Full name is required.'),
  email: z.string().email(),
  phone: z.string().min(10, 'A valid phone number is required.'),
  role: z.enum(['Admin', 'Buyer', 'Seller', 'User']),
  status: z.enum(['Active', 'Blocked', 'Pending']),
  street: z.string().min(5, 'Street address is required.'),
  city: z.string().min(2, 'City is required.'),
  state: z.string().min(2, 'State is required.'),
  zip: z.string().min(5, 'A valid ZIP code is required.'),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // For now, we'll use a placeholder since we don't have a user detail API
        // In a real app, you'd fetch from /api/admin/users/[id]
        setUser({
          id: id,
          name: 'Loading...',
          email: 'loading@example.com',
          phone: '',
          role: 'user',
          status: 'active',
          address: {
            street: '',
            city: '',
            state: '',
            zip: ''
          }
        } as User);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        toast({ variant: 'destructive', title: 'Failed to load user' });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, toast]);

  useEffect(() => {
    if (user && !loading) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        street: user.address.street,
        city: user.address.city,
        state: user.address.state,
        zip: user.address.zip,
      });
    }
  }, [user, form, loading]);
  
  if (!user) {
    notFound();
  }

  const onSubmit = async (data: EditUserFormValues) => {
    try {
      // TODO: Implement user update API call
      // const response = await fetch(`/api/admin/users/${user.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      
      toast({ title: "User Updated", description: "The user's details have been saved." });
      router.push(`/admin/users/${user.id}`);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({ variant: 'destructive', title: 'Failed to update user' });
    }
  };


  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-7 w-7">
            <Link href={`/admin/users/${user.id}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Edit User: {user.name}
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              Discard
            </Button>
            <Button size="sm" type="submit">Save Changes</Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>
                  Update the user's personal and account details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                 </div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField control={form.control} name="street" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                 )}/>
                  <div className="grid grid-cols-3 gap-4">
                     <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="zip" render={({ field }) => (
                        <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                  </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Blocked">Blocked</SelectItem>
                           <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="User">User</SelectItem>
                           <SelectItem value="Buyer">Buyer</SelectItem>
                           <SelectItem value="Seller">Seller</SelectItem>
                           <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 md:hidden">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Discard
          </Button>
          <Button size="sm" type="submit">Save Changes</Button>
        </div>
      </div>
      </form>
    </Form>
    </main>
  );
}
