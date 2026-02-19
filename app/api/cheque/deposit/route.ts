import { NextRequest, NextResponse } from 'next/server';
import { depositCheque } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'No authorization token provided',
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const body = await request.json();
    const { amount } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid amount. Amount must be greater than 0.',
        },
        { status: 400 }
      );
    }

    // Call bankmock API to deposit cheque
    const response = await depositCheque(token, amount);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.message || 'Failed to deposit cheque',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: response.message || 'Cheque deposited successfully',
    });
  } catch (error) {
    console.error('Deposit cheque error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
      },
      { status: 500 }
    );
  }
}
