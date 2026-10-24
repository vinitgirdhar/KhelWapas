import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/server/auth';
import { apiError } from '@/server/api';
export async function POST(request: NextRequest) {
  try { await requireUser(request, true); return NextResponse.json({ success: false, message: 'Email delivery is not connected in this prototype. Open and print the invoice instead.' }, { status: 501 }); } catch (e) { return apiError(e); }
}
