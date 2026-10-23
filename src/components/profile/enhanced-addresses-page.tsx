'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AddressDialog } from './address-dialog-new';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/types/user';
export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]), [open, setOpen] = useState(false), [editing, setEditing] = useState<Address | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const { toast } = useToast();
  async function load() { try { const r = await fetch('/api/profile/addresses'); const d = await r.json(); if (!r.ok) throw new Error(d.message); setAddresses(d); } catch(e) { setError((e as Error).message); } }
  useEffect(() => { void load(); }, []);
  async function save(address: Address) {
    if (busy) return; setBusy(true);
    try { const response = await fetch(editing ? `/api/profile/addresses/${editing.id}` : '/api/profile/addresses', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(address) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || data.error); await load(); setOpen(false); toast({ title: 'Address saved' }); } catch(e) { toast({ title: (e as Error).message, variant: 'destructive' }); } finally { setBusy(false); }
  }
  async function remove(id: string) { if (busy) return; setBusy(true); try { const r = await fetch(`/api/profile/addresses/${id}`, { method: 'DELETE' }); if (!r.ok) throw new Error('Could not delete address'); await load(); } catch(e) { toast({ title: (e as Error).message, variant: 'destructive' }); } finally { setBusy(false); } }
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-3xl font-semibold">Your addresses</h2><Button onClick={() => { setEditing(null); setOpen(true); }}>Add an address</Button></div>{error && <p role="alert">{error}</p>}{!addresses.length && <p className="text-muted-foreground">Add an address to make checkout a little quicker.</p>}<div className="grid gap-4 md:grid-cols-2">{addresses.map(a => <Card key={a.id}><CardContent className="space-y-3 p-6"><strong>{a.title}{a.isDefault && ' · Default'}</strong><p>{a.fullName}</p><p className="text-sm text-muted-foreground">{a.street}, {a.city}, {a.state} {a.postalCode}<br />{a.phone}</p><div className="flex gap-2"><Button variant="outline" disabled={busy} onClick={() => { setEditing(a); setOpen(true); }}>Edit</Button><Button variant="ghost" disabled={busy} onClick={() => remove(a.id)}>Remove</Button></div></CardContent></Card>)}</div><AddressDialog isOpen={open} onOpenChange={setOpen} onSave={save} address={editing} /></div>;
}
