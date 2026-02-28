/**
 * Banking Information Agent
 * Handles Workflow 1: Information Retrieval
 * - GET_BALANCE
 * - GET_TRANSACTIONS
 * - GET_ACCOUNT
 * - GET_CHEQUE_STATUS
 */

import { AgentInput, AgentOutput } from '@/lib/agent-types';
import { getBalance, getTransactions, getAccount, getChequeStatus } from '@/lib/server-utils';
import { extractChequeNumber } from './intent-agent';

export async function handleBankingInfo(
  input: AgentInput,
  action: 'GET_BALANCE' | 'GET_TRANSACTIONS' | 'GET_ACCOUNT' | 'GET_CHEQUE_STATUS'
): Promise<AgentOutput> {
  const { identity, conversation, userMessage } = input;
  const token = `TOKEN_${identity.customerId}`;
  const wf = { ...conversation.workflowState };

  wf.type = 'INFORMATION_RETRIEVAL';
  wf.currentStep = 'FETCH_INFO';

  try {
    if (action === 'GET_BALANCE') {
      const res = await getBalance(token);
      if (!res.success || !res.data) {
        return error(wf, 'Could not retrieve your balance right now. Please try again.');
      }
      const bal = res.data as any;
      const amount = bal.balance ?? bal.availableBalance ?? bal.currentBalance ?? 'N/A';
      wf.currentStep = 'DONE';
      return {
        reply: `Your current account balance is **₹${Number(amount).toLocaleString('en-IN')}**.\n\nIs there anything else I can help you with?`,
        updatedWorkflow: { ...wf, type: null, currentStep: null },
        agentName: 'Banking Information Agent',
        workflowStep: 'DONE',
        suggestedReplies: ['Show my transactions', 'Account details', 'No, thanks'],
      };
    }

    if (action === 'GET_TRANSACTIONS') {
      const res = await getTransactions(token, { limit: 5 });
      if (!res.success || !res.data) {
        return error(wf, 'Could not retrieve your transactions right now.');
      }
      const txns = (res.data as any).transactions ?? res.data ?? [];
      const list = txns
        .slice(0, 5)
        .map((t: any, i: number) => {
          const sign = t.type === 'CREDIT' ? '+' : '-';
          return `${i + 1}. ${t.type} | **${sign}₹${t.amount}** | ${t.description ?? t.transactionId} | ${new Date(t.timestamp).toLocaleDateString('en-IN')}`;
        })
        .join('\n');
      wf.currentStep = 'DONE';
      return {
        reply: `Here are your last ${txns.slice(0, 5).length} transactions:\n\n${list}\n\nNeed a full statement or anything else?`,
        updatedWorkflow: { ...wf, type: null, currentStep: null },
        agentName: 'Banking Information Agent',
        workflowStep: 'DONE',
        suggestedReplies: ['Check balance', 'Account details', 'File a complaint'],
      };
    }

    if (action === 'GET_ACCOUNT') {
      const res = await getAccount(token);
      if (!res.success || !res.data) {
        return error(wf, 'Could not retrieve your account details right now.');
      }
      const acc = res.data as any;
      wf.currentStep = 'DONE';
      return {
        reply:
          `Here are your account details:\n\n` +
          `• **Account Number:** ${acc.accountNumber}\n` +
          `• **Account Type:** ${acc.accountType}\n` +
          `• **Branch:** ${acc.branch ?? 'N/A'}\n` +
          `• **IFSC:** ${acc.ifsc ?? 'N/A'}\n` +
          `• **Status:** ${acc.status ?? 'Active'}\n\n` +
          `Is there anything else I can help you with?`,
        updatedWorkflow: { ...wf, type: null, currentStep: null },
        agentName: 'Banking Information Agent',
        workflowStep: 'DONE',
        suggestedReplies: ['Check balance', 'Show transactions', 'No, thanks'],
      };
    }

    if (action === 'GET_CHEQUE_STATUS') {
      // Try to get cheque number from entities or message
      const chequeNumber =
        (wf.entities.chequeNumber as string) ??
        extractChequeNumber(userMessage);

      if (!chequeNumber) {
        wf.currentStep = 'FETCH_INFO';
        wf.entities.awaitingChequeNumber = true;
        return {
          reply: 'Please provide the **cheque number** you want to check.',
          updatedWorkflow: wf,
          agentName: 'Banking Information Agent',
          workflowStep: 'FETCH_INFO',
          suggestedReplies: [],
        };
      }

      const res = await getChequeStatus(token, chequeNumber);
      if (!res.success || !res.data) {
        return error(
          { ...wf, type: null, currentStep: null },
          `Could not find status for cheque #${chequeNumber}. Please verify the number.`
        );
      }
      const cheque = res.data as any;
      wf.currentStep = 'DONE';
      return {
        reply:
          `Status for cheque **#${chequeNumber}**:\n\n` +
          `• **Amount:** ₹${cheque.amount}\n` +
          `• **Status:** ${cheque.status}\n` +
          `• **Expected Clearance:** ${cheque.expectedClearanceDate ?? 'N/A'}\n\n` +
          `Is there anything else I can help you with?`,
        updatedWorkflow: { ...wf, type: null, currentStep: null },
        agentName: 'Banking Information Agent',
        workflowStep: 'DONE',
        suggestedReplies: ['Check balance', 'File a complaint', 'No, thanks'],
      };
    }
  } catch (e) {
    console.error('[BankingAgent] error:', e);
    return error({ ...wf, type: null, currentStep: null }, 'An unexpected error occurred. Please try again.');
  }

  return error({ ...wf, type: null, currentStep: null }, 'Unknown action.');
}

function error(wf: AgentInput['conversation']['workflowState'], message: string): AgentOutput {
  return {
    reply: message,
    updatedWorkflow: { ...wf, currentStep: 'FAILED' },
    agentName: 'Banking Information Agent',
    workflowStep: 'FAILED',
    suggestedReplies: ['Try again', 'Go back to menu'],
  };
}
