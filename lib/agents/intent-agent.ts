/**
 * Intent Agent
 * Classifies the user's natural-language message into a typed Intent.
 * Uses keyword/phrase pattern matching (no external LLM required).
 */

import { Intent } from '@/lib/agent-types';

interface IntentPattern {
  intent: Intent;
  patterns: RegExp[];
  priority: number; // higher = checked first
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'ESCALATE',
    priority: 100,
    patterns: [
      /\b(escalat|speak.*human|talk.*agent|human agent|not satisfied|not happy|real person)\b/i,
    ],
  },
  {
    intent: 'PROVIDE_OTP',
    priority: 90,
    patterns: [
      /^\s*\d{6}\s*$/,                         // bare 6-digit number
      /\b(otp|one.?time.?password)\b.*\d{4,8}/i,  // "otp is 123456"
      /\b\d{4,8}\b.*\b(otp|code|pin)\b/i,
    ],
  },
  {
    intent: 'PROVIDE_CHEQUE_NUMBER',
    priority: 85,
    patterns: [
      /\bcheque\s*(no\.?|number|#)?\s*[:\-]?\s*\d{6,}\b/i,
      /\b(it is|its|number is|no is)\s*\d{6,}\b/i,
    ],
  },
  {
    intent: 'CLOSE_CASE',
    priority: 80,
    patterns: [
      /\b(close|resolve|resolved|satisfied|that.?s fine|all good|done|close.*case|case.*close)\b/i,
    ],
  },
  {
    intent: 'CHECK_CASE_STATUS',
    priority: 75,
    patterns: [
      /\b(case.*status|status.*case|case.*id|check.*complaint|complaint.*status|case\s+CASE-\d+)\b/i,
      /\bCASE-\d{13}-[A-Z0-9]{5}\b/,
    ],
  },
  {
    intent: 'FILE_COMPLAINT',
    priority: 70,
    patterns: [
      /\b(complaint|complain|grievance|dispute|problem|issue|not.?reflected|not.?credited|cheque.*not|not.*cheque|missing.*deposit|deposit.*missing|amount.*not|not.*amount)\b/i,
    ],
  },
  {
    intent: 'UNLOCK_CARD',
    priority: 65,
    patterns: [
      /\b(unlock|unblock|enable|activate|re-?enable)\b.*\b(card|atm|debit|credit)\b/i,
      /\b(card|atm|debit|credit)\b.*\b(unlock|unblock|enable|activate)\b/i,
      /\batm.*unlock\b|\bunlock.*atm\b/i,
    ],
  },
  {
    intent: 'BLOCK_CARD',
    priority: 64,
    patterns: [
      /\b(block|freeze|suspend|lock|disable|lost|stolen)\b.*\b(card|atm|debit|credit)\b/i,
      /\b(card|atm).*\b(block|freeze|suspend|lost|stolen)\b/i,
    ],
  },
  {
    intent: 'GET_CHEQUE_STATUS',
    priority: 60,
    patterns: [
      /\b(cheque.*status|status.*cheque|cheque.*clear|cheque.*credit|cheque.*reflect|check.*cheque)\b/i,
    ],
  },
  {
    intent: 'GET_TRANSACTIONS',
    priority: 55,
    patterns: [
      /\b(transaction|transactions|history|recent.*payment|payment.*history|statement|mini.*statement)\b/i,
    ],
  },
  {
    intent: 'GET_ACCOUNT',
    priority: 50,
    patterns: [
      /\b(account.*detail|account.*info|account.*number|ifsc|branch|account.*type)\b/i,
    ],
  },
  {
    intent: 'GET_BALANCE',
    priority: 45,
    patterns: [
      /\b(balance|how much|available.*amount|current.*balance|check.*balance|balance.*check|funds|money)\b/i,
    ],
  },
  {
    intent: 'AFFIRM',
    priority: 30,
    patterns: [
      /^\s*(yes|yeah|yep|yup|sure|ok|okay|correct|right|confirmed|go ahead|proceed|please|fine)\s*\.?\s*$/i,
    ],
  },
  {
    intent: 'DENY',
    priority: 29,
    patterns: [
      /^\s*(no|nope|nah|not really|don'?t|cancel|stop|skip)\s*\.?\s*$/i,
    ],
  },
  {
    intent: 'HELP',
    priority: 20,
    patterns: [
      /\b(help|what can you|what do you|options|capabilities|assist|support)\b/i,
    ],
  },
  {
    intent: 'GREETING',
    priority: 10,
    patterns: [
      /^\s*(hi|hello|hey|good\s+(morning|afternoon|evening)|howdy|greetings)\b/i,
    ],
  },
];

// Sort once by descending priority
const SORTED_PATTERNS = [...INTENT_PATTERNS].sort((a, b) => b.priority - a.priority);

export function detectIntent(message: string): Intent {
  for (const { intent, patterns } of SORTED_PATTERNS) {
    if (patterns.some((p) => p.test(message))) {
      return intent;
    }
  }
  return 'UNKNOWN';
}

/** Extract a 6-digit OTP from user message */
export function extractOtp(message: string): string | null {
  const match = message.match(/\b(\d{6})\b/);
  return match ? match[1] : null;
}

/** Extract a cheque number (6+ digits) from user message */
export function extractChequeNumber(message: string): string | null {
  const match = message.match(/\b(\d{6,})\b/);
  return match ? match[1] : null;
}
