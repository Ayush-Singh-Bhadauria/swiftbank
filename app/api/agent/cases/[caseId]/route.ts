/**
 * GET    /api/agent/cases/[caseId]  – get a specific case
 * PATCH  /api/agent/cases/[caseId]  – update status / add resolution / assign agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCase, updateCase } from '@/lib/agent-store';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  const c = getCase(caseId);
  if (!c) {
    return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: c });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const body = await req.json();
    const updated = updateCase(caseId, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 });
  }
}
