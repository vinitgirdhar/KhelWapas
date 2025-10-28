import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Simple in-memory rate limiter (per server instance)
const uploadRateLimiter = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting per IP: max 20 uploads per 5 min
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'local';
    const now = Date.now();
    const windowMs = 5 * 60 * 1000;
    const entry = uploadRateLimiter.get(ip);
    if (!entry || now > entry.resetAt) {
      uploadRateLimiter.set(ip, { count: 1, resetAt: now + windowMs });
    } else {
      if (entry.count >= 20) {
        return NextResponse.json({ success: false, message: 'Too many upload requests. Please try again later.' }, { status: 429 });
      }
      entry.count++;
    }

    const formData = await request.formData();
    const type = (formData.get('type') as string) || 'product';

    // Accept both multiple 'files' and a single 'file'
    let files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    if ((!files || files.length === 0) && singleFile) {
      files = [singleFile];
    }
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    // Select target directory based on type
    const subdir = type === 'profile' ? 'profile' : 'products';
    const uploadDir = join(
      process.cwd(),
      'public',
      'uploads',
      subdir
    );
    
    // Create upload directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

  const uploadedFiles: string[] = [];

    for (const file of files) {
      // Validate file type and size
      if (!file.type?.startsWith('image/')) {
        continue; // Skip non-image files
      }
      // Strict whitelist by extension
      const allowedExt = ['jpg','jpeg','png','gif','webp'];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !allowedExt.includes(extension)) {
        continue;
      }
      // Size limits: 5MB for profile, 10MB otherwise
      const maxSize = type === 'profile' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
      if (typeof file.size === 'number' && file.size > maxSize) {
        return NextResponse.json(
          { success: false, message: `File too large. Max ${maxSize / (1024 * 1024)}MB` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
  const filename = `${timestamp}-${randomString}.${extension}`;
      const filepath = join(uploadDir, filename);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filepath, buffer);
      
  // Return the public URL path
  const publicUrl = `/uploads/${subdir}/${filename}`;
      uploadedFiles.push(publicUrl);
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid image files provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      // For convenience, provide single url when only one file is uploaded
      url: uploadedFiles[0] || null,
      message: `${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'} uploaded successfully`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
