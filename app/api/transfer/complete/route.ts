import { NextRequest, NextResponse } from 'next/server';
import { validateOTPAndTransfer } from '@/lib/server-utils';

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
    const { otp, amount } = body;

    // Validate input
    if (!otp || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: 'OTP and amount are required',
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid amount. Amount must be greater than 0.',
        },
        { status: 400 }
      );
    }

    // Call bankmock API to validate OTP and complete transfer
    const response = await validateOTPAndTransfer(token, otp, amount);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.message || 'Failed to complete transfer',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: response.message || 'Transfer completed successfully',
    });
  } catch (error) {
    console.error('Complete transfer error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
      },
      { status: 500 }
    );
  }
}
