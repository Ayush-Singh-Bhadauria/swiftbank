/**
 * Main Orchestrator
 * Receives every user message and routes it through the correct agent pipeline.
 *
 * Decision logic:
 *  1. Restore conversation state
 *  2. If an active workflow is in mid-flight, continue it
 *  3. Otherwise detect intent and start a new workflow
 *  4. Persist updated state
 *  5. Return structured ChatResponse
 */

import {
  Intent,
  AgentInput,
  AgentOutput,
  Conversation,
  CustomerIdentity,
  WorkflowState,
  ChatResponse,
  AgentMessage,
} from '@/lib/agent-types';
import {
  getConversation,
  createConversation,
  saveConversation,
  resetWorkflow,
} from '@/lib/agent-store';
import { detectIntent, extractOtp } from './intent-agent';
import { handleBankingInfo } from './banking-agent';
import {
  initiateCardAction,
  handleOtpSubmission,
  resendOtp,
} from './card-agent';
import {
  initiateComplaint,
  handleChequeNumberProvided,
  handleSatisfactionResponse,
  checkCaseStatus,
  extractCaseIdFromMessage,
} from './case-agent';

// ── Public Entry Point ────────────────────────────────────────────────────────
export async function orchestrate(
  userMessage: string,
  sessionId: string | undefined,
  identity: CustomerIdentity
): Promise<ChatResponse> {
  // 1. Load or create conversation
  let conversation =
    (sessionId ? getConversation(sessionId) : undefined) ??
    createConversation(identity.customerId, identity);

  // Update identity in case profile was fetched later
  conversation.identity = identity;

  // 2. Append user message to history
  const userMsg = makeMessage('user', userMessage);
  conversation.messages.push(userMsg);

  // 3. Build agent input
  const input: AgentInput = {
    userMessage,
    sessionId: conversation.sessionId,
    identity,
    conversation,
  };

  // 4. Orchestrate
  const output = await route(input);

  // 5. Update conversation state
  conversation.workflowState = output.updatedWorkflow;
  if (output.isEscalated) conversation.isEscalated = true;

  // 6. Append assistant response
  const assistantMsg = makeMessage('assistant', output.reply, {
    agentName: output.agentName,
    workflowStep: output.workflowStep,
    metadata: output.metadata,
  });
  conversation.messages.push(assistantMsg);

  // 7. Persist
  saveConversation(conversation);

  // 8. Build response
  return {
    sessionId: conversation.sessionId,
    reply: output.reply,
    agentName: output.agentName,
    workflowType: output.updatedWorkflow.type,
    workflowStep: output.workflowStep,
    transactionState: output.updatedWorkflow.transactionState,
    requiresOtp: output.requiresOtp ?? false,
    caseId: output.caseId,
    isEscalated: output.isEscalated ?? false,
    suggestedReplies: output.suggestedReplies ?? [],
    messages: conversation.messages,
  };
}

