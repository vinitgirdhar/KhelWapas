/** The API destination is server configuration, never a URL supplied by a client. */
export function backendOrigin(value: string | undefined) {
  if (!value) return null;
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('BACKEND_ORIGIN must be an HTTP(S) origin without a path or credentials');
  }
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('BACKEND_ORIGIN must use HTTPS in production');
  return url.origin;
}
