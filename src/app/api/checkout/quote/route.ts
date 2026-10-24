import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/server/auth';
import { prisma } from '@/server/db';
import { quoteSchema, quoteCheckout } from '@/server/marketplace/orders';
import { apiError } from '@/server/api';
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request), input = quoteSchema.parse(await request.json());
    const quote = await prisma.$transaction(tx => quoteCheckout(tx, user.userId, input));
    return NextResponse.json({ success: true, quote });
  } catch(e) { return apiError(e); }
}
