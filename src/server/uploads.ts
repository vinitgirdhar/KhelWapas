import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { ApiError } from '@/server/api';
import { prisma } from '@/server/db';

export function isStoredUploadPath(path: string) {
  return /^\/uploads\/(products|profile)\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i.test(path);
}

export async function storeImages(files: FormDataEntryValue[], kind: 'products' | 'profile', minimum = 1) {
  if (files.length < minimum || files.length > 10 || files.some(f => !(f instanceof File))) throw new ApiError(400, `Upload ${minimum}–10 images`);
  if (files.reduce((n, f) => n + (f as File).size, 0) > 25 * 1024 * 1024) throw new ApiError(413, 'Images must total less than 25 MB');
  // Decode and re-encode to discard metadata, scripts, and misleading MIME types.
  const buffers: Buffer[] = [];
  for (const value of files) {
    const file = value as File;
    if (file.size === 0 || file.size > 5 * 1024 * 1024 || !['image/jpeg','image/png','image/webp'].includes(file.type)) throw new ApiError(400, 'Use JPEG, PNG or WebP images up to 5 MB each');
    try {
      const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25000000, animated: false });
      const meta = await image.metadata();
      if (!['jpeg','png','webp'].includes(meta.format || '')) throw new Error('Unsupported format');
      buffers.push(await image.rotate().resize(1800,1800, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer());
    } catch { throw new ApiError(400, 'One of these images could not be read'); }
  }
  if (process.env.UPLOAD_STORAGE === 'database') {
    const assets = buffers.map(contentBytes => ({ path: `/uploads/${kind}/${randomUUID()}.webp`, contentBytes }));
    // Commit the whole batch or nothing, so a partial upload cannot leak assets.
    await prisma.$transaction(assets.map(asset => prisma.uploadAsset.create({ data: asset })));
    return assets.map(asset => asset.path);
  }
  const dir = join(process.cwd(), 'public', 'uploads', kind);
  await mkdir(dir, { recursive: true });
  const paths: string[] = [];
  try {
    for (const buffer of buffers) {
      const name = `${randomUUID()}.webp`;
      await writeFile(join(dir, name), buffer, { flag: 'wx' });
      paths.push(`/uploads/${kind}/${name}`);
    }
    return paths;
  } catch (e) { await removeImages(paths); throw e; }
}
export async function removeImages(paths: string[]) {
  const safe = paths.filter(isStoredUploadPath);
  if (process.env.UPLOAD_STORAGE === 'database') {
    if (safe.length) await prisma.uploadAsset.deleteMany({ where: { path: { in: safe } } });
    return;
  }
  await Promise.all(safe.map(p => unlink(join(process.cwd(), 'public', p)).catch(() => {})));
}
