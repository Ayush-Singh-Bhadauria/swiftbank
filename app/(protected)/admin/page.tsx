'use client';

/**
 * Admin / Demo Dashboard – /admin
 *
 * Shows:
 *  – KPI overview
 *  – All conversations with workflow state
 *  – Simulated user switcher (uses stored demo customer IDs)
 *  – Quick-trigger sample message templates
 */

import { useState, useEffect, useCallback } from 'react';
import { Activity, MessageSquare, FileText, AlertTriangle, Users, RefreshCw, ChevronRight } from 'lucide-react';
import { Conversation, AgentCase } from '@/lib/agent-types';

const DEMO_USERS = [
  { customerId: 'CUST001', name: 'Rahul Sharma', label: 'User A' },
  { customerId: 'CUST002', name: 'Priya Mehta', label: 'User B' },
  { customerId: 'CUST003', name: 'Arjun Patel', label: 'User C' },
];

const DEMO_SCENARIOS = [
  {
    label: '📊 Balance Enquiry',
    category: 'Information Retrieval',
    messages: ['What is my account balance?'],
  },
  {
    label: '🧾 Mini Statement',
    category: 'Information Retrieval',
    messages: ['Show me my last 5 transactions'],
  },
  {
    label: '💳 ATM Card Unlock',
    category: 'Card Action (OTP)',
    messages: ['I want to unlock my ATM card'],
  },
  {
    label: '🔒 Block Stolen Card',
    category: 'Card Action (OTP)',
    messages: ['My card is lost, please block it'],
  },
  {
    label: '📁 Cheque Not Reflected',
    category: 'Complaint Lifecycle',
    messages: ['I deposited a cheque but it is not reflected in my account'],
  },
  {
    label: '🆘 Escalate to Agent',
    category: 'Escalation',
    messages: ['I want to speak to a human agent'],
  },
];

export default function AdminPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [cases, setCases] = useState<AgentCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    try {
      const [convRes, caseRes] = await Promise.all([
        fetch('/api/agent/conversations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/agent/cases?all=true', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [convJson, caseJson] = await Promise.all([convRes.json(), caseRes.json()]);
      if (convJson.success) setConversations(convJson.data ?? []);
      if (caseJson.success) setCases(caseJson.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  const stats = {
    conversations: conversations.length,
    cases: cases.length,
    escalated: cases.filter((c) => c.status === 'ESCALATED').length,
    activeWorkflows: conversations.filter((c) => c.workflowState.type !== null).length,
  };

  const workflowDist = conversations.reduce<Record<string, number>>((acc, c) => {
    const t = c.workflowState.type ?? 'IDLE';
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin / Demo Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            System overview, telemetry, and demo controls
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Conversations', value: stats.conversations, icon: MessageSquare, color: 'text-blue-500' },
          { label: 'Cases Filed', value: stats.cases, icon: FileText, color: 'text-purple-500' },
          { label: 'Escalations', value: stats.escalated, icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Active Workflows', value: stats.activeWorkflows, icon: Activity, color: 'text-emerald-500' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="mt-2 text-3xl font-bold">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Workflow Distribution */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Workflow Distribution
          </h3>
          {Object.keys(workflowDist).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(workflowDist).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{type.replace(/_/g, ' ')}</span>
                  <span className="font-mono font-bold">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Demo Scenarios */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Demo Scenarios
          </h3>
          <div className="space-y-1.5">
            {DEMO_SCENARIOS.map((s) => (
              <div key={s.label} className="rounded-lg border border-border p-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium">{s.label}</p>
                    <p className="text-[10px] text-muted-foreground">{s.category}</p>
                  </div>
                  <span className="text-[10px] bg-muted rounded px-1.5 py-0.5 font-mono">
                    Demo
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground italic">
                  "{s.messages[0]}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Simulated Users */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" /> Synthetic Users (Demo)
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Use these customer IDs to simulate different users in the login screen.
          </p>
          <div className="space-y-2">
            {DEMO_USERS.map((u) => (
              <div key={u.customerId} className="rounded-lg border border-border bg-muted/40 p-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{u.customerId}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {u.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversations Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold">Live Conversations</h3>
          <span className="text-xs text-muted-foreground">{conversations.length} sessions</span>
        </div>
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No conversations yet. Open the chat widget to start.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Session ID', 'Customer', 'Workflow', 'Step', 'Escalated', 'Messages', 'Last Active'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {conversations.map((conv) => (
                  <tr
                    key={conv.sessionId}
                    className="border-b border-border hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => setSelectedConv(conv === selectedConv ? null : conv)}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {conv.sessionId.slice(-12)}
                    </td>
                    <td className="px-4 py-2.5 font-medium">{conv.identity?.name ?? conv.customerId}</td>
                    <td className="px-4 py-2.5">
                      {conv.workflowState.type ? (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {conv.workflowState.type.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Idle</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs">{conv.workflowState.currentStep ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      {conv.isEscalated ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 dark:bg-red-900 dark:text-red-200">
                          YES
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">No</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">{conv.messages.length}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleTimeString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expanded conversation */}
      {selectedConv && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold">Transcript: {selectedConv.sessionId.slice(-12)}</h3>
            <button onClick={() => setSelectedConv(null)} className="text-xs text-muted-foreground hover:text-foreground">
              Close
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto p-4 space-y-2">
            {selectedConv.messages.filter((m) => m.role !== 'system').map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`max-w-[75%] rounded-xl px-3 py-1.5 text-xs ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted border border-border rounded-tl-none'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <p className="text-[10px] opacity-60 mb-0.5">{msg.agentName}</p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
