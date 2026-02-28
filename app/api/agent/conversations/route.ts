/**
 * GET /api/agent/conversations   – list all conversations (agent console)
 * GET /api/agent/conversations?sessionId=X – get a specific conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllConversations, getConversation } from '@/lib/agent-store';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (sessionId) {
      const conv = getConversation(sessionId);
      if (!conv) {
        return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: conv });
    }

    return NextResponse.json({ success: true, data: getAllConversations() });
  } catch (err) {
    console.error('[/api/agent/conversations]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
