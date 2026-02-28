'use client';

/**
 * AgentChat
 * Full-featured floating chat widget that replaces the Watson Orchestrate webchat.
 *
 * Features:
 * – Identity-aware (reads JWT token from localStorage)
 * – Persists sessionId across messages
 * – Three workflow types with step-tracker
 * – Inline OTP input with highlighted hint
 * – Suggested quick-reply buttons
 * – Escalation indicator
 * – Agent name badge per response
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Minimize2, Send, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ChatResponse, AgentMessage } from '@/lib/agent-types';
import { WorkflowIndicator } from './workflow-indicator';
import { MessageBubble } from './message-bubble';

// ── API call helper ────────────────────────────────────────────────────────────
async function sendMessage(
  message: string,
  sessionId: string | null,
  token: string
): Promise<ChatResponse | null> {
  try {
    const res = await fetch('/api/agent/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, sessionId }),
    });
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [workflowType, setWorkflowType] = useState<ChatResponse['workflowType']>(null);
  const [workflowStep, setWorkflowStep] = useState<ChatResponse['workflowStep']>(null);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  // Send welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleSend('hello');
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(
    async (text?: string) => {
      const message = (text ?? inputValue).trim();
      if (!message || isLoading) return;

      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        setError('You must be logged in to use the assistant.');
        return;
      }

      setInputValue('');
      setIsLoading(true);
      setError(null);
      setSuggestedReplies([]);

      // Optimistically add user message (only for non-greeting)
      if (!text) {
        const userMsg: AgentMessage = {
          id: `local-${Date.now()}`,
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
      }

      const response = await sendMessage(message, sessionId, token);

      if (!response) {
        setError('Could not connect to the assistant. Please try again.');
        setIsLoading(false);
        return;
      }

      // Sync state from full server-side message list
      setMessages(response.messages);
      setSessionId(response.sessionId);
      setWorkflowType(response.workflowType);
      setWorkflowStep(response.workflowStep);
      setRequiresOtp(response.requiresOtp);
      setIsEscalated(response.isEscalated);
      setSuggestedReplies(response.suggestedReplies);

      if (!isOpen || isMinimized) {
        setUnreadCount((c) => c + 1);
      }

      setIsLoading(false);
    },
    [inputValue, isLoading, sessionId, isOpen, isMinimized]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setSessionId(null);
    setWorkflowType(null);
    setWorkflowStep(null);
    setRequiresOtp(false);
    setIsEscalated(false);
    setSuggestedReplies([]);
    setError(null);
    // Re-greet
    setTimeout(() => handleSend('hello'), 100);
  };

  // ── Floating button ──────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Open SwiftBank AI Assistant"
      >
        <MessageSquare className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  // ── Chat panel ───────────────────────────────────────────────────────────────
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex w-[360px] flex-col rounded-2xl border border-border bg-background shadow-2xl transition-all duration-200 ${
        isMinimized ? 'h-14' : 'h-[560px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">SwiftBank AI</p>
            <p className="text-[10px] opacity-70">
              {isEscalated ? '🔴 Escalated to Human Agent' : '🟢 Authenticated Session'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="rounded p-1 hover:bg-primary-foreground/10 transition-colors"
            title="New conversation"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsMinimized((v) => !v)}
            className="rounded p-1 hover:bg-primary-foreground/10 transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 hover:bg-primary-foreground/10 transition-colors"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Workflow Indicator */}
          <WorkflowIndicator
            workflowType={workflowType}
            currentStep={workflowStep}
          />

          {/* OTP Banner */}
          {requiresOtp && (
            <div className="flex items-center gap-2 border-b border-yellow-200 bg-yellow-50 px-3 py-2 dark:border-yellow-900 dark:bg-yellow-950">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-yellow-600" />
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                Enter the 6-digit OTP sent to your registered mobile.
              </p>
            </div>
          )}

          {/* Escalation Banner */}
          {isEscalated && (
            <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950">
              <span className="text-xs text-red-800 dark:text-red-200">
                🔴 This conversation has been escalated. A human agent will contact you shortly.
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages
              .filter((m) => m.role !== 'system')
              .map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <span className="text-xs">AI</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Replies */}
          {suggestedReplies.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
              {suggestedReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleSend(reply)}
                  className="rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border px-3 py-2 rounded-b-2xl">
            <input
              ref={inputRef}
              type={requiresOtp ? 'number' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={requiresOtp ? 'Enter 6-digit OTP…' : 'Type a message…'}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
              maxLength={requiresOtp ? 6 : 500}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40 hover:opacity-90"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
