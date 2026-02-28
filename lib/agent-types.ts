// ─────────────────────────────────────────────────────────────────────────────
// Agent System Types
// Enterprise-grade, stateful, identity-aware agentic contact-center assistant
// ─────────────────────────────────────────────────────────────────────────────

// ── Identity ──────────────────────────────────────────────────────────────────
export interface CustomerIdentity {
  customerId: string;
  accountNumber: string;
  mobile: string;
  name: string;
}

// ── Intent ────────────────────────────────────────────────────────────────────
export type Intent =
  | 'GET_BALANCE'
  | 'GET_TRANSACTIONS'
  | 'GET_ACCOUNT'
  | 'GET_CHEQUE_STATUS'
  | 'UNLOCK_CARD'
  | 'BLOCK_CARD'
  | 'FILE_COMPLAINT'
  | 'CHECK_CASE_STATUS'
  | 'CLOSE_CASE'
  | 'ESCALATE'
  | 'PROVIDE_OTP'
  | 'PROVIDE_CHEQUE_NUMBER'
  | 'GREETING'
  | 'HELP'
  | 'AFFIRM'
  | 'DENY'
  | 'UNKNOWN';

export type WorkflowType =
  | 'INFORMATION_RETRIEVAL'
  | 'CARD_ACTION'
  | 'COMPLAINT_LIFECYCLE';

// ── Workflow Steps ─────────────────────────────────────────────────────────────
export type WorkflowStep =
  // information retrieval
  | 'FETCH_INFO'
  // card action
  | 'VERIFY_CARD'
  | 'GENERATE_OTP'
  | 'AWAIT_OTP'
  | 'VERIFY_OTP'
  | 'EXECUTE_ACTION'
  // complaint lifecycle
  | 'GATHER_DETAILS'
  | 'VERIFY_COMPLAINT'
  | 'CREATE_CASE'
  | 'AWAIT_SATISFACTION'
  | 'CLOSE_CASE'
  | 'ESCALATE'
  // shared
  | 'DONE'
  | 'FAILED';

export type TransactionState =
  | 'INITIATED'
  | 'OTP_SENT'
  | 'VERIFIED'
  | 'FAILED';

export type CaseStatus =
  | 'OPEN'
  | 'VERIFIED'
  | 'CLOSED'
  | 'ESCALATED';

export type CardStatus = 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';

// ── Message ───────────────────────────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant' | 'system';

export interface AgentMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  agentName?: string;           // which sub-agent produced this
  workflowStep?: WorkflowStep;
  metadata?: Record<string, unknown>;
}

// ── Workflow State ─────────────────────────────────────────────────────────────
export interface WorkflowState {
  type: WorkflowType | null;
  currentStep: WorkflowStep | null;
  transactionState: TransactionState | null;
  pendingOtpAction?: string;    // 'UNLOCK' | 'BLOCK'
  pendingCaseId?: string;
  chequeNumber?: string;
  cardId?: string;
  entities: Record<string, unknown>;
}

// ── Conversation ───────────────────────────────────────────────────────────────
export interface Conversation {
  sessionId: string;
  customerId: string;
  identity: CustomerIdentity | null;
  messages: AgentMessage[];
  workflowState: WorkflowState;
  isEscalated: boolean;
  escalatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Case ──────────────────────────────────────────────────────────────────────
export interface AgentCase {
  caseId: string;
  customerId: string;
  customerName: string;
  type: string;
  description: string;
  status: CaseStatus;
  entities: Record<string, unknown>;
  transcript: AgentMessage[];
  resolution?: string;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Card ──────────────────────────────────────────────────────────────────────
export interface SimulatedCard {
  cardId: string;
  customerId: string;
  maskedNumber: string;
  type: 'DEBIT' | 'CREDIT';
  status: CardStatus;
  expiryDate: string;
}

// ── OTP Record ────────────────────────────────────────────────────────────────
export interface OtpRecord {
  otp: string;
  customerId: string;
  purpose: string;
  expiresAt: number;          // epoch ms
  used: boolean;
}

// ── Agent I/O ─────────────────────────────────────────────────────────────────
export interface AgentInput {
  userMessage: string;
  sessionId: string;
  identity: CustomerIdentity;
  conversation: Conversation;
}

export interface AgentOutput {
  reply: string;
  updatedWorkflow: WorkflowState;
  agentName: string;
  workflowStep: WorkflowStep;
  requiresOtp?: boolean;
  caseId?: string;
  isEscalated?: boolean;
  suggestedReplies?: string[];
  metadata?: Record<string, unknown>;
}

// ── Chat API ──────────────────────────────────────────────────────────────────
export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  sessionId: string;
  reply: string;
  agentName: string;
  workflowType: WorkflowType | null;
  workflowStep: WorkflowStep | null;
  transactionState: TransactionState | null;
  requiresOtp: boolean;
  caseId?: string;
  isEscalated: boolean;
  suggestedReplies: string[];
  messages: AgentMessage[];
}
