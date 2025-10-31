
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { OptimizedLink } from '@/components/ui/optimized-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Package, ShoppingCart, Users, CheckCircle, Clock, XCircle, MoreHorizontal } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { type SellRequest } from '@/types/user';

const statusConfig: Record<SellRequest['status'], { icon: React.ReactNode; color: string; badge: string; }> = {
    Pending: { icon: <Clock className="h-3 w-3" />, color: "text-yellow-600 bg-yellow-100/60 border-yellow-500/30", badge: "bg-yellow-500" },
    Approved: { icon: <CheckCircle className="h-3 w-3" />, color: "text-green-600 bg-green-100/60 border-green-500/30", badge: "bg-green-500" },
    Rejected: { icon: <XCircle className="h-3 w-3" />, color: "text-red-600 bg-red-100/60 border-red-500/30", badge: "bg-red-500" },
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [currentSellRequests, setCurrentSellRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: { total: 0, change: 0 },
    orders: { total: 0, change: 0 },
    users: { total: 0, change: 0 },
    products: { total: 0 }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [sellRequestsRes, statsRes] = await Promise.all([
        fetch('/api/admin/sell-requests'),
        fetch('/api/admin/stats')
      ]);

      if (sellRequestsRes.ok) {
        const data = await sellRequestsRes.json();
        setCurrentSellRequests(data.sellRequests || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSellRequestStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const action = status === 'Approved' ? 'approve' : 'reject';
      const response = await fetch(`/api/admin/sell-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Update local state
        setCurrentSellRequests(prev => 
          prev.map(req => 
            req.id === id ? { ...req, status } : req
          )
        );
        
        toast({
          title: `Request ${status}`,
          description: `The sell request has been marked as ${status.toLowerCase()}.`,
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating sell request status:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (id: string, status: 'Approved' | 'Rejected') => {
    updateSellRequestStatus(id, status);
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatChangePercent = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getImageUrl = (imageUrls: any): string => {
    if (!imageUrls) return '/images/products/background.jpg';
    
    // If it's already an array
    if (Array.isArray(imageUrls)) {
      return imageUrls[0] || '/images/products/background.jpg';
    }
    
    // If it's a string, try to parse it
    if (typeof imageUrls === 'string') {
      try {
        const parsed = JSON.parse(imageUrls);
        return Array.isArray(parsed) ? (parsed[0] || '/images/products/background.jpg') : '/images/products/background.jpg';
      } catch {
        // If it's not JSON, assume it's a direct URL
        return imageUrls || '/images/products/background.jpg';
      }
    }
    
    return '/images/products/background.jpg';
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
         <h1 className="font-headline text-2xl font-bold">Admin Dashboard</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <OptimizedLink href="/admin/revenue" prefetch={true} className="block transition-transform duration-100 hover:scale-[1.02] active:scale-[0.98]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatChangePercent(stats.revenue.change)} from last month
                </p>
              </CardContent>
            </Card>
          </OptimizedLink>
           <OptimizedLink href="/admin/users" prefetch={true} className="block transition-transform duration-100 hover:scale-[1.02] active:scale-[0.98]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.users.total}</div>
                <p className="text-xs text-muted-foreground">
                  {formatChangePercent(stats.users.change)} from last month
                </p>
              </CardContent>
            </Card>
          </OptimizedLink>
          <OptimizedLink href="/admin/orders" prefetch={true} className="block transition-transform duration-100 hover:scale-[1.02] active:scale-[0.98]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.orders.total}</div>
                <p className="text-xs text-muted-foreground">
                  {formatChangePercent(stats.orders.change)} from last month
                </p>
              </CardContent>
            </Card>
          </OptimizedLink>
          <OptimizedLink href="/admin/products" prefetch={true} className="block transition-transform duration-100 hover:scale-[1.02] active:scale-[0.98]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Products Listed
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.products.total}</div>
                <p className="text-xs text-muted-foreground">
                  Available for sale
                </p>
              </CardContent>
            </Card>
          </OptimizedLink>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Recent Sell Requests</CardTitle>
                <CardDescription>A list of the most recent manual sell requests from users.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading sell requests...</div>
                ) : currentSellRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No sell requests found.</div>
                ) : (
                  <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="hidden sm:table-cell">Seller</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Asking Price</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentSellRequests.map((request) => (
                        <TableRow key={request.id}>
                           <TableCell className="hidden sm:table-cell">
                                <div className="font-medium">{request.fullName}</div>
                                <div className="text-sm text-muted-foreground">{request.email}</div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-start gap-4">
                                     <Image
                                        src={getImageUrl(request.imageUrls)}
                                        alt={request.title}
                                        width={64}
                                        height={64}
                                        className="hidden sm:block rounded-md object-cover"
                                     />
                                    <div>
                                        <div className="font-medium">{request.title}</div>
                                        <div className="text-sm text-muted-foreground">{request.category}</div>
                                         <p className="max-w-xs truncate text-xs text-muted-foreground mt-1 hidden lg:block">{request.description}</p>
                                    </div>
                                </div>
                            </TableCell>
                             <TableCell>₹{request.price.toLocaleString('en-IN')}</TableCell>
                             <TableCell className="hidden md:table-cell">
                                <Badge variant="outline" className={`gap-2 border ${statusConfig[request.status].color}`}>
                                     {statusConfig[request.status].icon}
                                     {request.status}
                                </Badge>
                             </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Toggle menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                      <OptimizedLink href={`/admin/requests/${request.id}`} prefetch={true} className="w-full">View Details</OptimizedLink>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'Approved')}>Approve</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'Rejected')}>Reject</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  )
}
