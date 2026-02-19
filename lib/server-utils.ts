/**
 * Server-side utilities for calling BANKMOCK API
 * These functions should only be used in Next.js API routes (server-side)
 */

import {
  ApiResponse,
  User,
  Balance,
  Transaction,
  TransactionResponse,
  OTPResponse,
  TransferResponse,
  Cheque,
  StatementResponse,
  Account,
  PaginationParams,
} from './types';

const BANKMOCK_API_URL = process.env.BANKMOCK_API_URL || 'https://bankmock-theta.vercel.app';
const API_VERSION = 'v1';

/**
 * Helper function to make API calls to BANKMOCK
 */
async function callBankmockAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  customerId?: string
): Promise<ApiResponse<T>> {
  try {
    const url = `${BANKMOCK_API_URL}/api/${API_VERSION}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add customerId to headers if provided
    if (customerId) {
      headers['X-Customer-ID'] = customerId;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'API request failed',
        message: data.message,
      };
    }

    return {
      success: data.success !== false,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error('BANKMOCK API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Login with customer ID (mock authentication)
 * Note: BANKMOCK uses simple token-based auth for demo purposes
 */
export async function loginWithCustomerId(
  customerId: string,
  password: string
): Promise<ApiResponse<{ token: string; customer_id: string; name: string; email: string }>> {
  // For BANKMOCK, we simulate login by generating a token
  // In a real system, this would validate credentials
  return {
    success: true,
    data: {
      token: `TOKEN_${customerId}`,
      customer_id: customerId,
      name: 'Demo User',
      email: 'demo@example.com',
    },
  };
}

/**
 * Get customer profile
 */
export async function getCustomerProfile(token: string): Promise<ApiResponse<User>> {
  // Extract customerId from token (format: TOKEN_CUST001)
  const customerId = token.replace('TOKEN_', '');
  
  const response = await callBankmockAPI<{
    customerId: string;
    name: string;
    mobile: string;
    email: string;
    accountNumber: string;
  }>('/customer', {
    method: 'GET',
  }, customerId);

  if (!response.success || !response.data) {
    return {
      success: false,
      error: response.error || 'Failed to get customer profile',
    } as ApiResponse<User>;
  }

  // Transform to User type
  return {
    success: true,
    data: {
      id: response.data.customerId,
      customerId: response.data.customerId,
      name: response.data.name,
      email: response.data.email,
      mobile: response.data.mobile,
      accountNumber: response.data.accountNumber,
    },
  };
}

/**
 * Get account balance
 */
export async function getBalance(token: string): Promise<ApiResponse<Balance>> {
  const customerId = token.replace('TOKEN_', '');
  
  return await callBankmockAPI<Balance>('/balance', {
    method: 'GET',
  }, customerId);
}

/**
 * Get account details
 */
export async function getAccount(token: string): Promise<ApiResponse<Account>> {
  const customerId = token.replace('TOKEN_', '');
  
  const response = await callBankmockAPI<any>('/account', {
    method: 'GET',
  }, customerId);

  if (!response.success || !response.data) {
    return response;
  }

  return {
    success: true,
    data: {
      accountNumber: response.data.accountNumber,
      accountType: response.data.accountType,
      balance: response.data.balance,
      branch: response.data.branch,
      ifsc: response.data.ifsc,
      openedDate: response.data.openedDate,
      status: response.data.accountStatus,
    },
  };
}

/**
 * Get transactions with pagination
 */
export async function getTransactions(
  token: string,
  params?: PaginationParams
): Promise<ApiResponse<TransactionResponse>> {
  const customerId = token.replace('TOKEN_', '');
  
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.page) queryParams.append('page', params.page.toString());
  
  const endpoint = `/transactions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  return await callBankmockAPI<TransactionResponse>(endpoint, {
    method: 'GET',
  }, customerId);
}

/**
 * Get account statement for date range
 */
export async function getStatement(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<StatementResponse>> {
  const customerId = token.replace('TOKEN_', '');
  
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  const endpoint = `/statement${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  return await callBankmockAPI<StatementResponse>(endpoint, {
    method: 'GET',
  }, customerId);
}

/**
 * Generate OTP for transaction
 */
export async function generateOTP(token: string): Promise<ApiResponse<OTPResponse>> {
  const customerId = token.replace('TOKEN_', '');
  
  return await callBankmockAPI<OTPResponse>('/generate-otp', {
    method: 'POST',
    body: JSON.stringify({}),
  }, customerId);
}

/**
 * Initiate fund transfer
 */
export async function initiateTransfer(
  token: string,
  amount: number
): Promise<ApiResponse<{ amount: number; currentBalance: number; note: string }>> {
  const customerId = token.replace('TOKEN_', '');
  
  return await callBankmockAPI('/transfer', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }, customerId);
}

/**
 * Validate OTP and complete transfer
 */
export async function validateOTPAndTransfer(
  token: string,
  otp: string,
  amount: number
): Promise<ApiResponse<TransferResponse>> {
  const customerId = token.replace('TOKEN_', '');
  
  return await callBankmockAPI<TransferResponse>('/validate-otp', {
    method: 'POST',
    body: JSON.stringify({ otp, amount }),
  }, customerId);
}

/**
 * Deposit a cheque
 */
export async function depositCheque(
  token: string,
  amount: number
): Promise<ApiResponse<Cheque>> {
  const customerId = token.replace('TOKEN_', '');
  
  return await callBankmockAPI<Cheque>('/deposit-cheque', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }, customerId);
}

/**
 * Get cheque status
 */
export async function getChequeStatus(
  token: string,
  chequeNumber: string
): Promise<ApiResponse<Cheque>> {
  const customerId = token.replace('TOKEN_', '');
  
  return await callBankmockAPI<Cheque>(`/cheque/${chequeNumber}`, {
    method: 'GET',
  }, customerId);
}
