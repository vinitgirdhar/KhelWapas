import { NextRequest, NextResponse } from 'next/server'
import { productDAL } from '@/lib/dal'
import { z } from 'zod'
import { normalizeMany } from '@/lib/image'
import { cache } from '@/lib/cache'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const product = productDAL.findUnique({ id: params.id })

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform product - no file existence check for performance
    const imageUrlsArray = typeof product.imageUrls === 'string' ? JSON.parse(product.imageUrls) : product.imageUrls;
    const imgs = Array.isArray(imageUrlsArray) ? normalizeMany(imageUrlsArray as any) : []
    
    const transformedProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      type: product.type,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      grade: product.grade,
      image: imgs[0] || '/images/products/background.jpg',
      images: imgs,
      dataAiHint: product.name.toLowerCase().split(' ').slice(0, 2).join(' '),
      badge: product.badge,
      description: product.description,
      specs: product.specs ? (typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs) : {},
      status: product.isAvailable ? 'In Stock' : 'Out of Stock',
      listingDate: product.createdAt.split('T')[0],
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

    // Build update data without undefined fields
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.category !== undefined) updateData.category = data.category
    if (data.type !== undefined) updateData.type = data.type
    if (data.price !== undefined) updateData.price = data.price.toString()
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice?.toString() || null
    if (data.description !== undefined) updateData.description = data.description
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable ? 1 : 0
    if (data.imageUrls !== undefined) updateData.imageUrls = JSON.stringify(data.imageUrls)
    if (data.badge !== undefined) updateData.badge = data.badge
    if (data.grade !== undefined) updateData.grade = data.grade
    if (data.specs !== undefined) updateData.specs = JSON.stringify(data.specs)

    console.log('[API] Update product request', { id: params.id, updateData })

    const updated = productDAL.update({ id: params.id }, updateData)

    console.log('[API] Product updated', { id: updated.id })

    // Invalidate product cache since product was modified
    cache.invalidatePattern('products:')
    console.log('[API] Product cache invalidated')

    // Transform to match frontend shape - no file existence check
    const imageUrlsArray2 = typeof updated.imageUrls === 'string' ? JSON.parse(updated.imageUrls) : updated.imageUrls;
    const imgs2 = Array.isArray(imageUrlsArray2) ? normalizeMany(imageUrlsArray2 as any) : []
    
    const transformedProduct = {
      id: updated.id,
      name: updated.name,
      category: updated.category,
      type: updated.type,
      price: Number(updated.price),
      originalPrice: updated.originalPrice ? Number(updated.originalPrice) : undefined,
      grade: updated.grade,
      image: imgs2[0] || '/images/products/background.jpg',
      images: imgs2,
      dataAiHint: updated.name.toLowerCase().split(' ').slice(0, 2).join(' '),
      badge: updated.badge,
      description: updated.description,
      specs: updated.specs ? (typeof updated.specs === 'string' ? JSON.parse(updated.specs) : updated.specs) : {},
      status: updated.isAvailable ? 'In Stock' : 'Out of Stock',
      listingDate: updated.createdAt.split('T')[0],
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
