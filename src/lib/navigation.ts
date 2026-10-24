/** Accept only same-origin paths from URL query parameters. Never decode twice. */
export function safeReturnPath(value: string | null | undefined, fallback = '/') {
  if (!value?.startsWith('/') || /[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const base = 'https://khelwapas.invalid';
    const url = new URL(value, base);
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch { return fallback; }
}
