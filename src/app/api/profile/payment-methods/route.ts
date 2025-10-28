import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/profile/payment-methods - Get user payment methods
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 20 // Limit to 20 payment methods
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
      await prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const newPaymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        type,
        cardLast4,
        cardType,
        cardHolder,
        expiryMonth,
        expiryYear,
        upiId,
        nickname,
        isDefault,
      },
    });

    return NextResponse.json(newPaymentMethod, { status: 201 });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
