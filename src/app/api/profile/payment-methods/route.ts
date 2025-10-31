import { NextRequest, NextResponse } from 'next/server';
import { paymentMethodDAL } from '@/lib/dal';

// GET /api/profile/payment-methods - Get user payment methods
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const paymentMethods = paymentMethodDAL.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/profile/payment-methods - Create new payment method
export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json();
    const { userId, type, cardLast4, cardType, cardHolder, expiryMonth, expiryYear, upiId, nickname, isDefault } = paymentData;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // If this is set as default, unset all other default payment methods for this user
    if (isDefault) {
      paymentMethodDAL.updateMany(
        { userId, isDefault: 1 },
        { isDefault: 0 }
      );
    }

    const newPaymentMethod = paymentMethodDAL.create({
        userId,
        type,
        cardLast4,
        cardType,
        cardHolder,
        expiryMonth,
        expiryYear,
        upiId,
        nickname,
        isDefault: isDefault ? 1 : 0,
      }
    );

    return NextResponse.json(newPaymentMethod, { status: 201 });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
