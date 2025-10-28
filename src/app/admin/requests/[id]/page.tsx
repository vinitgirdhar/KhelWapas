
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, XCircle, Mail, Phone, MessageSquare } from 'lucide-react';
import { type SellRequest } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const statusConfig: Record<SellRequest['status'], { icon: React.ReactNode; color: string; }> = {
    Pending: { icon: <Clock className="h-4 w-4" />, color: "text-yellow-600 bg-yellow-100/60 border-yellow-500/30" },
    Approved: { icon: <CheckCircle className="h-4 w-4" />, color: "text-green-600 bg-green-100/60 border-green-500/30" },
    Rejected: { icon: <XCircle className="h-4 w-4" />, color: "text-red-600 bg-red-100/60 border-red-500/30" },
};

const contactConfig = {
    Email: <Mail className="h-4 w-4" />,
    Phone: <Phone className="h-4 w-4" />,
    WhatsApp: <MessageSquare className="h-4 w-4" />,
}

export default function SellRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [request, setRequest] = useState<SellRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchSellRequest();
  }, [id]);

  const fetchSellRequest = async () => {
    try {
      const response = await fetch(`/api/admin/sell-requests/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data.sellRequest);
      }
    } catch (error) {
      console.error('Error fetching sell request:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (action: 'approve' | 'reject') => {
    if (!request) return;
    // optimistic update
    const prev = request;
    const nextStatus = action === 'approve' ? 'Approved' : 'Rejected';
  setRequest({ ...request, status: nextStatus });
    try {
      const res = await fetch(`/api/admin/sell-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (e) {
      // revert on error
      setRequest(prev);
    }
  }

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-headline text-4xl font-bold">Loading...</h1>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-headline text-4xl font-bold">Request not found</h1>
        <Button asChild className="mt-6">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
            <Button variant="outline" size="icon" className="h-7 w-7">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
        </Link>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Sell Request Details
        </h1>
         <Badge variant="outline" className={`ml-auto sm:ml-0 gap-2 ${statusConfig[request.status].color}`}>
            {statusConfig[request.status].icon}
            {request.status}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Title</div>
                        <div className="font-semibold">{request.title}</div>
                    </div>
                     <div>
                        <div className="text-sm font-medium text-muted-foreground">Category</div>
                        <div className="font-semibold">{request.category}</div>
                    </div>
                </div>
                 <div>
                    <div className="text-sm font-medium text-muted-foreground">Description</div>
                    <p className="text-sm">{request.description}</p>
                </div>
                 <Separator />
                <div className="grid grid-cols-2 gap-2">
                     <div>
                        <div className="text-sm font-medium text-muted-foreground">Asking Price</div>
                        <div className="font-bold text-lg text-primary">₹{request.price.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
               <CardDescription>A minimum of 5 images are required.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {request.imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square w-full overflow-hidden rounded-md">
                    <Image
                      src={url}
                      alt={`Product Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                    <div className="text-sm font-medium text-muted-foreground">Full Name</div>
                    <div className="font-semibold">{request.fullName}</div>
                </div>
                 <div>
                    <div className="text-sm font-medium text-muted-foreground">Email Address</div>
                    <div className="font-semibold">{request.email}</div>
                </div>
                 <Separator />
                 <div>
                    <div className="text-sm font-medium text-muted-foreground">Contact Method</div>
                    <div className="flex items-center gap-2 font-semibold">
                       {contactConfig[request.contactMethod]}
                       {request.contactMethod}
                    </div>
                </div>
                 {(request.contactMethod === 'Phone' || request.contactMethod === 'WhatsApp') && (
                     <div>
                        <div className="text-sm font-medium text-muted-foreground">{request.contactMethod} Number</div>
                        <div className="font-semibold">{request.contactDetail}</div>
                    </div>
                 )}
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
              <CardContent className="grid gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Reason (optional)</label>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full border rounded-md p-2 text-sm bg-background" rows={3} placeholder="Add a note for your decision" />
                </div>
                <Button onClick={() => updateStatus('approve')}>Approve Request</Button>
                <Button variant="destructive" onClick={() => updateStatus('reject')}>Reject Request</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
