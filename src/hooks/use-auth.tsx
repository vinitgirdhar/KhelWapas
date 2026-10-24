'use client';
import * as React from 'react';
import type { User } from '@/types/user';
import { toast } from './use-toast';
import { removeSessionValue } from '@/lib/session-storage';
type Auth = { isLoggedIn: boolean; loading: boolean; user: User | null; login: () => Promise<void>; logout: () => Promise<void> };
const AuthContext = React.createContext<Auth | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const login = React.useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await response.json();
      const current = response.ok && data.success ? data.user : null;
      setUser(current);
      // Storage is a cross-tab notification, never the source of authentication.
      try {
        if (current) { localStorage.setItem('isLoggedIn','true'); localStorage.setItem('userProfile', JSON.stringify(current)); }
        else { localStorage.removeItem('isLoggedIn'); localStorage.removeItem('userProfile'); }
      } catch { /* A valid cookie session also works with browser storage blocked. */ }
    } catch { setUser(null); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void login(); window.addEventListener('storage', login); return () => window.removeEventListener('storage', login); }, [login]);
  const logout = React.useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Could not sign out. Please try again.');
      setUser(null);
      try {
        for (const key of ['isLoggedIn','userProfile','userAddresses','userPaymentMethods']) localStorage.removeItem(key);
      } catch { /* Cookie removal succeeded even when browser storage is blocked. */ }
      for (const key of ['selectedAddress','checkoutKey','checkoutPayload','postLoginPurchaseIntent']) removeSessionValue(key);
      window.dispatchEvent(new Event('storage'));
      window.location.assign('/');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Sign out failed', description: error instanceof Error ? error.message : 'Please try again.' });
    }
  }, []);
  return <AuthContext.Provider value={{ isLoggedIn: !!user, loading, user, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = React.useContext(AuthContext); if (!context) throw new Error('AuthProvider is required'); return context; }
