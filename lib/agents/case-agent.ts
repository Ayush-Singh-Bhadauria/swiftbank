/**
 * Case Management Agent
 * Handles Workflow 3: Complaint / Case Lifecycle
 *
 * States: OPEN → VERIFIED → CLOSED | ESCALATED
 *
 * Supported complaint types:
 *   - CHEQUE_NOT_CREDITED  (most common – needs cheque number)
 *   - GENERAL_COMPLAINT
 */

import { AgentInput, AgentOutput, WorkflowState, AgentCase } from '@/lib/agent-types';
import {
  createCase,
  getCase,
  updateCase,
  getCasesForCustomer,
} from '@/lib/agent-store';
import { getChequeStatus } from '@/lib/server-utils';
import { extractChequeNumber } from './intent-agent';

// ── Initiate Complaint Workflow ────────────────────────────────────────────────
export async function initiateComplaint(input: AgentInput): Promise<AgentOutput> {
  const { identity, conversation, userMessage } = input;

  // Is a cheque related?
  const chequeNumber = extractChequeNumber(userMessage);
  const isChequeIssue =
    /chequ[e]?|not.?reflect|not.?credit|not.?clear/i.test(userMessage);

  const wf: WorkflowState = {
    ...conversation.workflowState,
    type: 'COMPLAINT_LIFECYCLE',
    currentStep: 'GATHER_DETAILS',
    entities: {
      ...conversation.workflowState.entities,
      complaintType: isChequeIssue ? 'CHEQUE_NOT_CREDITED' : 'GENERAL_COMPLAINT',
      chequeNumber: chequeNumber ?? undefined,
      originalMessage: userMessage,
    },
  };

  if (isChequeIssue && !chequeNumber) {
    wf.entities.awaitingChequeNumber = true;
    return {
      reply:
        `I'm sorry to hear your cheque hasn't been reflected. I'll help you raise a complaint.\n\n` +
        `Could you please provide the **cheque number** so I can verify the status?`,
      updatedWorkflow: wf,
      agentName: 'Case Management Agent',
      workflowStep: 'GATHER_DETAILS',
      suggestedReplies: [],
    };
  }

  if (isChequeIssue && chequeNumber) {
    return await verifyChequeAndCreateCase(input, wf, chequeNumber);
  }

  // General complaint – go straight to case creation
  return await createComplaintCase(input, wf, 'GENERAL_COMPLAINT', userMessage);
}

// ── Handle Follow-Up When Cheque Number is Provided ───────────────────────────
export async function handleChequeNumberProvided(
  input: AgentInput
): Promise<AgentOutput> {
  const { userMessage, conversation } = input;
  const wf = { ...conversation.workflowState };
  const chequeNumber = extractChequeNumber(userMessage);

  if (!chequeNumber) {
    return {
      reply:
        'I could not extract a valid cheque number from your message. Please enter just the **cheque number** (e.g., `123456`).',
      updatedWorkflow: wf,
      agentName: 'Case Management Agent',
      workflowStep: 'GATHER_DETAILS',
      suggestedReplies: [],
    };
  }

  wf.entities.chequeNumber = chequeNumber;
  delete wf.entities.awaitingChequeNumber;
  return await verifyChequeAndCreateCase(input, wf, chequeNumber);
}

async function verifyChequeAndCreateCase(
  input: AgentInput,
  wf: WorkflowState,
  chequeNumber: string
): Promise<AgentOutput> {
  const { identity } = input;
  const token = `TOKEN_${identity.customerId}`;

  wf.currentStep = 'VERIFY_COMPLAINT';
  wf.chequeNumber = chequeNumber;

  // Call banking API to verify cheque
  const res = await getChequeStatus(token, chequeNumber);

  let verificationNote = '';
  if (res.success && res.data) {
    const cheque = res.data as any;
    verificationNote =
      `\n\n📋 **Cheque Verification Result:**\n` +
      `• Number: ${chequeNumber}\n` +
      `• Amount: ₹${cheque.amount}\n` +
      `• Current Status: ${cheque.status}\n` +
      `• Expected Clearance: ${cheque.expectedClearanceDate ?? 'N/A'}`;
    wf.entities.chequeVerification = cheque;
  } else {
    verificationNote = `\n\n⚠️ Could not verify cheque #${chequeNumber} in the system. Will raise complaint with available information.`;
  }

  return await createComplaintCase(
    input,
    wf,
    'CHEQUE_NOT_CREDITED',
    `Cheque #${chequeNumber} deposited but not reflected in account.`,
    verificationNote
  );
}

async function createComplaintCase(
  input: AgentInput,
  wf: WorkflowState,
  type: string,
  description: string,
  extraNote = ''
): Promise<AgentOutput> {
  const { identity, conversation } = input;

  wf.currentStep = 'CREATE_CASE';

  const newCase = createCase(
    identity.customerId,
    identity.name,
    type,
    description,
    wf.entities,
    conversation.messages
  );

  wf.pendingCaseId = newCase.caseId;
  wf.currentStep = 'AWAIT_SATISFACTION';

  return {
    reply:
      `✅ Your complaint has been registered successfully!${extraNote}\n\n` +
      `📁 **Case Details:**\n` +
      `• **Case ID:** \`${newCase.caseId}\`\n` +
      `• **Type:** ${formatCaseType(type)}\n` +
      `• **Status:** ${newCase.status}\n` +
      `• **Created:** ${new Date(newCase.createdAt).toLocaleString('en-IN')}\n\n` +
      `You will receive updates at your registered mobile/email.\n\n` +
      `Is your issue resolved to your satisfaction, or would you like me to escalate this to a senior agent?`,
    updatedWorkflow: wf,
    agentName: 'Case Management Agent',
    workflowStep: 'CREATE_CASE',
    caseId: newCase.caseId,
    suggestedReplies: ['Yes, close the case', 'No, escalate to an agent'],
  };
}

