'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
type User = { id: string; fullName: string; email: string; phone: string; role: string; status: string; _count: { orders: number; sellRequests: number } };
export default function UserEditor() {
  const { id } = useParams(), { toast } = useToast(), [user, setUser] = useState<User | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { const controller = new AbortController(); setUser(null); setError(''); fetch(`/api/admin/users/${id}`, { signal: controller.signal }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message); setUser(d.user); }).catch(e => { if (!controller.signal.aborted) setError(e.message); }); return () => controller.abort(); }, [id]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; setBusy(true);
    try { const r = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); const data = await r.json(); if (!r.ok) throw new Error(data.message); setUser(data.user); toast({ title: 'User updated' }); } catch(e) { toast({ title: (e as Error).message, variant: 'destructive' }); } finally { setBusy(false); }
  }
  if (!user) return <p className="p-6" role={error ? 'alert' : 'status'}>{error || 'Loading user…'}</p>;
  return <div className="min-w-0 space-y-6 p-4 sm:p-6"><Link href="/admin/users" className="text-sm underline">Back to users</Link><h1 className="break-words text-2xl font-semibold sm:text-3xl">{user.fullName}</h1><p className="text-sm text-muted-foreground">{user._count.orders} orders · {user._count.sellRequests} sell requests</p><Card className="min-w-0 max-w-2xl"><CardContent className="p-6"><form key={`${user.id}-${user.fullName}-${user.email}-${user.phone}-${user.role}-${user.status}`} onSubmit={save} className="grid gap-4">{[{ name: 'fullName', label: 'Name', type: 'text' },{ name: 'email', label: 'Email', type: 'email' },{ name: 'phone', label: 'Phone', type: 'tel' }].map(f => <label className="grid gap-2 text-sm font-medium" key={f.name}>{f.label}<Input type={f.type} name={f.name} defaultValue={user[f.name as 'fullName' | 'email' | 'phone'] || ''} required={f.name !== 'phone'} /></label>)}<label className="grid gap-2 text-sm">Role<select name="role" defaultValue={user.role} className="h-11 min-w-0 rounded-xl border bg-card px-3"><option value="user">User</option><option value="admin">Admin</option></select></label><label className="grid gap-2 text-sm">Status<select name="status" defaultValue={user.status} className="h-11 min-w-0 rounded-xl border bg-card px-3">{['Active','Blocked','Pending'].map(s => <option key={s}>{s}</option>)}</select></label><Button disabled={busy}>Save user</Button></form></CardContent></Card></div>;
}
