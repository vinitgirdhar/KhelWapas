import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { requireUser } from '@/server/auth';
import { apiError } from '@/server/api';
import { rateLimit } from '@/server/rate-limit';
import { emailSchema } from '@/lib/validation';
import { storeImages, removeImages } from '@/server/uploads';
const schema = z.object({ fullName: z.string().trim().min(2).max(100), email: emailSchema, category: z.string().trim().min(2).max(60), title: z.string().trim().min(5).max(160), description: z.string().trim().min(20).max(10000), price: z.coerce.number().finite().positive().max(10000000).multipleOf(0.01), contactMethod: z.enum(['Email','Phone','WhatsApp']), contactDetail: z.string().max(100).optional() }).refine(v => v.contactMethod === 'Email' || !!v.contactDetail?.match(/^\+?[\d\s-]{10,16}$/), { message: 'Enter a valid contact number', path: ['contactDetail'] });
export async function POST(request: NextRequest) {
  let imageUrls: string[] = [];
  try {
    const user = await requireUser(request);
    await rateLimit('sell', user.userId, 10, 3600000);
    const form = await request.formData();
    const data = schema.parse(Object.fromEntries(form.entries()));
    imageUrls = await storeImages(form.getAll('images'), 'products', 3);
    const sellRequest = await prisma.sellRequest.create({ data: { ...data, userId: user.userId, imageUrls, status: 'Pending' } });
    return NextResponse.json({ success: true, message: 'Listing submitted for review', sellRequest: { id: sellRequest.id, title: sellRequest.title, status: sellRequest.status } }, { status: 201 });
  } catch (e) { await removeImages(imageUrls); return apiError(e); }
}
