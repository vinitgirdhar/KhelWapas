import { prisma } from '@/server/db';
import { isStoredUploadPath } from '@/server/uploads';

export const runtime = 'nodejs';

type Context = { params: Promise<{ kind: string; filename: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { kind, filename } = await params;
  const path = `/uploads/${kind}/${filename}`;
  if (process.env.UPLOAD_STORAGE !== 'database' || !isStoredUploadPath(path)) {
    return new Response('Not found', { status: 404 });
  }
  const asset = await prisma.uploadAsset.findUnique({ where: { path } });
  if (!asset) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(asset.contentBytes), {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(asset.contentBytes.byteLength),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
