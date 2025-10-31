import { NextRequest, NextResponse } from 'next/server';
import { sellRequestDAL } from '@/lib/dal';
import { getCurrentUser } from '@/lib/auth';
import { join } from 'path';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Authentication required', success: false },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const category = formData.get('category') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const contactMethod = formData.get('contactMethod') as 'Email' | 'Phone' | 'WhatsApp';
    const contactDetail = formData.get('contactDetail') as string;
  const images = formData.getAll('images') as File[];

    // Validate required fields
    if (!fullName || !email || !category || !title || !description || !price || !contactMethod) {
      return NextResponse.json(
        { message: 'All required fields must be filled', success: false },
        { status: 400 }
      );
    }

    if (images.length < 5) {
      return NextResponse.json(
        { message: 'At least 5 images are required.', success: false },
        { status: 400 }
      );
    }

    // Save images locally like upload route does
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const allowedExt = ['jpg','jpeg','png','gif','webp'];
    const uploaded: string[] = [];
    for (const img of images) {
      if (!(img instanceof File)) continue;
      if (!img.type?.startsWith('image/')) continue;
      const ext = img.name.split('.').pop()?.toLowerCase();
      if (!ext || !allowedExt.includes(ext)) continue;
      if (typeof img.size === 'number' && img.size > 10 * 1024 * 1024) continue;
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).slice(2, 10);
      const filename = `${timestamp}-${randomString}.${ext}`;
      const filepath = join(uploadDir, filename);
      const bytes = await img.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
      uploaded.push(`/uploads/products/${filename}`);
    }

    if (uploaded.length < 5) {
      return NextResponse.json(
        { message: 'At least 5 valid images are required.', success: false },
        { status: 400 }
      );
    }
    const imageUrls = uploaded;

    // Create sell request in database
    const sellRequest = sellRequestDAL.create({
      userId: currentUser.userId,
      fullName,
      email,
      category,
      title,
      description,
      price: price.toString(),
      contactMethod,
      contactDetail,
      imageUrls: JSON.stringify(imageUrls), // Store as JSON string
      status: 'Pending',
    });

    return NextResponse.json({
      message: 'Sell request submitted successfully!',
      success: true,
      sellRequest: {
        id: sellRequest.id,
        title: sellRequest.title,
        status: sellRequest.status
      }
    }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'An error occurred while submitting the form.', success: false },
      { status: 500 }
    );
  }
}
