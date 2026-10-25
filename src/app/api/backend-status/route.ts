import { NextResponse } from 'next/server';
import { backendOrigin } from '@/lib/deployment';

export const dynamic = 'force-dynamic';

/** Short probes let the CDN frontend display its own Render wake-up animation. */
export async function GET() {
  const headers = { 'Cache-Control': 'no-store', 'Retry-After': '4' };
  try {
    const origin = backendOrigin(process.env.BACKEND_ORIGIN);
    if (!origin) {
      const ready = process.env.DEPLOYMENT_ROLE !== 'frontend';
      return NextResponse.json({ ready }, { status: ready ? 200 : 503, headers });
    }
    const response = await fetch(`${origin}/api/health`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    // Render can return an HTML loading page with status 200 during spin-up.
    const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
    const ready = response.ok && data?.ready === true && data?.service === 'khelwapas-api';
    return NextResponse.json({ ready }, { status: ready ? 200 : 503, headers });
  } catch {
    return NextResponse.json({ ready: false }, { status: 503, headers });
  }
}
