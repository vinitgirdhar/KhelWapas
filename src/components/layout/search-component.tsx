'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Product } from '@/components/product-card';
export default function SearchComponent() {
  const [query, setQuery] = useState(''), [products, setProducts] = useState<Product[]>([]), [open, setOpen] = useState(false), [error, setError] = useState('');
  useEffect(() => {
    if (query.trim().length < 2) { setProducts([]); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => { try { const r = await fetch('/api/products?available=true&limit=6&q=' + encodeURIComponent(query), { signal: controller.signal }); const d = await r.json(); if (!r.ok) throw new Error('Search is unavailable. Please try again.'); setProducts(d.products); setError(''); } catch(e) { if ((e as Error).name !== 'AbortError') setError((e as Error).message); } }, 220);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);
  return <div className="relative w-full md:w-52" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}><label className="relative block"><span className="sr-only">Search sports equipment</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input type="search" value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }} placeholder="Find your gear…" className="h-11 rounded-full bg-card/70 pl-9" /></label>{open && query.trim().length >= 2 && <div className="absolute right-0 top-14 z-50 w-[min(320px,80vw)] overflow-hidden rounded-2xl border bg-card p-2 shadow-xl"><p role="status" className="px-3 py-2 text-xs text-muted-foreground">{error || (products.length ? 'Matching gear' : 'No matching gear')}</p>{products.map(p => <Link key={p.id} href={`/products/${p.id}`} className="block rounded-xl p-3 text-sm hover:bg-muted focus:bg-muted" onClick={() => { setOpen(false); setQuery(''); }}><span className="block font-medium">{p.name}</span><span className="text-muted-foreground">₹{p.price.toLocaleString('en-IN')} · {p.category}</span></Link>)}</div>}</div>;
}
