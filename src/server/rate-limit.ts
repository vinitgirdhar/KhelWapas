import { createHash } from 'crypto';
import { prisma } from '@/server/db';
import { ApiError } from '@/server/api';
/** Database-backed limits work across app processes sharing the same database. */
export async function rateLimit(scope: string, identity: string, maximum: number, windowMs = 900000) {
  const now = Date.now(), bucket = Math.floor(now / windowMs);
  const key = createHash('sha256').update(`${scope}:${identity}:${bucket}`).digest('hex');
  const entry = await prisma.rateLimit.upsert({ where: { key }, create: { key, expiresAt: new Date((bucket + 1) * windowMs) }, update: { count: { increment: 1 } } });
  if (entry.count > maximum) throw new ApiError(429, 'Too many attempts. Please try again later.');
  // Bounded cleanup, independent of application memory.
  await prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date(now - windowMs) } } });
}
