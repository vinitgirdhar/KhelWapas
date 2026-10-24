'use client';

// Keep the current tab usable when privacy settings or quota block web storage.
// This memory fallback lasts only for the current page session.
const values = new Map<string, string | null>();
export function getSessionValue(key: string) {
  if (values.has(key)) return values.get(key) ?? null;
  try { return sessionStorage.getItem(key); } catch { return null; }
}
export function setSessionValue(key: string, value: string) {
  values.set(key, value);
  try { sessionStorage.setItem(key, value); } catch { /* Use the tab's memory copy. */ }
}
export function removeSessionValue(key: string) {
  values.set(key, null);
  try { sessionStorage.removeItem(key); } catch { /* The tab's memory copy is cleared. */ }
}
