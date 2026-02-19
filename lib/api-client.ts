/**
 * Client-side API client for calling Next.js API routes
 * These functions are used in React components
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
  TransferRequest,
  ChequeDepositRequest,
} from './types';

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Standardized API call helper
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Request failed',
      };
    }

    return {
      success: data.success !== false,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Authentication APIs
 */
export const apiClient = {
  /**
   * Login with email/username and password
   */
  login: async (
    identifier: string,
    password: string
  ): Promise<ApiResponse<{ token: string; user: User }>> => {
    return await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  /**
   * Login with customer ID
   */
  loginWithCustomerId: async (
    customerId: string,
    password: string
  ): Promise<ApiResponse<{ token: string; user: User }>> => {
    return await apiCall('/api/auth/login/customer', {
      method: 'POST',
      body: JSON.stringify({ customerId, password }),
    });
  },

  /**
   * Register new user
   */
  register: async (data: {
    name: string;
    email: string;
    password: string;
    mobile?: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> => {
    return await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    return await apiCall('/api/profile', {
      method: 'GET',
    });
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return await apiCall('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Account & Balance APIs
   */

  /**
   * Get account balance
   */
  getBalance: async (): Promise<ApiResponse<Balance>> => {
    return await apiCall('/api/balance', {
      method: 'GET',
    });
  },

  /**
   * Get account details
   */
  getAccount: async (): Promise<ApiResponse<Account>> => {
    return await apiCall('/api/account', {
      method: 'GET',
    });
  },

  /**
   * Transaction APIs
   */

  /**
   * Get transactions with optional pagination
   */
  getTransactions: async (
    params?: PaginationParams
  ): Promise<ApiResponse<Transaction[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const endpoint = `/api/transactions${
      queryParams.toString() ? '?' + queryParams.toString() : ''
    }`;

    const response = await apiCall<TransactionResponse>(endpoint, {
      method: 'GET',
    });

    // Extract transactions from response
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.transactions,
      };
    }

    return response as any;
  },

  /**
   * Get account statement
   */
  getStatement: async (
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<StatementResponse>> => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const endpoint = `/api/statement${
      queryParams.toString() ? '?' + queryParams.toString() : ''
    }`;

    return await apiCall(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Transfer & OTP APIs
   */

  /**
   * Generate OTP for transaction
   */
  generateOTP: async (): Promise<ApiResponse<OTPResponse>> => {
    return await apiCall('/api/otp/generate', {
      method: 'POST',
    });
  },

  /**
   * Initiate fund transfer (requires OTP)
   */
  initiateTransfer: async (
    amount: number
  ): Promise<ApiResponse<{ amount: number; currentBalance: number; note: string }>> => {
    return await apiCall('/api/transfer/initiate', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  /**
   * Complete transfer with OTP validation
   */
  completeTransfer: async (
    otp: string,
    amount: number
  ): Promise<ApiResponse<TransferResponse>> => {
    return await apiCall('/api/transfer/complete', {
      method: 'POST',
      body: JSON.stringify({ otp, amount }),
    });
  },

  /**
   * Cheque APIs
   */

  /**
   * Deposit a cheque
   */
  depositCheque: async (amount: number): Promise<ApiResponse<Cheque>> => {
    return await apiCall('/api/cheque/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  /**
   * Get cheque status
   */
  getChequeStatus: async (chequeNumber: string): Promise<ApiResponse<Cheque>> => {
    return await apiCall(`/api/cheque/${chequeNumber}`, {
      method: 'GET',
    });
  },

  /**
   * Get all cheques
   */
  getCheques: async (): Promise<ApiResponse<Cheque[]>> => {
    return await apiCall('/api/cheques', {
      method: 'GET',
    });
  },

  /**
   * Dispute APIs (if implemented)
   */

  /**
   * Create a dispute
   */
  createDispute: async (data: {
    transactionId: string;
    description: string;
    reason: string;
  }): Promise<ApiResponse<any>> => {
    return await apiCall('/api/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all disputes
   */
  getDisputes: async (): Promise<ApiResponse<any[]>> => {
    return await apiCall('/api/disputes', {
      method: 'GET',
    });
  },
};
