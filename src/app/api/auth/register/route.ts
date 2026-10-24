import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { apiError } from '@/lib/api';
import { emailSchema, passwordSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password } = z.object({ fullName: z.string().trim().min(2).max(100), email: emailSchema, password: passwordSchema }).parse(await request.json());
    await rateLimit('register', email, 5, 3600000);
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { fullName, email, passwordHash, role: 'user' } });
    const response = NextResponse.json({ success: true, user: { id: user.id, fullName, email, role: user.role } }, { status: 201 });
    response.headers.set('Set-Cookie', setAuthCookie(generateToken({ userId: user.id, email, role: user.role })));
    return response;
  } catch (error) { return apiError(error); }
}
