import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { apiError } from '@/server/api';
import { generateToken, getCurrentUser, setAuthCookie } from '@/server/auth';
import { createDemoVisitor } from '@/server/demo/fixtures';
import { rateLimit } from '@/server/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // A shared server-side bucket cannot be bypassed with a spoofed IP header.
    await rateLimit('demo-login', 'prototype', 120, 3600000);
    const current = await getCurrentUser(request);
    const existing = current?.role === 'user' && current.email === `demo-${current.userId}@visitors.khelwapas.invalid`
      ? await prisma.user.findUnique({ where: { id: current.userId } }) : null;
    const user = existing ?? await createDemoVisitor(prisma);
    const token = generateToken({ userId: user.id, email: user.email, role: 'user', sessionVersion: user.sessionVersion });
    const response = NextResponse.json({ success: true, demo: true, user: { id: user.id, fullName: user.fullName, name: user.fullName, email: user.email, role: 'user' } });
    response.headers.set('Set-Cookie', setAuthCookie(token));
    return response;
  } catch (error) { return apiError(error); }
}
