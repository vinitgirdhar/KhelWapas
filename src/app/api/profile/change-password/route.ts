import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireUser, verifyPassword, hashPassword, generateToken, setAuthCookie } from '@/server/auth';
import { apiError, ApiError } from '@/server/api';
import { passwordSchema } from '@/lib/validation';
import { rateLimit } from '@/server/rate-limit';
export async function POST(request: NextRequest) {
  try {
    const claims = await requireUser(request);
    await rateLimit('password', claims.userId, 5);
    const { currentPassword, newPassword } = z.object({ currentPassword: z.string().min(1).max(72), newPassword: passwordSchema }).parse(await request.json());
    const user = await prisma.user.findUniqueOrThrow({ where: { id: claims.userId } });
    if (!await verifyPassword(currentPassword, user.passwordHash)) throw new ApiError(400, 'Current password is incorrect');
    const updated = await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword), sessionVersion: { increment: 1 } } });
    const response = NextResponse.json({ success: true, message: 'Password updated; other sessions signed out' });
    response.headers.set('Set-Cookie', setAuthCookie(generateToken({ userId: user.id, email: user.email, role: user.role, sessionVersion: updated.sessionVersion })));
    return response;
  } catch (e) { return apiError(e); }
}
