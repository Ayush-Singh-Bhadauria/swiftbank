/**
 * GET  /api/agent/cases          – list cases (all for agent console, filtered by customerId for customers)
 * POST /api/agent/cases          – create a case directly (admin/test use)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllCases, getCasesForCustomer, createCase } from '@/lib/agent-store';
import { getCustomerProfile } from '@/lib/server-utils';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);

    // If the request has ?all=true, return all cases (agent console use-case)
    const all = req.nextUrl.searchParams.get('all') === 'true';

    if (all) {
      return NextResponse.json({ success: true, data: getAllCases() });
    }

    // Otherwise return cases for authenticated customer
    const profileRes = await getCustomerProfile(token);
    const customerId = profileRes.data?.customerId ?? token.replace('TOKEN_', '');
    return NextResponse.json({ success: true, data: getCasesForCustomer(customerId) });
  } catch (err) {
    console.error('[/api/agent/cases GET]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
