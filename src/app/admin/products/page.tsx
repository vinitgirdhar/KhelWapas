'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MoreHorizontal, PlusCircle, Search, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import type { Product } from '@/components/product-card';
import { useToast } from '@/hooks/use-toast';
import { invalidateCatalogCache } from '@/lib/catalog-cache';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type ProductRow = Product & { isAvailable?: boolean };
export default function AdminProductsPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState<ProductRow | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: '20', q: query.trim(), ...(type ? { type } : {}) });
        const response = await fetch(`/api/products?${params}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Could not load products');
        setProducts(result.products); setPagination(result.pagination);
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Could not load products');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, type, page, refresh]);

  async function archive() {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/products/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isAvailable: false }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not archive product');
      invalidateCatalogCache();
      setSelected(null); setRefresh(value => value + 1);
      toast({ title: 'Product archived', description: 'The listing is unavailable for purchase. You can publish it again from Edit.' });
    } catch (e) { toast({ title: e instanceof Error ? e.message : 'Could not archive product', variant: 'destructive' }); }
    finally { setBusy(false); }
  }

  return <main className="min-w-0 flex-1 space-y-4 p-4 sm:px-6 sm:py-0">
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative min-w-0 flex-1 basis-48"><span className="sr-only">Search products</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Search gear…" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} className="h-11 bg-card pl-9" /></label>
      <label><span className="sr-only">Product type</span><select value={type} onChange={event => { setType(event.target.value); setPage(1); }} className="h-11 rounded-xl border bg-card px-3 text-sm"><option value="">All products</option><option value="new">New gear</option><option value="preowned">Pre-owned gear</option></select></label>
      <Button variant="outline" size="icon" className="h-11 w-11" aria-label="Refresh products" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw className={loading ? 'animate-spin' : ''} /></Button>
      <Button asChild className="h-11"><Link href="/admin/products/new"><PlusCircle />Add product</Link></Button>
    </div>
    <Card className="min-w-0">
      <CardHeader><CardTitle>Products</CardTitle><CardDescription>Manage stock, prices and listing visibility.</CardDescription></CardHeader>
      <CardContent className="min-w-0">
        {error ? <div role="alert" className="space-y-3 py-6"><p>{error}</p><Button variant="outline" onClick={() => setRefresh(value => value + 1)}>Try again</Button></div> : loading ? <p role="status" className="py-8 text-center text-muted-foreground">Loading products…</p> : <Table>
          <TableHeader><TableRow><TableHead className="hidden sm:table-cell">Image</TableHead><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead className="hidden sm:table-cell">Type</TableHead><TableHead>Price</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
          <TableBody>
            {products.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No products match your search.</TableCell></TableRow>}
            {products.map(product => <TableRow key={product.id}>
              <TableCell className="hidden sm:table-cell"><Image alt="" src={product.image} width={56} height={56} className="h-14 w-14 rounded-xl bg-muted object-cover" /></TableCell>
              <TableCell className="min-w-36 max-w-64 whitespace-normal break-words font-medium">{product.name}<p className="mt-1 text-xs text-muted-foreground">{product.sku}</p></TableCell>
              <TableCell><Badge variant="outline" className={product.isAvailable === false ? 'bg-muted text-muted-foreground' : product.status === 'In Stock' ? 'border-green-200 bg-green-100 text-green-800' : 'border-red-200 bg-red-100 text-red-800'}>{product.isAvailable === false ? 'Archived' : product.status}</Badge><p className="mt-1 text-xs text-muted-foreground">{product.stock ?? 0} in stock</p></TableCell>
              <TableCell className="hidden sm:table-cell">{product.type === 'preowned' ? 'Pre-owned' : 'New'}</TableCell>
              <TableCell className="whitespace-nowrap">₹{product.price.toLocaleString('en-IN')}</TableCell>
              <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${product.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link href={`/admin/products/${product.id}`}>Edit product</Link></DropdownMenuItem>{product.isAvailable !== false && <DropdownMenuItem className="text-destructive" onClick={() => setSelected(product)}>Archive listing</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></TableCell>
            </TableRow>)}
          </TableBody>
        </Table>}
      </CardContent>
      {!loading && !error && <CardFooter className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{pagination.total === 0 ? '0 products' : `${(page - 1) * pagination.limit + 1}–${Math.min(page * pagination.limit, pagination.total)} of ${pagination.total} products`}</p><div className="flex items-center gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><Button variant="outline" disabled={page >= pagination.pages} onClick={() => setPage(value => value + 1)}>Next</Button></div></CardFooter>}
    </Card>
    <AlertDialog open={!!selected} onOpenChange={open => { if (!open && !busy) setSelected(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Archive this listing?</AlertDialogTitle><AlertDialogDescription>“{selected?.name}” will be unavailable for purchase. Its details and order history are preserved. You can publish it again from Edit.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={busy}>Keep listing</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={event => { event.preventDefault(); void archive(); }}>{busy ? 'Archiving…' : 'Archive listing'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </main>;
}
