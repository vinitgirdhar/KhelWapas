'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AddressDialog } from '@/components/profile/address-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/types/user';
export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]), [open, setOpen] = useState(false), [editing, setEditing] = useState<Address | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  const { toast } = useToast();
  async function load() { setLoading(true); setError(''); try { const r = await fetch('/api/profile/addresses'); const d = await r.json(); if (!r.ok) throw new Error(d.message); setAddresses(d); } catch(e) { setError((e as Error).message); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, []);
  async function save(address: Address) {
    if (busy) return; setBusy(true);
    try { const response = await fetch(editing ? `/api/profile/addresses/${editing.id}` : '/api/profile/addresses', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(address) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || data.error); await load(); setOpen(false); toast({ title: 'Address saved' }); } catch(e) { toast({ title: (e as Error).message, variant: 'destructive' }); } finally { setBusy(false); }
  }
  async function remove(id: string) { if (busy) return; setBusy(true); try { const r = await fetch(`/api/profile/addresses/${id}`, { method: 'DELETE' }); if (!r.ok) throw new Error('Could not delete address'); await load(); } catch(e) { toast({ title: (e as Error).message, variant: 'destructive' }); } finally { setBusy(false); } }
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-3xl font-semibold">Your addresses</h2><Button disabled={busy} onClick={() => { setEditing(null); setOpen(true); }}>Add an address</Button></div>{loading && <p role="status">Loading your addresses…</p>}{error && <div role="alert" className="space-y-3"><p>{error}</p><Button variant="outline" onClick={load}>Try again</Button></div>}{!loading && !error && !addresses.length && <p className="text-muted-foreground">Add an address to make checkout a little quicker.</p>}<div className="grid gap-4 md:grid-cols-2">{addresses.map(a => <Card key={a.id} className="min-w-0"><CardContent className="space-y-3 break-words p-5 sm:p-6"><strong>{a.title}{a.isDefault && ' · Default'}</strong><p>{a.fullName}</p><p className="text-sm text-muted-foreground">{a.street}, {a.city}, {a.state} {a.postalCode}<br />{a.phone}</p><div className="flex flex-wrap gap-2"><Button variant="outline" disabled={busy} aria-label={`Edit ${a.title} address`} onClick={() => { setEditing(a); setOpen(true); }}>Edit</Button><Button variant="ghost" disabled={busy} aria-label={`Remove ${a.title} address`} onClick={() => remove(a.id)}>Remove</Button></div></CardContent></Card>)}</div><AddressDialog isOpen={open} onOpenChange={setOpen} onSave={save} address={editing} /></div>;
}
