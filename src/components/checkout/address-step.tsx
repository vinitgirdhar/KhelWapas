'use client';
import { useEffect, useState } from 'react';
import { Plus, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddressDialog } from '@/components/profile/address-dialog-new';
import type { Address } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
export default function AddressStep({ selectedAddress, onSelectAddress }: { selectedAddress: Address | null; onSelectAddress: (address: Address | null) => void }) {
  const [addresses, setAddresses] = useState<Address[]>([]), [open, setOpen] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const { toast } = useToast();
  async function load() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/profile/addresses'); const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not load addresses');
      setAddresses(data);
      const selected = data.find((a: Address) => a.id === selectedAddress?.id) || data.find((a: Address) => a.isDefault) || data[0] || null;
      onSelectAddress(selected);
    } catch(e) { setError((e as Error).message); } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function save(address: Address) {
    try {
      const response = await fetch('/api/profile/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(address) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Could not save address');
      setAddresses(prev => [...prev.map(a => ({ ...a, isDefault: data.isDefault ? false : a.isDefault })), data]);
      onSelectAddress(data); setOpen(false);
    } catch(e) { toast({ variant: 'destructive', title: 'Address not saved', description: (e as Error).message }); }
  }
  return <div className="space-y-5"><div><p className="text-xs font-semibold uppercase tracking-widest text-accent">Step 1 of 2</p><h2 className="mt-2 text-2xl font-semibold">Where should it go?</h2><p className="mt-2 text-sm text-muted-foreground">Choose a saved address or add a new one.</p></div>{loading && <p role="status">Loading your addresses…</p>}{error && <div role="alert"><p>{error}</p><Button onClick={load} variant="outline">Try again</Button></div>}
    <div className="grid gap-3" role="radiogroup" aria-label="Shipping address">{addresses.map(a => <button type="button" role="radio" aria-checked={selectedAddress?.id === a.id} key={a.id} onClick={() => onSelectAddress(a)} className={`flex items-start gap-3 rounded-2xl border p-5 text-left transition-colors ${selectedAddress?.id === a.id ? 'border-primary bg-primary/5' : 'bg-white hover:bg-muted/40'}`}><MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" /><span className="flex-1"><strong>{a.fullName} · {a.title}</strong><span className="mt-1 block text-sm text-muted-foreground">{a.street}, {a.city}, {a.state} {a.postalCode}</span><span className="block text-sm text-muted-foreground">{a.phone}</span></span>{selectedAddress?.id === a.id && <Check size={18} />}</button>)}</div>
    <Button variant="outline" onClick={() => setOpen(true)}><Plus />Add an address</Button><AddressDialog isOpen={open} onOpenChange={setOpen} onSave={save} address={null} /></div>;
}
