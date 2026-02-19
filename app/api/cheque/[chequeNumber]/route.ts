import { NextRequest, NextResponse } from 'next/server';
import { getChequeStatus } from '@/lib/server-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { chequeNumber: string } }
) {
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
    const { chequeNumber } = params;

    if (!chequeNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cheque number is required',
        },
        { status: 400 }
      );
    }

    // Call bankmock API to get cheque status
    const response = await getChequeStatus(token, chequeNumber);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.message || 'Failed to get cheque status',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Get cheque status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
      },
      { status: 500 }
    );
  }
}
