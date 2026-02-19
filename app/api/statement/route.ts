import { NextRequest, NextResponse } from 'next/server';
import { getStatement } from '@/lib/server-utils';

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Call bankmock API to get statement
    const response = await getStatement(token, startDate, endDate);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.message || 'Failed to get statement',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Get statement error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
      },
      { status: 500 }
    );
  }
}
