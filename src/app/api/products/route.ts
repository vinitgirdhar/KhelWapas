import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { serializeProduct } from '@/lib/products';
import { apiError, pagination } from '@/lib/api';
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams, { page, limit, skip } = pagination(params);
    const type = z.enum(['new','preowned']).optional().parse(params.get('type') || undefined);
    const query = z.string().trim().max(100).parse(params.get('q') || '');
    const category = z.string().max(60).parse(params.get('category') || '');
    const grade = z.enum(['A','B','C','D']).optional().parse(params.get('grade') || undefined);
    const minPrice = z.coerce.number().finite().min(0).parse(params.get('minPrice') || 0);
    const maxPrice = z.coerce.number().finite().min(minPrice).max(10000000).parse(params.get('maxPrice') || 10000000);
    const sort = z.enum(['newest','price-asc','price-desc']).parse(params.get('sort') || 'newest');
    const where: Prisma.ProductWhereInput = { ...(type ? { type } : {}), ...(category ? { category } : {}), ...(grade ? { grade } : {}), price: { gte: minPrice, lte: maxPrice }, ...(params.get('available') === 'true' ? { isAvailable: true, stock: { gt: 0 } } : {}), ...(query ? { OR: [{ name: { contains: query } }, { description: { contains: query } }, { category: { contains: query } }] } : {}) };
    const [products, total, categories] = await prisma.$transaction([
      prisma.product.findMany({ where, take: limit, skip, orderBy: sort === 'newest' ? [{ createdAt: 'desc' }, { id: 'asc' }] : [{ price: sort === 'price-asc' ? 'asc' : 'desc' }, { id: 'asc' }] }),
      prisma.product.count({ where }),
      prisma.product.groupBy({ by: ['category'], where: { ...(type ? { type } : {}), isAvailable: true, stock: { gt: 0 } }, orderBy: { category: 'asc' } }),
    ]);
    return NextResponse.json({ success: true, products: products.map(serializeProduct), pagination: { page, limit, total, pages: Math.ceil(total / limit) }, categories: categories.map(c => c.category) });
  } catch(e) { return apiError(e); }
}
