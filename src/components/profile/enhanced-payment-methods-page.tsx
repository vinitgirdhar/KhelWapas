import Link from 'next/link';
import { FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function DemoPayments() { return <div className="rounded-3xl border bg-white p-8"><FlaskConical className="mb-4 text-accent" /><h2 className="text-2xl font-semibold">Payments, without the payment.</h2><p className="mt-3 max-w-lg leading-relaxed text-muted-foreground">This prototype uses a payment simulator. Choose success or failure at checkout to test the full order flow. No real card numbers, UPI IDs, or banking details are collected.</p><Button className="mt-6" asChild><Link href="/cart">Go to your bag</Link></Button></div>; }
