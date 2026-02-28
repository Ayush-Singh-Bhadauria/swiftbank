/**
 * Card Action Agent + OTP Agent
 * Handles Workflow 2: Transaction with OTP
 * - UNLOCK_CARD (requires OTP)
 * - BLOCK_CARD  (requires OTP)
 *
 * Agent pipeline:
 *   Intent → Verify Card → Generate OTP → Await OTP → Verify OTP → Execute Action → Done
 */

import { AgentInput, AgentOutput, WorkflowState } from '@/lib/agent-types';
import {
  getCardForCustomer,
  updateCardStatus,
  generateOTPRecord,
  verifyOTPRecord,
} from '@/lib/agent-store';
import { extractOtp } from './intent-agent';

type CardAction = 'UNLOCK_CARD' | 'BLOCK_CARD';

// ── Step 1: Initiate card workflow ────────────────────────────────────────────
export function initiateCardAction(
  input: AgentInput,
  action: CardAction
): AgentOutput {
  const { identity, conversation } = input;
  const card = getCardForCustomer(identity.customerId);

  const wf: WorkflowState = {
    ...conversation.workflowState,
    type: 'CARD_ACTION',
    currentStep: 'VERIFY_CARD',
    pendingOtpAction: action === 'UNLOCK_CARD' ? 'UNLOCK' : 'BLOCK',
    cardId: card.cardId,
    entities: { ...conversation.workflowState.entities },
  };

  // Check if action is already in the desired state
  if (action === 'UNLOCK_CARD' && card.status === 'ACTIVE') {
    return {
      reply: `Your ${card.type} card ending **${card.maskedNumber.slice(-4)}** is already **active**. No action needed.\n\nIs there anything else I can help you with?`,
      updatedWorkflow: { ...wf, type: null, currentStep: null, transactionState: null },
      agentName: 'Card Verification Agent',
      workflowStep: 'DONE',
      suggestedReplies: ['Check balance', 'Block my card', 'No, thanks'],
    };
  }
  if (action === 'BLOCK_CARD' && card.status === 'BLOCKED') {
    return {
      reply: `Your ${card.type} card ending **${card.maskedNumber.slice(-4)}** is already **blocked**. No action needed.\n\nIs there anything else I can help you with?`,
      updatedWorkflow: { ...wf, type: null, currentStep: null, transactionState: null },
      agentName: 'Card Verification Agent',
      workflowStep: 'DONE',
      suggestedReplies: ['Check balance', 'Unlock my card', 'No, thanks'],
    };
  }

  const actionLabel = action === 'UNLOCK_CARD' ? 'unlock' : 'block';

  // Card found, verified – now generate OTP
  const otpRecord = generateOTPRecord(identity.customerId, action);

  wf.currentStep = 'AWAIT_OTP';
  wf.transactionState = 'OTP_SENT';

  return {
    reply:
      `I found your ${card.type} card ending **${card.maskedNumber.slice(-4)}** ` +
      `(current status: **${card.status}**).\n\n` +
      `To **${actionLabel}** this card, I need to verify your identity.\n\n` +
      `📱 An OTP has been sent to your registered mobile **${maskMobile(identity.mobile)}**.\n\n` +
      `**Simulated OTP for demo: \`${otpRecord.otp}\`**\n\n` +
      `Please enter the 6-digit OTP to continue.`,
    updatedWorkflow: wf,
    agentName: 'OTP Agent',
    workflowStep: 'AWAIT_OTP',
    requiresOtp: true,
    suggestedReplies: [],
    metadata: { simulatedOtp: otpRecord.otp },
  };
}

// ── Step 2: Handle OTP submission ─────────────────────────────────────────────
export function handleOtpSubmission(input: AgentInput): AgentOutput {
  const { identity, conversation, userMessage } = input;
  const wf = { ...conversation.workflowState };

  const submitted = extractOtp(userMessage) ?? userMessage.trim();
  const result = verifyOTPRecord(identity.customerId, submitted);

  if (!result.valid) {
    return {
      reply: `❌ OTP verification failed: **${result.reason}**\n\nPlease enter the correct 6-digit OTP or type "cancel" to abort.`,
      updatedWorkflow: { ...wf, transactionState: 'FAILED' },
      agentName: 'OTP Agent',
      workflowStep: 'AWAIT_OTP',
      requiresOtp: true,
      suggestedReplies: ['Resend OTP', 'Cancel'],
    };
  }

  // OTP valid – execute the card action
  wf.currentStep = 'EXECUTE_ACTION';
  wf.transactionState = 'VERIFIED';

  const action = wf.pendingOtpAction;
  const newStatus = action === 'UNLOCK' ? 'ACTIVE' : 'BLOCKED';
  const card = updateCardStatus(identity.customerId, newStatus);

  const actionLabel = action === 'UNLOCK' ? 'unlocked' : 'blocked';
  const emoji = action === 'UNLOCK' ? '✅' : '🔒';

  return {
    reply:
      `${emoji} OTP verified successfully!\n\n` +
      `Your ${card.type} card ending **${card.maskedNumber.slice(-4)}** has been **${actionLabel}**.\n\n` +
      `New card status: **${card.status}**\n\n` +
      `Is there anything else I can help you with?`,
    updatedWorkflow: { ...wf, type: null, currentStep: null, transactionState: null, pendingOtpAction: undefined },
    agentName: 'Card Action Agent',
    workflowStep: 'DONE',
    suggestedReplies: ['Check balance', 'File a complaint', 'No, thanks'],
  };
}

// ── Resend OTP ────────────────────────────────────────────────────────────────
export function resendOtp(input: AgentInput): AgentOutput {
  const { identity, conversation } = input;
  const wf = { ...conversation.workflowState };
  const otpRecord = generateOTPRecord(identity.customerId, wf.pendingOtpAction ?? 'CARD_ACTION');

  return {
    reply:
      `📱 A new OTP has been sent to **${maskMobile(identity.mobile)}**.\n\n` +
      `**Simulated OTP for demo: \`${otpRecord.otp}\`**\n\n` +
      `Please enter the 6-digit OTP to continue.`,
    updatedWorkflow: { ...wf, transactionState: 'OTP_SENT' },
    agentName: 'OTP Agent',
    workflowStep: 'AWAIT_OTP',
    requiresOtp: true,
    suggestedReplies: [],
    metadata: { simulatedOtp: otpRecord.otp },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 4) return '****';
  return `****${mobile.slice(-4)}`;
}
