import { NextRequest, NextResponse } from 'next/server';
import { addressDAL } from '@/lib/dal';

interface RouteParams {
  params: { id: string };
}

// PUT /api/profile/addresses/[id] - Update address
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const addressData = await request.json();
    const { userId, title, fullName, phone, street, city, state, postalCode, country, isDefault } = addressData;

    // Verify the address belongs to the user
    const existingAddress = addressDAL.findUnique({ id });

    if (!existingAddress || existingAddress.userId !== userId) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If this is set as default, unset all other default addresses for this user
    if (isDefault) {
      addressDAL.updateMany(
        { userId, isDefault: 1 },
        { isDefault: 0 }
      );
    }

    const updatedAddress = addressDAL.update({ id }, {
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

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/profile/addresses/[id] - Delete address
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify the address belongs to the user
    const existingAddress = addressDAL.findUnique({ id });

    if (!existingAddress || existingAddress.userId !== userId) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    addressDAL.delete({ id });

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
