'use client';
import { useState, useEffect, useRef } from 'react';
/** SSR starts from the same value; hydrate before persisting to avoid losing a saved bag. */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const initial = useRef(initialValue);
  const [value, setValue] = useState<T>(initial.current), [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(key); setValue(raw ? JSON.parse(raw) : initial.current); } catch { setValue(initial.current); }
    setHydrated(true);
  }, [key]);
  useEffect(() => { if (hydrated) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage can be disabled by the browser. */ } } }, [key, value, hydrated]);
  return [value, setValue] as const;
}
