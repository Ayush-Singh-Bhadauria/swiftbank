'use client';

/**
 * Agent Console – /agent-console
 *
 * Human agent view showing:
 *  – All escalated / open cases
 *  – Full conversation transcript per case
 *  – Case status controls (OPEN / CLOSED / ESCALATED)
 *  – Customer identity panel
 */

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Clock, MessageSquare, User, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { AgentCase } from '@/lib/agent-types';

type SortKey = 'status' | 'createdAt' | 'type';

const STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  VERIFIED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  CLOSED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ESCALATED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  OPEN: Clock,
  VERIFIED: CheckCircle,
  CLOSED: CheckCircle,
  ESCALATED: AlertTriangle,
};

export default function AgentConsolePage() {
  const [cases, setCases] = useState<AgentCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<AgentCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadCases = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/agent/cases?all=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setCases(json.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCases();
    const interval = setInterval(loadCases, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, [loadCases]);

  const updateCaseStatus = async (caseId: string, status: AgentCase['status'], resolution?: string) => {
    setUpdating(true);
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/agent/cases/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, ...(resolution ? { resolution } : {}) }),
      });
      const json = await res.json();
      if (json.success) {
        await loadCases();
        setSelectedCase(json.data);
      }
    } finally {
      setUpdating(false);
    }
  };

  // Sort + filter
  const sortedCases = [...cases]
    .filter((c) => filterStatus === 'ALL' || c.status === filterStatus)
    .sort((a, b) => {
      let v: number;
      if (sortKey === 'createdAt') v = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortKey === 'type') v = a.type.localeCompare(b.type);
      else v = a.status.localeCompare(b.status);
      return sortAsc ? v : -v;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const stats = {
    total: cases.length,
    open: cases.filter((c) => c.status === 'OPEN').length,
    escalated: cases.filter((c) => c.status === 'ESCALATED').length,
    closed: cases.filter((c) => c.status === 'CLOSED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Console</h1>
          <p className="mt-1 text-muted-foreground">
            Manage escalated cases and live conversations
          </p>
        </div>
        <button
          onClick={loadCases}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Cases', value: stats.total, color: 'border-border' },
          { label: 'Open', value: stats.open, color: 'border-blue-400' },
          { label: 'Escalated', value: stats.escalated, color: 'border-red-400' },
          { label: 'Closed', value: stats.closed, color: 'border-green-400' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border-2 ${s.color} bg-card p-4`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Case List */}
        <div className="lg:col-span-2 space-y-3">
          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'OPEN', 'ESCALATED', 'VERIFIED', 'CLOSED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filterStatus === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : sortedCases.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No cases found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedCases.map((c) => {
                const Icon = STATUS_ICON[c.status] ?? Clock;
                return (
                  <button
                    key={c.caseId}
                    onClick={() => { setSelectedCase(c); setTranscriptOpen(false); }}
                    className={`w-full rounded-xl border p-3 text-left transition-colors hover:bg-accent ${
                      selectedCase?.caseId === c.caseId
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-mono text-muted-foreground">{c.caseId}</p>
                        <p className="mt-0.5 truncate text-sm font-medium">{c.customerName}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.description}</p>
                      </div>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLOR[c.status]}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString('en-IN')}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Case Detail */}
        <div className="lg:col-span-3">
          {!selectedCase ? (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-border">
              <div className="text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Select a case to view details</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {/* Case Header */}
              <div className="border-b border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{selectedCase.caseId}</p>
                    <h3 className="mt-0.5 text-lg font-semibold">{selectedCase.customerName}</h3>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[selectedCase.status]}`}>
                      {selectedCase.status}
                    </span>
                  </div>
                  {selectedCase.assignedAgent && (
                    <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs">
                      <User className="h-3 w-3" />
                      <span>{selectedCase.assignedAgent}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Customer ID</p>
                  <p className="font-medium">{selectedCase.customerId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedCase.type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(selectedCase.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(selectedCase.updatedAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="font-medium">{selectedCase.description}</p>
                </div>
                {selectedCase.resolution && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Resolution</p>
                    <p className="font-medium text-green-700 dark:text-green-400">{selectedCase.resolution}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedCase.status !== 'CLOSED' && (
                <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
                  <button
                    disabled={updating}
                    onClick={() => updateCaseStatus(selectedCase.caseId, 'CLOSED', 'Resolved by agent')}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    ✓ Close Case
                  </button>
                  {selectedCase.status !== 'ESCALATED' && (
                    <button
                      disabled={updating}
                      onClick={() => updateCaseStatus(selectedCase.caseId, 'ESCALATED')}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      ↑ Escalate
                    </button>
                  )}
                  {selectedCase.status === 'OPEN' && (
                    <button
                      disabled={updating}
                      onClick={() => updateCaseStatus(selectedCase.caseId, 'VERIFIED')}
                      className="rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                    >
                      ✓ Mark Verified
                    </button>
                  )}
                </div>
              )}

              {/* Transcript Toggle */}
              <div className="border-t border-border">
                <button
                  onClick={() => setTranscriptOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <span>Conversation Transcript ({selectedCase.transcript.length} messages)</span>
                  {transcriptOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {transcriptOpen && (
                  <div className="max-h-64 overflow-y-auto border-t border-border bg-muted/30 p-4 space-y-2">
                    {selectedCase.transcript.filter((m) => m.role !== 'system').map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-1.5 text-xs ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-tr-none'
                              : 'bg-background border border-border rounded-tl-none'
                          }`}
                        >
                          {msg.role === 'assistant' && msg.agentName && (
                            <p className="text-[10px] opacity-60 mb-0.5">{msg.agentName}</p>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className="mt-0.5 text-[9px] opacity-50">
                            {new Date(msg.timestamp).toLocaleTimeString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
