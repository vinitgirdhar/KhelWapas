import { NextRequest, NextResponse } from 'next/server';
import { userDAL } from '@/lib/dal';
import bcrypt from 'bcryptjs';

// GET /api/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get userId from JWT token or session
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = userDAL.findUnique({ id: userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { userId, fullName, email, phone } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Validate email uniqueness if changed
    const existingUser = userDAL.findUnique({ email });

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const updatedUser = userDAL.update({ id: userId }, {
        fullName,
        email,
        phone,
      }
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
