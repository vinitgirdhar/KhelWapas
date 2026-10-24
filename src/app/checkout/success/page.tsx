'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function SuccessPage() {
  const [order, setOrder] = useState('');
  useEffect(() => { setOrder(new URLSearchParams(window.location.search).get('order') || ''); }, []);
  return <div className="container max-w-xl py-24 text-center"><CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-emerald-600" /><p className="text-xs uppercase tracking-widest text-accent">Prototype checkout</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Ready for the next game.</h1><p className="mt-4 text-muted-foreground">Your demo order was submitted. No money was charged.</p>{order && <p className="mt-4 break-all rounded-xl bg-muted p-3 text-xs">Reference: {order}</p>}<div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild><Link href="/profile/orders">View your orders</Link></Button><Button asChild variant="outline"><Link href="/shop/preowned">Keep exploring</Link></Button></div></div>;
}
