import { NextRequest, NextResponse } from 'next/server';
import { backendOrigin } from '@/lib/deployment';
export function middleware(request: NextRequest) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const expected = new URL(process.env.APP_URL || request.url).origin;
    if ((origin && origin !== expected) || request.headers.get('sec-fetch-site') === 'cross-site') return NextResponse.json({ success: false, message: 'Cross-site request rejected' }, { status: 403 });
    const isUpload = ['/api/upload', '/api/manual-sell'].includes(request.nextUrl.pathname);
    const max = isUpload ? 32 * 1024 * 1024 : 1024 * 1024;
    if (Number(request.headers.get('content-length') || 0) > max) return NextResponse.json({ success: false, message: 'Request too large' }, { status: 413 });
  }
  let response: NextResponse;
  if (process.env.DEPLOYMENT_ROLE === 'frontend' && request.nextUrl.pathname !== '/api/backend-status') {
    const destination = backendOrigin(process.env.BACKEND_ORIGIN);
    if (!destination) return NextResponse.json({ success: false, message: 'The marketplace connection is not configured' }, { status: 503 });
    response = NextResponse.rewrite(new URL(request.nextUrl.pathname + request.nextUrl.search, destination));
  } else response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}
export const config = { matcher: ['/api/:path*', '/uploads/:path*'] };