// ── Router ────────────────────────────────────────────────────────────────────
async function route(input: AgentInput): Promise<AgentOutput> {
  const { userMessage, conversation } = input;
  const wf = conversation.workflowState;
  const intent = detectIntent(userMessage);

  // ── Always handle ESCALATE immediately ───────────────────────────────────
  if (intent === 'ESCALATE') {
    const caseId = wf.pendingCaseId;
    return handleSatisfactionResponse(input, false);
  }

  // ── Mid-flight: card action awaiting OTP ──────────────────────────────────
  if (
    wf.type === 'CARD_ACTION' &&
    wf.currentStep === 'AWAIT_OTP'
  ) {
    if (/resend|new otp|send again/i.test(userMessage)) {
      return resendOtp(input);
    }
    if (/cancel|stop|abort/i.test(userMessage)) {
      resetWorkflow(conversation);
      return {
        reply: 'Card action cancelled. Is there anything else I can help you with?',
        updatedWorkflow: { type: null, currentStep: null, transactionState: null, entities: {} },
        agentName: 'Orchestrator',
        workflowStep: 'DONE',
        suggestedReplies: ['Check balance', 'Help'],
      };
    }
    // Anything with digits is treated as OTP submission
    if (/\d/.test(userMessage)) {
      return handleOtpSubmission(input);
    }
  }

  // ── Mid-flight: case awaiting cheque number ───────────────────────────────
  if (
    wf.type === 'COMPLAINT_LIFECYCLE' &&
    wf.currentStep === 'GATHER_DETAILS' &&
    wf.entities.awaitingChequeNumber
  ) {
    return await handleChequeNumberProvided(input);
  }

  // ── Mid-flight: case awaiting satisfaction response ───────────────────────
  if (
    wf.type === 'COMPLAINT_LIFECYCLE' &&
    wf.currentStep === 'AWAIT_SATISFACTION'
  ) {
    if (intent === 'CLOSE_CASE' || intent === 'AFFIRM') {
      return handleSatisfactionResponse(input, true);
    }
    if (intent === 'DENY' || /escalat|agent|not satisfied/i.test(userMessage)) {
      return handleSatisfactionResponse(input, false);
    }
  }

  // ── New / reset workflow routing ──────────────────────────────────────────
  switch (intent) {
    case 'GREETING':
      return greet(input);

    case 'HELP':
      return helpMenu(input);

    case 'GET_BALANCE':
      return await handleBankingInfo(input, 'GET_BALANCE');

    case 'GET_TRANSACTIONS':
      return await handleBankingInfo(input, 'GET_TRANSACTIONS');

    case 'GET_ACCOUNT':
      return await handleBankingInfo(input, 'GET_ACCOUNT');

    case 'GET_CHEQUE_STATUS':
      return await handleBankingInfo(input, 'GET_CHEQUE_STATUS');

    case 'UNLOCK_CARD':
      return initiateCardAction(input, 'UNLOCK_CARD');

    case 'BLOCK_CARD':
      return initiateCardAction(input, 'BLOCK_CARD');

    case 'FILE_COMPLAINT':
      return await initiateComplaint(input);

    case 'CHECK_CASE_STATUS': {
      const caseId = extractCaseIdFromMessage(userMessage) ?? undefined;
      return checkCaseStatus(input, caseId);
    }

    case 'CLOSE_CASE':
      if (wf.pendingCaseId) {
        return handleSatisfactionResponse(input, true);
      }
      return checkCaseStatus(input);

    case 'AFFIRM':
      // Generic affirmation when no active workflow
      return {
        reply: `Is there something specific I can help you with? You can ask about your balance, transactions, card actions, or raise a complaint.`,
        updatedWorkflow: wf,
        agentName: 'Orchestrator',
        workflowStep: 'DONE',
        suggestedReplies: HELP_SUGGESTIONS,
      };

    case 'DENY':
      return {
        reply: `No problem! Feel free to reach out if you need anything. Have a great day! 👋`,
        updatedWorkflow: { ...wf, type: null, currentStep: null, transactionState: null },
        agentName: 'Orchestrator',
        workflowStep: 'DONE',
        suggestedReplies: [],
      };

    default:
      return {
        reply:
          `I'm sorry, I didn't quite understand that. Here's what I can help you with:\n\n` +
          HELP_TEXT +
          `\nPlease try rephrasing your request.`,
        updatedWorkflow: wf,
        agentName: 'Orchestrator',
        workflowStep: 'DONE',
        suggestedReplies: HELP_SUGGESTIONS,
      };
  }
}

// ── Canned Responses ──────────────────────────────────────────────────────────
function greet(input: AgentInput): AgentOutput {
  const { identity, conversation } = input;
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return {
    reply:
      `${greeting}, **${identity.name}**! 👋\n\n` +
      `I'm your SwiftBank AI assistant. How can I help you today?\n\n` +
      HELP_TEXT,
    updatedWorkflow: conversation.workflowState,
    agentName: 'Orchestrator',
    workflowStep: 'DONE',
    suggestedReplies: HELP_SUGGESTIONS,
  };
}

function helpMenu(input: AgentInput): AgentOutput {
  return {
    reply:
      `Here's everything I can help you with:\n\n` + HELP_TEXT,
    updatedWorkflow: input.conversation.workflowState,
    agentName: 'Orchestrator',
    workflowStep: 'DONE',
    suggestedReplies: HELP_SUGGESTIONS,
  };
}

const HELP_TEXT =
  `🏦 **Account Information**\n` +
  `• Check balance\n` +
  `• View recent transactions\n` +
  `• Account details\n` +
  `• Cheque status\n\n` +
  `💳 **Card Actions** *(requires OTP)*\n` +
  `• Unlock / Unblock ATM card\n` +
  `• Block / Freeze card\n\n` +
  `📁 **Complaints & Cases**\n` +
  `• Report cheque not credited\n` +
  `• File a complaint\n` +
  `• Check case status\n` +
  `• Escalate to human agent\n`;

const HELP_SUGGESTIONS = [
  'Check my balance',
  'Unlock my ATM card',
  'Cheque not reflected',
  'View transactions',
];

// ── Utility ───────────────────────────────────────────────────────────────────
function makeMessage(
  role: AgentMessage['role'],
  content: string,
  extra?: Pick<AgentMessage, 'agentName' | 'workflowStep' | 'metadata'>
): AgentMessage {
  return {
    id: `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}
