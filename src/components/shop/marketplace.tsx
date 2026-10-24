'use client';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ArrowUpRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/product-card';
import { catalogKey, getCatalogSnapshot, loadCatalog, subscribeCatalog } from '@/lib/catalog-cache';
export default function Marketplace({ type }: { type: 'new' | 'preowned' }) {
  const [query, setQuery] = useState(''), [category, setCategory] = useState(''), [sort, setSort] = useState('newest'), [grade, setGrade] = useState(''), [page, setPage] = useState(1), [retry, setRetry] = useState(0);
  // Debounce typing only: opening a catalog or changing a filter fetches immediately.
  const [search, setSearch] = useState(query);
  useEffect(() => {
    if (!query) { setSearch(''); return; }
    const timer = setTimeout(() => setSearch(query), 180);
    return () => clearTimeout(timer);
  }, [query]);
  const key = useMemo(() => catalogKey({ type, search, category, sort, grade, page }), [type, search, category, sort, grade, page]);
  const subscribe = useCallback((listener: () => void) => subscribeCatalog(key, listener), [key]);
  const snapshot = useSyncExternalStore(subscribe, () => getCatalogSnapshot(key), () => undefined);
  const [request, setRequest] = useState({ key: '', error: '' });
  const data = snapshot?.data;
  const products = data?.products || [], categories = data?.categories || [];
  const total = data?.pagination.total || 0, pages = data?.pagination.pages || 0;
  const error = request.key === key ? request.error : '';
  const loading = !data && !error;
  useEffect(() => {
    let active = true;
    async function refresh() {
      if (!active) return;
      setRequest({ key, error: '' });
      try { await loadCatalog(key, true); }
      catch (error) { if (active) setRequest({ key, error: error instanceof Error ? error.message : 'Could not load gear' }); return; }
    }
    void refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('khelwapas:catalog-change', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); window.removeEventListener('khelwapas:catalog-change', refresh); };
  }, [key, retry]);
  function reset() { setQuery(''); setCategory(''); setGrade(''); setPage(1); }
  return <div className="container py-10 md:py-16"><div className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">The KhelWapas marketplace</p><h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">{type === 'preowned' ? 'Good gear. New beginnings.' : 'Fresh gear. Fresh possibilities.'}</h1><p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">{type === 'preowned' ? 'Pre-loved equipment, ready for its next player. Find something for every sport and every starting line.' : 'Find your next favorite piece of sports equipment. Ready for the first of many games.'}</p></div><Link href="/sell" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Have gear to pass on? <ArrowUpRight size={16} /></Link></div>
    <div className="liquid-glass mb-8 grid gap-3 rounded-2xl border p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"><label className="relative"><span className="sr-only">Search gear</span><Search size={18} className="absolute left-3 top-3.5 text-muted-foreground" /><Input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Search your next game…" className="h-11 rounded-xl bg-card/80 pl-10" /></label><label><span className="sr-only">Sport</span><select className="h-11 w-full rounded-xl border bg-card/80 px-3 text-sm" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}><option value="">Every sport</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label><span className="sr-only">Condition</span><select disabled={type === 'new'} className="h-11 w-full rounded-xl border bg-card/80 px-3 text-sm disabled:opacity-50" value={grade} onChange={e => { setGrade(e.target.value); setPage(1); }}><option value="">{type === 'new' ? 'Brand new' : 'Every condition'}</option>{['A','B','C','D'].map(g => <option key={g} value={g}>Grade {g}</option>)}</select></label><label><span className="sr-only">Sort gear</span><select className="h-11 w-full rounded-xl border bg-card/80 px-3 text-sm" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="newest">Recently added</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div>
    <div className="mb-5 flex items-center justify-between text-sm text-muted-foreground"><p role="status">{loading ? 'Finding your next gear…' : `${total} item${total === 1 ? '' : 's'} ready to play`}</p>{(query || category || grade) && <Button size="sm" variant="ghost" onClick={reset}><RotateCcw />Reset filters</Button>}</div>
    {error && <div role="alert" className={`mb-5 rounded-2xl border ${data ? 'flex flex-wrap items-center justify-between gap-3 p-4 text-sm' : 'p-10 text-center'}`}><p>{data ? `Showing recently viewed gear. ${error}` : error}</p><Button variant="outline" className={data ? '' : 'mt-4'} onClick={() => setRetry(r => r+1)}>Try again</Button></div>}
    {(!error || data) && <div className="product-grid grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" data-catalog-key={key} aria-busy={loading}>{loading ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />) : products.map(p => <ProductCard key={p.id} product={p} />)}</div>}
    {!loading && !error && !products.length && <div className="rounded-3xl bg-primary/5 px-6 py-16 text-center"><SlidersHorizontal className="mx-auto mb-4 text-primary" /><h2 className="text-2xl font-semibold">No gear here just yet.</h2><p className="mt-3 text-muted-foreground">Try another search, or be the first to list something.</p><div className="mt-6 flex justify-center gap-3"><Button variant="outline" onClick={reset}>Clear filters</Button><Button asChild><Link href="/sell">Sell your gear</Link></Button></div></div>}
    {!loading && pages > 1 && <div className="mt-10 flex items-center justify-center gap-5"><Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p-1)}>Previous</Button><span className="text-sm">{page} / {pages}</span><Button variant="outline" disabled={page >= pages} onClick={() => setPage(p => p+1)}>Next</Button></div>}
  </div>;
}
