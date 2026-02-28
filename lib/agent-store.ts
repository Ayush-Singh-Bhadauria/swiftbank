/**
 * In-memory agent store.
 * Stores conversations, cases, simulated card states, and OTP records.
 * Module-level singletons survive across Next.js API route requests in
 * the same server process – sufficient for demo / simulation purposes.
 */

import {
  Conversation,
  AgentCase,
  SimulatedCard,
  OtpRecord,
  WorkflowState,
  CustomerIdentity,
} from './agent-types';

// ── Helpers ───────────────────────────────────────────────────────────────────
function now(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function freshWorkflow(): WorkflowState {
  return {
    type: null,
    currentStep: null,
    transactionState: null,
    entities: {},
  };
}

// ── Conversation Store ─────────────────────────────────────────────────────────
const conversations = new Map<string, Conversation>();

export function getConversation(sessionId: string): Conversation | undefined {
  return conversations.get(sessionId);
}

export function createConversation(
  customerId: string,
  identity: CustomerIdentity | null
): Conversation {
  const sessionId = makeId('SESSION');
  const conv: Conversation = {
    sessionId,
    customerId,
    identity,
    messages: [],
    workflowState: freshWorkflow(),
    isEscalated: false,
    createdAt: now(),
    updatedAt: now(),
  };
  conversations.set(sessionId, conv);
  return conv;
}

export function saveConversation(conv: Conversation): void {
  conv.updatedAt = now();
  conversations.set(conv.sessionId, conv);
}

export function getAllConversations(): Conversation[] {
  return Array.from(conversations.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function resetWorkflow(conv: Conversation): void {
  conv.workflowState = freshWorkflow();
}

// ── Case Store ────────────────────────────────────────────────────────────────
const cases = new Map<string, AgentCase>();

export function createCase(
  customerId: string,
  customerName: string,
  type: string,
  description: string,
  entities: Record<string, unknown>,
  transcript: AgentCase['transcript']
): AgentCase {
  const caseId = makeId('CASE');
  const agentCase: AgentCase = {
    caseId,
    customerId,
    customerName,
    type,
    description,
    status: 'OPEN',
    entities,
    transcript: [...transcript],
    createdAt: now(),
    updatedAt: now(),
  };
  cases.set(caseId, agentCase);
  return agentCase;
}

export function getCase(caseId: string): AgentCase | undefined {
  return cases.get(caseId);
}

export function getCasesForCustomer(customerId: string): AgentCase[] {
  return Array.from(cases.values()).filter((c) => c.customerId === customerId);
}

export function getAllCases(): AgentCase[] {
  return Array.from(cases.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function updateCase(
  caseId: string,
  updates: Partial<AgentCase>
): AgentCase | null {
  const c = cases.get(caseId);
  if (!c) return null;
  const updated = { ...c, ...updates, updatedAt: now() };
  cases.set(caseId, updated);
  return updated;
}

// ── Simulated Card Store ───────────────────────────────────────────────────────
// Pre-seed a card for every customer on first access.
const cards = new Map<string, SimulatedCard>();

export function getCardForCustomer(customerId: string): SimulatedCard {
  if (!cards.has(customerId)) {
    cards.set(customerId, {
      cardId: `CARD-${customerId}`,
      customerId,
      maskedNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'DEBIT',
      status: 'BLOCKED', // default blocked so ATM-unlock demo works
      expiryDate: '12/27',
    });
  }
  return cards.get(customerId)!;
}

export function updateCardStatus(
  customerId: string,
  status: SimulatedCard['status']
): SimulatedCard {
  const card = getCardForCustomer(customerId);
  card.status = status;
  cards.set(customerId, card);
  return card;
}

// ── OTP Store ─────────────────────────────────────────────────────────────────
const otpStore = new Map<string, OtpRecord>();

export function generateOTPRecord(
  customerId: string,
  purpose: string
): OtpRecord {
  const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
  const record: OtpRecord = {
    otp,
    customerId,
    purpose,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    used: false,
  };
  otpStore.set(customerId, record);
  return record;
}

export function verifyOTPRecord(
  customerId: string,
  submittedOtp: string
): { valid: boolean; reason?: string } {
  const record = otpStore.get(customerId);
  if (!record) return { valid: false, reason: 'No OTP found. Please request a new one.' };
  if (record.used) return { valid: false, reason: 'OTP already used.' };
  if (Date.now() > record.expiresAt) return { valid: false, reason: 'OTP has expired.' };
  if (record.otp !== submittedOtp.trim()) return { valid: false, reason: 'Incorrect OTP.' };
  record.used = true;
  otpStore.set(customerId, record);
  return { valid: true };
}
