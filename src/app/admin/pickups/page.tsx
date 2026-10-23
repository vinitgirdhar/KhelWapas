'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
type Pickup = { id: string; requestId: string; assignee: string; scheduledAt: string; status: string };
export default function Pickups() {
  const [pickups, setPickups] = useState<Pickup[]>([]), [requests, setRequests] = useState<{ id: string; title: string; status: string }[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const { toast } = useToast();
  async function load() { try { const [p, r] = await Promise.all([fetch('/api/admin/pickups'), fetch('/api/admin/sell-requests?limit=100')]); if (!p.ok || !r.ok) throw new Error('Could not load pickup requests'); setPickups((await p.json()).pickups); setRequests((await r.json()).sellRequests.filter((v: { status: string }) => v.status !== 'Rejected')); } catch(e) { setError((e as Error).message); } }
  useEffect(() => { void load(); }, []);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget, data = Object.fromEntries(new FormData(form)); setBusy(true);
    try { const r = await fetch('/api/admin/pickups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, scheduledAt: new Date(String(data.scheduledAt)).toISOString() }) }); const d = await r.json(); if (!r.ok) throw new Error(d.message); await load(); form.reset(); toast({ title: 'Demo pickup scheduled' }); } catch(e) { toast({ title: (e as Error).message, variant: 'destructive' }); } finally { setBusy(false); }
  }
  return <div className="space-y-6 p-6"><h1 className="text-3xl font-semibold">Demo pickup scheduling</h1><p className="max-w-xl text-sm text-muted-foreground">Save a pickup plan for a sell request. This prototype records the plan; it does not book a courier or contact the seller.</p>{error && <p role="alert">{error}</p>}<form onSubmit={save} className="grid max-w-xl gap-4 rounded-2xl border bg-white p-6"><label className="grid gap-2 text-sm">Sell request<select required name="requestId" className="h-11 rounded-xl border px-3"><option value="">Choose a request</option>{requests.map(r => <option key={r.id} value={r.id}>{r.title} · {r.status}</option>)}</select></label><label className="grid gap-2 text-sm">Assigned to<Input required minLength={2} maxLength={100} name="assignee" placeholder="Team member name" /></label><label className="grid gap-2 text-sm">Pickup date and time<Input name="scheduledAt" type="datetime-local" required /></label><Button disabled={busy}>Save pickup plan</Button></form><div className="grid gap-3">{pickups.map(p => <div key={p.id} className="flex flex-wrap justify-between gap-3 rounded-2xl border bg-white p-5"><div><strong>{requests.find(r => r.id === p.requestId)?.title || p.requestId}</strong><p className="mt-1 text-sm text-muted-foreground">{p.assignee} · {new Date(p.scheduledAt).toLocaleString('en-IN')}</p></div><span className="text-sm text-primary">{p.status}</span></div>)}</div></div>;
}
