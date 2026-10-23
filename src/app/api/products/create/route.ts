import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { productSchema } from '@/lib/validation';
import { serializeProduct } from '@/lib/products';
import { apiError } from '@/lib/api';
export async function POST(request: NextRequest) {
  try {
    await requireUser(request, true);
    const data = productSchema.parse(await request.json());
    const product = await prisma.product.create({ data });
    return NextResponse.json({ success: true, product: serializeProduct(product) }, { status: 201 });
  } catch(e) { return apiError(e); }
}
