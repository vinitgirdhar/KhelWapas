import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { prisma } from '../src/server/db';
import { removeImages, storeImages } from '../src/server/uploads';
import { GET } from '../src/app/uploads/[kind]/[filename]/route';

test.afterAll(() => prisma.$disconnect());

// The isolated browser runner supplies a disposable database for this real
// storage roundtrip. No fixtures or images are written to the prototype DB.
test('durable uploads persist and serve encoded WebP, then clean up safely', async () => {
  const previous = process.env.UPLOAD_STORAGE;
  process.env.UPLOAD_STORAGE = 'database';
  let paths: string[] = [];
  try {
    const bytes = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#19336c' } }).png().toBuffer();
    paths = await storeImages([new File([new Uint8Array(bytes)], 'equipment.png', { type: 'image/png' })], 'products');
    const path = paths[0], filename = path.split('/').at(-1)!;
    expect(await prisma.uploadAsset.findUnique({ where: { path } })).not.toBeNull();
    const context = { params: Promise.resolve({ kind: 'products', filename }) };
    const response = await GET(new Request(`http://localhost${path}`), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/webp');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('cache-control')).toContain('immutable');
    expect((await sharp(Buffer.from(await response.arrayBuffer())).metadata()).format).toBe('webp');
    await removeImages([path, '/uploads/products/../../protected.webp']);
    expect(await prisma.uploadAsset.findUnique({ where: { path } })).toBeNull();
    expect((await GET(new Request(`http://localhost${path}`), context)).status).toBe(404);
  } finally {
    await removeImages(paths);
    if (previous === undefined) delete process.env.UPLOAD_STORAGE; else process.env.UPLOAD_STORAGE = previous;
  }
});
