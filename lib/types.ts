// User and Authentication Types
export interface User {
  id: string;
  customerId: string;
  name: string;
  email: string;
  mobile?: string;
  accountNumber?: string;
  address?: string;
  kycStatus?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile?: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
}

// Account and Balance Types
export interface Account {
  accountNumber: string;
  accountType: string;
  balance: number;
  branch?: string;
  ifsc?: string;
  openedDate?: string;
  status?: string;
}

export interface Balance {
  accountNumber: string;
  balance: number;
  type: string;
}

// Transaction Types
export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export interface Transaction {
  transactionId: string;
  accountNumber: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  timestamp: string;
  description?: string;
  category?: string;
}

export interface TransactionFilter {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalTransactions: number;
    limit: number;
    hasMore: boolean;
  };
}

// OTP Types
export interface OTPRequest {
  customerId: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    otp: string;
    expiresIn: string;
  };
}

export interface OTPValidation {
  otp: string;
  amount: number;
}

// Transfer Types
export interface TransferRequest {
  amount: number;
  toAccount?: string;
  description?: string;
}

export interface TransferResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    amount: number;
    updatedBalance: number;
    timestamp: string;
  };
}

// Cheque Types
export type ChequeStatus = 'Processing' | 'Cleared' | 'Bounced' | 'Cancelled';

export interface Cheque {
  chequeNumber: string;
  accountNumber: string;
  amount: number;
  status: ChequeStatus;
  expectedClearanceDate: string;
  createdAt?: string;
}

export interface ChequeDepositRequest {
  amount: number;
}

// Statement Types
export interface StatementRequest {
  startDate?: string;
  endDate?: string;
}

export interface StatementResponse {
  accountNumber: string;
  accountType: string;
  currentBalance: number;
  statementPeriod: {
    from: string;
    to: string;
  };
  summary: {
    openingBalance: number;
    totalCredits: number;
    totalDebits: number;
    closingBalance: number;
    transactionCount: number;
  };
  transactions: Transaction[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  limit?: number;
  page?: number;
}

// Profile Update Types
export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  mobile?: string;
  address?: string;
}

// Dispute Types
export interface Dispute {
  id: string;
  transactionId: string;
  accountNumber: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface DisputeCreateRequest {
  transactionId: string;
  description: string;
  reason: string;
}
