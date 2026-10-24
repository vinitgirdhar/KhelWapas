import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { verifyPassword, generateToken, setAuthCookie } from '@/server/auth';
import { apiError, ApiError } from '@/server/api';
import { emailSchema } from '@/lib/validation';
import { rateLimit } from '@/server/rate-limit';
export async function POST(request: NextRequest) {
  try {
    const { email, password } = z.object({ email: emailSchema, password: z.string().min(1).max(72) }).parse(await request.json());
    await rateLimit('login', email, 12);
    const user = await prisma.user.findUnique({ where: { email } });
    const valid = await verifyPassword(password, user?.passwordHash ?? '$2b$12$S2pNhKpt4nTfIlXagJ3DmuVz4eYd4eDJGMMWpJOgaKOx1XLDqv4IW');
    if (!user || !valid || user.status !== 'Active') throw new ApiError(401, 'Invalid email or password');
    const token = generateToken({ userId: user.id, email: user.email, role: user.role, sessionVersion: user.sessionVersion });
    const response = NextResponse.json({ success: true, user: { id: user.id, fullName: user.fullName, name: user.fullName, email: user.email, role: user.role } });
    response.headers.set('Set-Cookie', setAuthCookie(token));
    return response;
  } catch (error) { return apiError(error); }
}
