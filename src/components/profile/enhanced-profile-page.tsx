'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
export default function ProfilePage() {
  const { user, login } = useAuth(), { toast } = useToast();
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [phone, setPhone] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { if (user) { setName(user.fullName); setEmail(user.email); setPhone(user.phone || ''); } }, [user]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    try {
      const response = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: name, email, phone }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Could not save profile');
      await login(); toast({ title: 'Profile updated' });
    } catch(e) { toast({ variant: 'destructive', title: (e as Error).message }); } finally { setBusy(false); }
  }
  async function password(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget, data = Object.fromEntries(new FormData(form));
    if (data.newPassword !== data.confirmPassword) { toast({ variant: 'destructive', title: 'Passwords do not match' }); return; }
    setBusy(true);
    try { const response = await fetch('/api/profile/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json(); if (!response.ok) throw new Error(result.message); form.reset(); toast({ title: 'Password updated', description: 'Other sessions have been signed out.' }); } catch(e) { toast({ variant: 'destructive', title: (e as Error).message }); } finally { setBusy(false); }
  }
  return <div className="grid gap-6"><Card><CardContent className="p-6"><h2 className="mb-5 text-2xl font-semibold">Your player profile</h2><form onSubmit={save} className="grid gap-5"><label className="grid gap-2 text-sm font-medium">Full name<Input value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={100} autoComplete="name" /></label><label className="grid gap-2 text-sm font-medium">Email<Input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label><label className="grid gap-2 text-sm font-medium">Phone<Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" maxLength={20} /></label><Button disabled={busy} className="justify-self-start">{busy ? 'Saving…' : 'Save changes'}</Button></form></CardContent></Card><Card><CardContent className="p-6"><h2 className="mb-5 text-2xl font-semibold">Change password</h2><form onSubmit={password} className="grid gap-5">{[{ name: 'currentPassword', label: 'Current password', auto: 'current-password' },{ name: 'newPassword', label: 'New password', auto: 'new-password' },{ name: 'confirmPassword', label: 'Confirm new password', auto: 'new-password' }].map(f => <label key={f.name} className="grid gap-2 text-sm font-medium">{f.label}<Input type="password" name={f.name} required minLength={f.name === 'currentPassword' ? 1 : 8} maxLength={72} autoComplete={f.auto} /></label>)}<Button disabled={busy} className="justify-self-start">Update password</Button></form></CardContent></Card></div>;
}
