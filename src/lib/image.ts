// Utility helpers for normalizing and validating image URLs used for products
// Ensures consistent leading slash, prevents duplicated protocol, and restricts to allowed extensions.

const ALLOWED_EXT = ['jpg','jpeg','png','webp','gif'];

export function normalizeImageUrl(raw: string): string {
  if (!raw) return '';
  let url = raw.trim();
  // If it's a full http(s) URL just return as-is (basic sanity)
  if (/^https?:\/\//i.test(url)) return url;
  // Strip any accidental leading public/ or ./public/
  url = url.replace(/^\.?(?:\/)?public\//i, '/');
  // Ensure it starts with / for Next public assets or uploaded paths
  if (!url.startsWith('/')) url = '/' + url;
  // Collapse multiple slashes
  url = url.replace(/\/+/, '/');
  return url;
}

export function isAllowedImage(url: string): boolean {
  const lower = url.toLowerCase().split('?')[0].split('#')[0];
  const ext = lower.split('.').pop() || '';
  return ALLOWED_EXT.includes(ext);
}

export function normalizeMany(urls: string[] | undefined | null): string[] {
  if (!Array.isArray(urls)) return [];
  return urls.map(normalizeImageUrl).filter(u => !!u);
}
