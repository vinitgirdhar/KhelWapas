
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, XCircle, Mail, Phone, MessageSquare } from 'lucide-react';
import { type SellRequest } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<SellRequest['status'], { icon: React.ReactNode; color: string; }> = {
    Pending: { icon: <Clock className="h-4 w-4" />, color: "text-yellow-800 bg-yellow-100 border-yellow-200" },
    Approved: { icon: <CheckCircle className="h-4 w-4" />, color: "text-green-800 bg-green-100 border-green-200" },
    Rejected: { icon: <XCircle className="h-4 w-4" />, color: "text-red-800 bg-red-100 border-red-200" },
};

const contactConfig = {
    Email: <Mail className="h-4 w-4" />,
    Phone: <Phone className="h-4 w-4" />,
    WhatsApp: <MessageSquare className="h-4 w-4" />,
}

export default function SellRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const [request, setRequest] = useState<(SellRequest & { reviewReason?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [grade, setGrade] = useState('B');
  const { toast } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setRequest(null); setReason('');
    void fetchSellRequest(controller.signal);
    return () => controller.abort();
  }, [params.id]);

  const fetchSellRequest = async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/admin/sell-requests/${params.id}`, { signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not load request');
      setRequest(data.sellRequest);
    } catch (error) {
      if (!signal?.aborted) setError(error instanceof Error ? error.message : 'Could not load request');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  const updateStatus = async (action: 'approve' | 'reject') => {
    if (!request || request.status !== 'Pending' || busy) return;
    setBusy(true);
    const nextStatus = action === 'approve' ? 'Approved' : 'Rejected';
    try {
      const res = await fetch(`/api/admin/sell-requests/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason, grade }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not save review');
      setRequest({ ...request, status: nextStatus, reviewReason: reason });
      toast({ title: action === 'approve' ? 'Listing approved and published' : 'Sell request rejected' });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : 'Could not save review', variant: 'destructive' });
    } finally { setBusy(false); }
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
        <h1 role="alert" className="font-headline text-2xl font-bold">{error || 'Request not found'}</h1>
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
    <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" size="icon" className="h-11 w-11 shrink-0"><Link href="/admin/requests">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Link></Button>
        <h1 className="min-w-0 flex-1 text-xl font-semibold tracking-tight sm:grow-0">
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
            <CardContent className="space-y-4 break-words">
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
               <CardDescription>Seller photos show the equipment and its condition.</CardDescription>
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
            <CardContent className="space-y-4 break-words">
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
                {request.status !== 'Pending' ? <div className="space-y-2 text-sm"><p>This request has already been reviewed.</p>{request.reviewReason && <p className="break-words text-muted-foreground">Review note: {request.reviewReason}</p>}</div> : <>
                <label className="grid gap-2 text-sm" htmlFor="review-grade">Condition grade for publication<select id="review-grade" value={grade} onChange={event => setGrade(event.target.value)} disabled={busy} className="h-11 rounded-xl border bg-card px-3">{[['A','Minimal wear'],['B','Light wear'],['C','Visible wear'],['D','Significant wear']].map(([value,label]) => <option key={value} value={value}>{value} · {label}</option>)}</select></label>
                <div>
                  <label htmlFor="review-reason" className="text-sm text-muted-foreground">Reason (optional)</label>
                  <textarea id="review-reason" disabled={busy} value={reason} maxLength={1000} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full border rounded-md p-2 text-sm bg-background" rows={3} placeholder="Add a note for your decision" />
                </div>
                <Button disabled={busy} className="min-h-11" onClick={() => updateStatus('approve')}>{busy ? 'Saving review…' : 'Approve Request'}</Button>
                <Button disabled={busy} className="min-h-11" variant="destructive" onClick={() => updateStatus('reject')}>Reject Request</Button>
                </>}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
