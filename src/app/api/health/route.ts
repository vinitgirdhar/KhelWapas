import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ready: true, service: 'khelwapas-api' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ ready: false, service: 'khelwapas-api' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
