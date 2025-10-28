
'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, MapPin, Star, ShoppingBag, Tag, Edit, Trash2 } from 'lucide-react';
// User data will be fetched via API
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusConfig: Record<UserType['status'], string> = {
  'Active': 'bg-green-100 text-green-800 border-green-200',
  'Blocked': 'bg-red-100 text-red-800 border-red-200',
  'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const roleConfig: Record<UserType['role'], string> = {
    'Admin': 'bg-primary/10 text-primary border-primary/20',
    'Buyer': 'bg-blue-100 text-blue-800 border-blue-200',
    'Seller': 'bg-purple-100 text-purple-800 border-purple-200',
    'User': 'bg-gray-100 text-gray-800 border-gray-200',
};

// Mock data for user stats
const userStats = {
    orders: Math.floor(Math.random() * 50),
    itemsSold: Math.floor(Math.random() * 20),
    totalSpent: Math.floor(Math.random() * 50000) + 1000,
    totalEarned: Math.floor(Math.random() * 30000),
}


export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (!user) {
    notFound();
  }
  
  const renderRating = (rating: number) => (
    <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < Math.round(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
        ))}
        <span className="text-muted-foreground text-sm ml-1">({rating.toFixed(1)})</span>
    </div>
  )


  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
       <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-7 w-7">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          User Details
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm">
            Deactivate
          </Button>
          <Button asChild size="sm">
            <Link href={`/admin/users/${user.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_300px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
                <CardHeader className="flex flex-row items-start gap-6">
                    <Avatar className="w-24 h-24 border">
                        <AvatarImage alt={user.name} src={user.avatar} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                             <Badge variant="outline" className={statusConfig[user.status]}>{user.status}</Badge>
                        </div>
                         <Badge variant="outline" className={`mt-2 ${roleConfig[user.role]}`}>{user.role}</Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                           Joined on {new Date(user.registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <div className="mt-2">{renderRating(user.rating)}</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-muted-foreground" />
                            <a href={`mailto:${user.email}`} className="text-sm hover:underline">{user.email}</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm">{user.phone}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                            <span className="text-sm">{user.address.street}, {user.address.city}, {user.address.state} {user.address.zip}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>A log of the user's most recent orders and listings.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell><Badge variant="secondary">Order</Badge></TableCell>
                          <TableCell>Purchase of "Pro Grade Cricket Bat"</TableCell>
                          <TableCell>2024-07-20</TableCell>
                          <TableCell className="text-right text-destructive">- ₹12,000</TableCell>
                        </TableRow>
                        <TableRow>
                           <TableCell><Badge>Listing</Badge></TableCell>
                          <TableCell>Sale of "Used Football Boots"</TableCell>
                          <TableCell>2024-07-18</TableCell>
                          <TableCell className="text-right text-green-600">+ ₹3,200</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>User Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Orders</span>
                        <span className="font-semibold">{userStats.orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Items Sold</span>
                        <span className="font-semibold">{userStats.itemsSold}</span>
                    </div>
                     <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Spent</span>
                        <span className="font-semibold">₹{userStats.totalSpent.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Earned</span>
                        <span className="font-semibold">₹{userStats.totalEarned.toLocaleString('en-IN')}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

    </main>
  );
}
