/**
 * POST /api/agent/chat
 *
 * Body: { message: string; sessionId?: string }
 * Auth: Bearer TOKEN_<customerId>
 *
 * Returns ChatResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import { orchestrate } from '@/lib/agents/orchestrator';
import { getCustomerProfile } from '@/lib/server-utils';
import { CustomerIdentity } from '@/lib/agent-types';

function unauthorized(msg: string) {
  return NextResponse.json({ success: false, error: msg }, { status: 401 });
}

function badRequest(msg: string) {
  return NextResponse.json({ success: false, error: msg }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return unauthorized('Missing or invalid authorization token.');
    }
    const token = authHeader.slice(7);

    // ── Parse body ───────────────────────────────────────────────────────────
    let body: { message?: string; sessionId?: string };
    try {
      body = await req.json();
    } catch {
      return badRequest('Invalid JSON body.');
    }

    const { message, sessionId } = body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return badRequest('message is required and must be a non-empty string.');
    }

    // ── Resolve customer identity ─────────────────────────────────────────────
    const profileRes = await getCustomerProfile(token);
    let identity: CustomerIdentity;

    if (profileRes.success && profileRes.data) {
      const p = profileRes.data;
      identity = {
        customerId: p.customerId,
        accountNumber: p.accountNumber ?? '',
        mobile: p.mobile ?? '',
        name: p.name,
      };
    } else {
      // Fallback: synthetic identity derived from token
      const customerId = token.replace('TOKEN_', '');
      identity = {
        customerId,
        accountNumber: `ACC${customerId.replace(/\D/g, '')}`,
        mobile: '9999999999',
        name: customerId,
      };
    }

    // ── Orchestrate ───────────────────────────────────────────────────────────
    const response = await orchestrate(message.trim(), sessionId, identity);

    return NextResponse.json({ success: true, data: response });
  } catch (err) {
    console.error('[/api/agent/chat] Unhandled error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
