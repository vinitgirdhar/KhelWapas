/** Match SQLite's default search behavior when the cloud uses PostgreSQL. */
export function containsText(value: string) {
  if (/^postgres(?:ql)?:/.test(process.env.DATABASE_URL || '')) return { contains: value, mode: 'insensitive' as const };
  return { contains: value };
}
