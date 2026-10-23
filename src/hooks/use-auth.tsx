'use client';
import * as React from 'react';
import type { User } from '@/types/user';
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
      if (current) { localStorage.setItem('isLoggedIn','true'); localStorage.setItem('userProfile', JSON.stringify(current)); }
      else { localStorage.removeItem('isLoggedIn'); localStorage.removeItem('userProfile'); }
    } catch { setUser(null); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void login(); window.addEventListener('storage', login); return () => window.removeEventListener('storage', login); }, [login]);
  const logout = React.useCallback(async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (!response.ok) throw new Error('Could not sign out');
    setUser(null);
    for (const key of ['isLoggedIn','userProfile','userAddresses','userPaymentMethods']) localStorage.removeItem(key);
    sessionStorage.removeItem('selectedAddress');
    window.dispatchEvent(new Event('storage'));
    window.location.assign('/');
  }, []);
  return <AuthContext.Provider value={{ isLoggedIn: !!user, loading, user, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = React.useContext(AuthContext); if (!context) throw new Error('AuthProvider is required'); return context; }
