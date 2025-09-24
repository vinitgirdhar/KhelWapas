import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform product to match the expected format
    const transformedProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      type: product.type,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      grade: product.grade,
      image: Array.isArray(product.imageUrls) && product.imageUrls.length > 0 
        ? product.imageUrls[0] 
        : '/images/products/background.jpg',
      images: Array.isArray(product.imageUrls) ? product.imageUrls : [],
      dataAiHint: product.name.toLowerCase().split(' ').slice(0, 2).join(' '),
      badge: product.badge,
      description: product.description,
      specs: product.specs || {},
      status: product.isAvailable ? 'In Stock' : 'Out of Stock',
      listingDate: product.createdAt.toISOString().split('T')[0],
      sku: `KW-${product.category.substring(0, 2).toUpperCase()}-${product.id.substring(0, 3)}`
    }

    return NextResponse.json({
      success: true,
      product: transformedProduct
    })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update a product
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    let body: any = {}
    try {
      body = await request.json()
    } catch (e) {
      console.warn('[API] Empty or invalid JSON body for product update', { id: params.id })
    }
    console.log('[API] Raw update body received', { id: params.id, body })

    // Flexible URL validator: allow absolute http(s) OR leading slash relative paths
    const relativeOrAbsoluteUrl = z.string().refine(val => {
      if (!val) return false;
      if (val.startsWith('/')) return true; // allow relative path from public root
      try {
        const u = new URL(val);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    }, { message: 'image URL must be absolute http(s) or start with /' });

    // Validation schema (all fields optional; we only update provided ones)
    const schema = z.object({
      name: z.string().min(1).optional(),
      category: z.string().min(1).optional(),
      type: z.enum(['new', 'preowned']).optional(),
      price: z.coerce.number().nonnegative().optional(),
      originalPrice: z.coerce.number().nonnegative().nullable().optional(),
      description: z.string().optional(),
      isAvailable: z.boolean().optional(),
      imageUrls: z.array(relativeOrAbsoluteUrl).optional(),
      badge: z.string().nullable().optional(),
      grade: z.enum(['A', 'B', 'C', 'D']).nullable().optional(),
      specs: z.record(z.any()).optional(),
    })

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      console.warn('[API] Product update validation failed', {
        body,
        issues: parsed.error.flatten(),
      });
      return NextResponse.json(
        { success: false, message: 'Invalid payload', issues: parsed.error.flatten(), received: body },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Build prisma update data without undefined fields
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.category !== undefined) updateData.category = data.category
    if (data.type !== undefined) updateData.type = data.type
    if (data.price !== undefined) updateData.price = data.price
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice
    if (data.description !== undefined) updateData.description = data.description
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable
    if (data.imageUrls !== undefined) updateData.imageUrls = data.imageUrls
    if (data.badge !== undefined) updateData.badge = data.badge
    if (data.grade !== undefined) updateData.grade = data.grade
    if (data.specs !== undefined) updateData.specs = data.specs

    console.log('[API] Update product request', { id: params.id, updateData })

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    })

    console.log('[API] Product updated', { id: updated.id })

    // Transform to match frontend shape
    const transformedProduct = {
      id: updated.id,
      name: updated.name,
      category: updated.category,
      type: updated.type,
      price: Number(updated.price),
      originalPrice: updated.originalPrice ? Number(updated.originalPrice) : undefined,
      grade: updated.grade,
      image: Array.isArray(updated.imageUrls) && (updated.imageUrls as any).length > 0
        ? (updated.imageUrls as any)[0]
        : '/images/products/background.jpg',
      images: Array.isArray(updated.imageUrls) ? (updated.imageUrls as any) : [],
      dataAiHint: updated.name.toLowerCase().split(' ').slice(0, 2).join(' '),
      badge: updated.badge,
      description: updated.description,
      specs: (updated as any).specs || {},
      status: updated.isAvailable ? 'In Stock' : 'Out of Stock',
      listingDate: updated.createdAt.toISOString().split('T')[0],
      sku: `KW-${updated.category.substring(0, 2).toUpperCase()}-${updated.id.substring(0, 3)}`
    }

    return NextResponse.json({ success: true, product: transformedProduct })
  } catch (error: any) {
    console.error('Update product error:', error)
    // Handle not found separately
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
