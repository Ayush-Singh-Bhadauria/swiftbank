import { NextRequest, NextResponse } from 'next/server';
import { generateOTP } from '@/lib/server-utils';

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

    // Call bankmock API to generate OTP
    const response = await generateOTP(token);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.message || 'Failed to generate OTP',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: response.message,
    });
  } catch (error) {
    console.error('Generate OTP error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
      },
      { status: 500 }
    );
  }
}
