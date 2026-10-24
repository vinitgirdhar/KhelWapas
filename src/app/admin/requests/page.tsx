'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Request = { id: string; title: string; status: 'Pending' | 'Approved' | 'Rejected'; createdAt: string };
export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    async function load() {
      try {
        const response = await fetch(`/api/admin/sell-requests?limit=20&page=${page}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Could not load sell requests');
        setRequests(data.sellRequests);
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Could not load sell requests'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [page, refresh]);
  return <main className="min-w-0 flex-1 p-4 sm:px-6">
    <Card className="min-w-0"><CardHeader><CardTitle>Sell requests</CardTitle><CardDescription>Review equipment submitted by sellers before publication.</CardDescription></CardHeader><CardContent>
      {loading ? <p role="status" className="py-8 text-center text-muted-foreground">Loading sell requests…</p> : error ? <div role="alert" className="space-y-3 py-6"><p>{error}</p><Button variant="outline" onClick={() => setRefresh(value => value + 1)}>Try again</Button></div> : requests.length === 0 ? <p className="py-8 text-center text-muted-foreground">No requests on this page.</p> : <div className="space-y-3">{requests.map(request => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"><div className="min-w-0 flex-1 basis-40"><p className="break-words font-medium">{request.title}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleString('en-IN')}</p></div><div className="flex items-center gap-3"><Badge variant="outline">{request.status}</Badge><Button asChild className="min-h-11"><Link href={`/admin/requests/${request.id}`}>Review</Link></Button></div></div>)}</div>}
    </CardContent>{!loading && !error && <CardFooter className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Page {page} · {requests.length} requests</p><div className="flex gap-2"><Button variant="outline" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Previous</Button><Button variant="outline" disabled={requests.length < 20} onClick={() => setPage(value => value + 1)}>Next</Button></div></CardFooter>}</Card>
  </main>;
}
