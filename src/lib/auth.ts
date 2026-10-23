import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import { ApiError } from './api';

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  return value;
}
export interface JWTPayload { userId: string; email: string; role: 'user' | 'admin'; sessionVersion?: number }
export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }
export function generateToken(payload: JWTPayload) {
  return jwt.sign({ ...payload, sessionVersion: payload.sessionVersion ?? 0 }, secret(), { expiresIn: '7d', algorithm: 'HS256', issuer: 'khelwapas', audience: 'khelwapas-web' });
}
export function verifyToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, secret(), { algorithms: ['HS256'], issuer: 'khelwapas', audience: 'khelwapas-web' });
    if (typeof payload === 'string' || typeof payload.userId !== 'string' || typeof payload.sessionVersion !== 'number') return null;
    return payload as JWTPayload;
  } catch { return null; }
}
export async function getCurrentUser(request?: NextRequest): Promise<JWTPayload | null> {
  const token = request ? request.cookies.get('auth-token')?.value : (await cookies()).get('auth-token')?.value;
  if (!token) return null;
  const claims = verifyToken(token);
  if (!claims) return null;
  const user = await prisma.user.findUnique({ where: { id: claims.userId }, select: { id: true, email: true, role: true, status: true, sessionVersion: true } });
  if (!user || user.status !== 'Active' || user.sessionVersion !== claims.sessionVersion) return null;
  return { userId: user.id, email: user.email, role: user.role, sessionVersion: user.sessionVersion };
}
export async function requireUser(request: NextRequest, admin = false) {
  const user = await getCurrentUser(request);
  if (!user) throw new ApiError(401, 'Please sign in to continue');
  if (admin && user.role !== 'admin') throw new ApiError(403, 'Admin access required');
  return user;
}
export function setAuthCookie(token: string) { return `auth-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`; }
export function clearAuthCookie() { return `auth-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`; }
