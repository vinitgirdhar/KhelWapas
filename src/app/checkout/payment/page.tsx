'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FlaskConical, CheckCircle2, XCircle, Loader2, LockKeyhole } from 'lucide-react';
import { useCart, type CartItem } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import OrderSummary from '@/components/checkout/order-summary';
import type { Address } from '@/types/user';
export default function PaymentPage() {
  const router = useRouter(), { toast } = useToast(), { items, removeAll } = useCart(), { isLoggedIn, loading: authLoading } = useAuth();
  const [address, setAddress] = useState<Address | null>(null), [busy, setBusy] = useState(false), [outcome, setOutcome] = useState<'success' | 'failure'>('success'), [error, setError] = useState('');
  const key = useRef('');
  const [quote, setQuote] = useState<{ items: { productId: string; price: number; productName: string; image: string }[]; totalPrice: number } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { router.replace('/login?redirect=%2Fcheckout'); return; }
    try { const saved = JSON.parse(sessionStorage.getItem('selectedAddress') || 'null'); if (!saved?.id) router.replace('/checkout'); else setAddress(saved); } catch { router.replace('/checkout'); }
    key.current = sessionStorage.getItem('checkoutKey') || crypto.randomUUID();
    sessionStorage.setItem('checkoutKey', key.current);
  }, [authLoading, isLoggedIn, router]);
  useEffect(() => {
    if (!address || !items.length) { setQuoteLoading(false); return; }
    const controller = new AbortController(); setQuoteLoading(true); setQuote(null);
    fetch('/api/checkout/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ items: items.map(i => ({ productId: i.id, quantity: i.quantity })), addressId: address.id }) }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message); setQuote(d.quote); setError(''); }).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!controller.signal.aborted) setQuoteLoading(false); });
    return () => controller.abort();
  }, [address, items]);
  async function pay() {
    if (!address || busy || !quote || quoteLoading) return;
    setBusy(true); setError('');
    try {
      const payload = { items: items.map(i => ({ productId: i.id, quantity: i.quantity })), addressId: address.id, outcome, expectedTotal: quote.totalPrice };
      const signature = JSON.stringify(payload);
      if (sessionStorage.getItem('checkoutPayload') !== signature) { key.current = crypto.randomUUID(); sessionStorage.setItem('checkoutKey', key.current); sessionStorage.setItem('checkoutPayload', signature); }
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key.current }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not place order');
      sessionStorage.removeItem('checkoutKey'); key.current = crypto.randomUUID();
      if (result.order.paymentStatus === 'failed') { setError('Demo payment declined. Your bag is unchanged and no money was charged. Choose success to try again.'); return; }
      removeAll(); sessionStorage.removeItem('selectedAddress');
      toast({ title: 'Demo payment successful', description: 'Your prototype order is confirmed. No money was charged.' });
      router.replace(`/checkout/success?order=${encodeURIComponent(result.order.id)}`);
    } catch(e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  if (authLoading || !address) return <div className="container py-16" role="status">Preparing checkout…</div>;
  return <div className="container py-10 md:py-16"><Link href="/checkout" className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16} />Back to shipping</Link><p className="text-xs font-semibold uppercase tracking-widest text-accent">Step 2 of 2</p><h1 className="mt-3 mb-8 text-4xl font-semibold tracking-tight">One step closer to game day.</h1><div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]"><Card><CardContent className="space-y-7 p-6 md:p-8"><div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5"><FlaskConical className="shrink-0 text-amber-700" /><div><h2 className="font-semibold text-amber-950">Payment simulator · Prototype</h2><p className="mt-1 text-sm text-amber-900">No real money moves. No card number, UPI ID, or bank details needed.</p></div></div><div><h2 className="text-xl font-semibold">Choose a demo outcome</h2><p className="mt-1 text-sm text-muted-foreground">Test a successful checkout or see how a declined payment works.</p></div><div role="radiogroup" aria-label="Demo payment outcome" className="grid gap-3">{(['success','failure'] as const).map(value => <button key={value} type="button" role="radio" aria-checked={outcome === value} disabled={busy} onClick={() => setOutcome(value)} className={`flex items-center gap-3 rounded-xl border p-5 text-left ${outcome === value ? 'border-primary bg-primary/5' : ''}`}>{value === 'success' ? <CheckCircle2 className="text-emerald-600" /> : <XCircle className="text-rose-500" />}<span><strong className="block">{value === 'success' ? 'Simulate successful payment' : 'Simulate declined payment'}</strong><span className="text-sm text-muted-foreground">{value === 'success' ? 'Confirm the order and reserve stock.' : 'Keep your bag and try again.'}</span></span></button>)}</div><p className="flex items-center gap-2 text-sm text-muted-foreground"><LockKeyhole size={16} />Your total and stock are checked on the server.</p></CardContent></Card><Card><CardContent className="space-y-6 p-6 md:p-8">{quoteLoading ? <p role="status">Checking current prices and availability…</p> : quote ? <OrderSummary items={items.map(item => { const current = quote.items.find(p => p.productId === item.id); return current ? { ...item, price: current.price, name: current.productName, image: current.image } : item; })} /> : <p className="text-sm text-muted-foreground">Review your bag and refresh this page to try again.</p>}<div className="rounded-xl bg-muted/60 p-4 text-sm"><strong>Deliver to {address.fullName}</strong><p className="mt-1 text-muted-foreground">{address.street}, {address.city}, {address.state} {address.postalCode}</p></div>{error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}<Button size="lg" className="w-full rounded-full" disabled={busy || !items.length || quoteLoading || !quote} onClick={pay}>{busy ? <><Loader2 className="animate-spin" />Processing demo payment…</> : 'Run demo payment'}</Button><p className="text-center text-xs text-muted-foreground">Demo only. No payment will be collected.</p></CardContent></Card></div></div>;
}
