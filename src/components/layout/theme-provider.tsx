'use client';

import { THEME_STORAGE_KEY } from '@/lib/theme';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ThemeContextValue = { isDark: boolean; setTheme: (theme: Theme) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const apply = useCallback((theme: Theme) => {
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    setIsDark(dark);
  }, []);
  useEffect(() => {
    const read = (): Theme => {
      try { const value = localStorage.getItem(THEME_STORAGE_KEY); return value === 'dark' || value === 'light' ? value : 'system'; }
      catch { return 'system'; }
    };
    const sync = () => apply(read());
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    sync();
    media.addEventListener('change', sync);
    const storage = (event: StorageEvent) => { if (event.key === THEME_STORAGE_KEY || event.key === null) sync(); };
    window.addEventListener('storage', storage);
    return () => { media.removeEventListener('change', sync); window.removeEventListener('storage', storage); };
  }, [apply]);
  const setTheme = useCallback((theme: Theme) => {
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* Theme still works when browser storage is unavailable. */ }
    apply(theme);
  }, [apply]);
  return <ThemeContext.Provider value={{ isDark, setTheme }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('ThemeProvider is required');
  return context;
}
