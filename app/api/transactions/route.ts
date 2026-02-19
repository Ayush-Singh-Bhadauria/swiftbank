import { NextRequest, NextResponse } from 'next/server';
import { getTransactions } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
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

    // Get account number from query params if provided
    const { searchParams } = new URL(request.url);
    const accountNumber = searchParams.get('accountNumber') || undefined;

    // Call bankmock API to get transactions
    const response = await getTransactions(token, accountNumber);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.message || 'Failed to get transactions',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
      },
      { status: 500 }
    );
  }
}
