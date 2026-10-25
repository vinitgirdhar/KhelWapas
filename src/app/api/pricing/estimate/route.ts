import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/server/auth';
import { apiError } from '@/server/api';
import { estimateResalePrice } from '@/server/pricing/estimate-resale-price';

export async function POST(request: NextRequest) {
  try {
    await requireUser(request);
    const estimate = await estimateResalePrice(await request.json());
    return NextResponse.json({ success: true, estimate });
  } catch (error) { return apiError(error); }
}