// ── Handle Satisfaction Response ──────────────────────────────────────────────
export function handleSatisfactionResponse(
  input: AgentInput,
  satisfied: boolean
): AgentOutput {
  const { conversation } = input;
  const wf = { ...conversation.workflowState };
  const caseId = wf.pendingCaseId!;

  if (satisfied) {
    updateCase(caseId, { status: 'CLOSED', resolution: 'Resolved – customer satisfied' });
    return {
      reply:
        `✅ Case **${caseId}** has been **closed**. We're glad your issue is resolved!\n\n` +
        `Thank you for banking with us. Is there anything else I can help you with?`,
      updatedWorkflow: { ...wf, type: null, currentStep: null, pendingCaseId: undefined },
      agentName: 'Case Management Agent',
      workflowStep: 'CLOSE_CASE',
      caseId,
      suggestedReplies: ['Check balance', 'No, thanks'],
    };
  }

  // Escalate
  const agentName = assignHumanAgent();
  updateCase(caseId, {
    status: 'ESCALATED',
    assignedAgent: agentName,
    resolution: undefined,
    transcript: conversation.messages,
  });

  return {
    reply:
      `🔴 Case **${caseId}** has been **escalated** to a senior agent.\n\n` +
      `**Assigned Agent:** ${agentName}\n` +
      `**Full conversation transcript** has been transferred.\n\n` +
      `Our agent will contact you on **${maskMobile(input.identity.mobile)}** within 30 minutes.\n\n` +
      `Is there anything else I can note for the agent?`,
    updatedWorkflow: {
      ...wf,
      type: null,
      currentStep: null,
      pendingCaseId: undefined,
    },
    agentName: 'Escalation Agent',
    workflowStep: 'ESCALATE',
    caseId,
    isEscalated: true,
    suggestedReplies: ['No, that is all', 'Add more details'],
  };
}

// ── Check Case Status ─────────────────────────────────────────────────────────
export function checkCaseStatus(
  input: AgentInput,
  caseId?: string
): AgentOutput {
  const { identity } = input;
  const wf = { ...input.conversation.workflowState };

  // Try to find a caseId in user message if not provided
  const resolvedCaseId =
    caseId ?? extractCaseIdFromMessage(input.userMessage);

  if (resolvedCaseId) {
    const c = getCase(resolvedCaseId);
    if (!c || c.customerId !== identity.customerId) {
      return {
        reply: `Case **${resolvedCaseId}** was not found or does not belong to your account.`,
        updatedWorkflow: wf,
        agentName: 'Case Management Agent',
        workflowStep: 'DONE',
        suggestedReplies: ['File a new complaint', 'Check balance'],
      };
    }
    return {
      reply: formatCaseStatus(c),
      updatedWorkflow: wf,
      agentName: 'Case Management Agent',
      workflowStep: 'DONE',
      caseId: c.caseId,
      suggestedReplies: ['Close case', 'Escalate to agent', 'Check balance'],
    };
  }

  // List all cases for customer
  const allCases = getCasesForCustomer(identity.customerId);
  if (!allCases.length) {
    return {
      reply: 'You have no open cases or complaints on file.',
      updatedWorkflow: wf,
      agentName: 'Case Management Agent',
      workflowStep: 'DONE',
      suggestedReplies: ['File a complaint', 'Check balance'],
    };
  }

  const list = allCases
    .map(
      (c) =>
        `• **${c.caseId}** | ${formatCaseType(c.type)} | **${c.status}** | ${new Date(c.createdAt).toLocaleDateString('en-IN')}`
    )
    .join('\n');

  return {
    reply: `Here are your complaint cases:\n\n${list}\n\nWould you like details on a specific case?`,
    updatedWorkflow: wf,
    agentName: 'Case Management Agent',
    workflowStep: 'DONE',
    suggestedReplies: allCases.slice(0, 2).map((c) => `Status of ${c.caseId}`),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCaseStatus(c: AgentCase): string {
  return (
    `📁 **Case ${c.caseId}**\n\n` +
    `• **Type:** ${formatCaseType(c.type)}\n` +
    `• **Status:** ${c.status}\n` +
    `• **Description:** ${c.description}\n` +
    `• **Created:** ${new Date(c.createdAt).toLocaleString('en-IN')}\n` +
    `• **Last Updated:** ${new Date(c.updatedAt).toLocaleString('en-IN')}\n` +
    (c.assignedAgent ? `• **Assigned Agent:** ${c.assignedAgent}\n` : '') +
    (c.resolution ? `• **Resolution:** ${c.resolution}\n` : '') +
    `\nIs there anything else I can help you with?`
  );
}

function formatCaseType(type: string): string {
  const map: Record<string, string> = {
    CHEQUE_NOT_CREDITED: 'Cheque Not Credited',
    GENERAL_COMPLAINT: 'General Complaint',
  };
  return map[type] ?? type;
}

function assignHumanAgent(): string {
  const agents = ['Priya Verma', 'Rohit Sharma', 'Anita Desai', 'Karan Mehta'];
  return agents[Math.floor(Math.random() * agents.length)];
}

function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 4) return '****';
  return `****${mobile.slice(-4)}`;
}

export function extractCaseIdFromMessage(message: string): string | null {
  const match = message.match(/CASE-\d{13}-[A-Z0-9]{5}/);
  return match ? match[0] : null;
}
