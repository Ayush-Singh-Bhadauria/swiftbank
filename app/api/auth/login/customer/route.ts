import { NextRequest, NextResponse } from 'next/server';
import { loginWithCustomerId } from '@/lib/server-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, password } = body;

    // Validate input
    if (!customerId || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide customer ID and password',
        },
        { status: 400 }
      );
    }

    // Call bankmock API to authenticate
    const response = await loginWithCustomerId(customerId, password);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.message || 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Return the token and customer data from bankmock
    return NextResponse.json({
      success: true,
      data: {
        token: response.data.token,
        user: {
          id: response.data.customer_id,
          customerId: response.data.customer_id,
          name: response.data.name,
          email: response.data.email,
        },
      },
    });
  } catch (error) {
    console.error('Login with customer ID error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Server error during login',
      },
      { status: 500 }
    );
  }
}
