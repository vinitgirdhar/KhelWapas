'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type AdminUser = { id: string; fullName: string; email: string; role: 'user' | 'admin'; status: 'Active' | 'Blocked' | 'Pending'; createdAt: string; _count: { orders: number; sellRequests: number } };
const statusClass = { Active: 'border-green-200 bg-green-100 text-green-800', Blocked: 'border-red-200 bg-red-100 text-red-800', Pending: 'border-yellow-200 bg-yellow-100 text-yellow-800' };
export default function AdminUsersPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: '20', q: query.trim(), ...(role ? { role } : {}) });
        const response = await fetch(`/api/admin/users?${params}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Could not load users');
        setUsers(result.users); setPagination(result.pagination);
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Could not load users'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, role, page, refresh]);
  async function updateStatus() {
    if (!selected || busy) return;
    const nextStatus = selected.status === 'Blocked' ? 'Active' : 'Blocked';
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/users/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not update user');
      setUsers(previous => previous.map(user => user.id === selected.id ? { ...user, status: result.user.status } : user));
      setSelected(null); toast({ title: nextStatus === 'Blocked' ? 'User blocked' : 'User unblocked' });
    } catch (e) { toast({ title: e instanceof Error ? e.message : 'Could not update user', variant: 'destructive' }); }
    finally { setBusy(false); }
  }
  return <main className="min-w-0 flex-1 space-y-4 p-4 sm:px-6 sm:py-0">
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative min-w-0 flex-1 basis-48"><span className="sr-only">Search users</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Search name or email…" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} className="h-11 bg-card pl-9" /></label>
      <label><span className="sr-only">Account role</span><select value={role} onChange={event => { setRole(event.target.value); setPage(1); }} className="h-11 rounded-xl border bg-card px-3 text-sm"><option value="">All accounts</option><option value="user">Users</option><option value="admin">Admins</option></select></label>
    </div>
    <Card className="min-w-0"><CardHeader><CardTitle>User accounts</CardTitle><CardDescription>Users can both buy and sell gear. Manage access and account details here.</CardDescription></CardHeader><CardContent className="min-w-0">
      {error ? <div role="alert" className="space-y-3 py-6"><p>{error}</p><Button variant="outline" onClick={() => setRefresh(value => value + 1)}>Try again</Button></div> : loading ? <p role="status" className="py-8 text-center text-muted-foreground">Loading users…</p> : <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Role</TableHead><TableHead className="hidden md:table-cell">Activity</TableHead><TableHead className="hidden md:table-cell">Joined</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>
        {users.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No accounts match your search.</TableCell></TableRow>}
        {users.map(user => <TableRow key={user.id}><TableCell className="min-w-40 max-w-72 whitespace-normal break-words"><p className="font-medium">{user.fullName}</p><p className="mt-1 text-xs text-muted-foreground">{user.email}</p></TableCell><TableCell><Badge variant="outline" className={statusClass[user.status]}>{user.status}</Badge></TableCell><TableCell>{user.role === 'admin' ? 'Admin' : 'User'}</TableCell><TableCell className="hidden md:table-cell">{user._count.orders} orders · {user._count.sellRequests} sell requests</TableCell><TableCell className="hidden md:table-cell">{new Date(user.createdAt).toLocaleDateString('en-IN')}</TableCell><TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${user.fullName}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link href={`/admin/users/${user.id}`}>View account</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href={`/admin/users/${user.id}/edit`}>Edit account</Link></DropdownMenuItem><DropdownMenuItem onClick={() => setSelected(user)} className={user.status === 'Blocked' ? undefined : 'text-destructive'}>{user.status === 'Blocked' ? 'Unblock user' : 'Block user'}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}
      </TableBody></Table>}
    </CardContent>{!loading && !error && <CardFooter className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{pagination.total === 0 ? '0 accounts' : `${(page - 1) * pagination.limit + 1}–${Math.min(page * pagination.limit, pagination.total)} of ${pagination.total} accounts`}</p><div className="flex gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><Button variant="outline" disabled={page >= pagination.pages} onClick={() => setPage(value => value + 1)}>Next</Button></div></CardFooter>}</Card>
    <AlertDialog open={!!selected} onOpenChange={open => { if (!open && !busy) setSelected(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{selected?.status === 'Blocked' ? 'Restore account access?' : 'Block this account?'}</AlertDialogTitle><AlertDialogDescription>{selected?.status === 'Blocked' ? `“${selected.fullName}” will regain access to their account.` : `“${selected?.fullName}” will be signed out and unable to sign in until you unblock them.`}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={event => { event.preventDefault(); void updateStatus(); }}>{busy ? 'Saving…' : selected?.status === 'Blocked' ? 'Unblock user' : 'Block user'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </main>;
}
