import { NextRequest, NextResponse } from 'next/server';
import { addressDAL } from '@/lib/dal';

// GET /api/profile/addresses - Get user addresses
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const addresses = addressDAL.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/profile/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const addressData = await request.json();
    const { userId, title, fullName, phone, street, city, state, postalCode, country = 'India', isDefault } = addressData;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // If this is set as default, unset all other default addresses for this user
    if (isDefault) {
      addressDAL.updateMany(
        { userId, isDefault: 1 },
        { isDefault: 0 }
      );
    }

    const newAddress = addressDAL.create({
        userId,
        title,
        fullName,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: isDefault ? 1 : 0,
      }
    );

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
