import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';
import { storeImages } from '@/lib/uploads';
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    await rateLimit('uploads', user.userId, 20, 300000);
    const form = await request.formData();
    const files = form.getAll('files').length ? form.getAll('files') : form.getAll('file');
    const images = await storeImages(files, form.get('type') === 'profile' ? 'profile' : 'products');
    return NextResponse.json({ success: true, files: images, url: images[0] });
  } catch (e) { return apiError(e); }
}
