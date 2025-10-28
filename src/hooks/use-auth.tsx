'use client';

import * as React from 'react';

export type AuthContextType = {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  // Simple localStorage-backed auth flag to match current Header behavior
  React.useEffect(() => {
    const flag = typeof window !== 'undefined' && window.localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(flag);
  }, []);

  const login = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('isLoggedIn', 'true');
    }
    setIsLoggedIn(true);
  }, []);

  const logout = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('isLoggedIn');
    }
    setIsLoggedIn(false);
  }, []);

  const value = React.useMemo(() => ({ isLoggedIn, login, logout }), [isLoggedIn, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
