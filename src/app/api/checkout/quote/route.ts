import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { quoteSchema, quoteCheckout } from '@/lib/orders';
import { apiError } from '@/lib/api';
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request), input = quoteSchema.parse(await request.json());
    const quote = await prisma.$transaction(tx => quoteCheckout(tx, user.userId, input));
    return NextResponse.json({ success: true, quote });
  } catch(e) { return apiError(e); }
}
