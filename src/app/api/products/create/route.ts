import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeMany } from '@/lib/image';
import { cache } from '@/lib/cache';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['new', 'preowned']),
  price: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive().optional(),
  description: z.string().min(1, 'Description is required'),
  imageUrls: z.array(z.string()).optional().default([]),
  badge: z.enum(['A', 'B', 'C', 'D']).optional(),
  grade: z.enum(['A', 'B', 'C', 'D']).optional(),
  specs: z.record(z.any()).optional(),
  isAvailable: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Product creation request received');
    
    const body = await request.json();
    console.log('[API] Request body:', body);
    
    // Validate input
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      console.log('[API] Validation failed:', validation.error.flatten());
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: validation.error.flatten() 
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    console.log('[API] Validated data:', data);

    // Create product in database
    console.log('[API] Attempting to create product in database...');
    const product = await prisma.product.create({
      data: {
        name: data.name,
        category: data.category,
        type: data.type,
        price: data.price,
        originalPrice: data.originalPrice,
        description: data.description,
        imageUrls: data.imageUrls || [],
        badge: data.badge,
        grade: data.grade,
        specs: data.specs || {},
        isAvailable: data.isAvailable,
      },
    });
    console.log('[API] Product created in database:', product.id);

    // Transform to match frontend format
    const normImages = Array.isArray(product.imageUrls) ? normalizeMany(product.imageUrls as any) : [];
    const transformedProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      type: product.type,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      grade: product.grade,
      image: normImages[0] || '/images/products/background.jpg',
      images: normImages,
      dataAiHint: product.name.toLowerCase().split(' ').slice(0, 2).join(' '),
      badge: product.badge,
      description: product.description,
      specs: product.specs || {},
      status: product.isAvailable ? 'In Stock' : 'Out of Stock',
      listingDate: product.createdAt.toISOString().split('T')[0],
      sku: `KW-${product.category.substring(0, 2).toUpperCase()}-${product.id.substring(0, 3)}`
    };

    console.log('[API] Product created successfully:', { id: product.id, name: product.name });

    // Invalidate product cache since new product was added
    cache.invalidatePattern('products:')
    console.log('[API] Product cache invalidated')

    return NextResponse.json({
      success: true,
      product: transformedProduct,
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}
