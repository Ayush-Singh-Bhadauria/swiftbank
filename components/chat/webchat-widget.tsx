'use client';

/**
 * WebchatWidget
 *
 * Renders either:
 *  A) IBM watsonx Orchestrate Webchat Embed  – when NEXT_PUBLIC_WO_AGENT_ID is set.
 *     Set this to the SwiftBank_Orchestrator agent ID after deploying via deploy.ps1.
 *
 *  B) Custom AgentChat (internal TypeScript agent system) – fallback when the env
 *     var is not configured. Useful for local development before WO deployment.
 *
 * Environment variables (add to .env.local):
 *   NEXT_PUBLIC_WO_ORCHESTRATION_ID  – WO instance orchestration ID
 *   NEXT_PUBLIC_WO_AGENT_ID          – SwiftBank_Orchestrator agent UUID (from WO console)
 *   NEXT_PUBLIC_WO_ENV_ID            – WO agent environment ID
 */

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { AgentChat } from './agent-chat';

// ── Typed extension for window ────────────────────────────────────────────────
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WatsonAssistantChatOptions: any;
  }
}

const WO_ORCHESTRATION_ID = process.env.NEXT_PUBLIC_WO_ORCHESTRATION_ID ?? '';
const WO_AGENT_ID         = process.env.NEXT_PUBLIC_WO_AGENT_ID ?? '';
const WO_ENV_ID           = process.env.NEXT_PUBLIC_WO_ENV_ID ?? '';

// ── WO Embedded Chat ──────────────────────────────────────────────────────────
function WatsonOrchestrateChat() {
  const { user } = useAuth();

  useEffect(() => {
    window.WatsonAssistantChatOptions = {
      integrationID:   WO_ORCHESTRATION_ID,
      region:          'us-south',
      serviceInstanceID: WO_ORCHESTRATION_ID.split('_')[1] ?? WO_ORCHESTRATION_ID,
      agentId:         WO_AGENT_ID,
      agentEnvironmentId: WO_ENV_ID,
      openChatByDefault: false,
      // Pass authenticated session context so agents can read $session.customer_id
      userPayload: user
        ? {
            customer_id:     user.customerId,
            customer_name:   user.name ?? user.customerId,
            account_number:  '',                // populated by BankMOCK at runtime
          }
        : undefined,
      onLoad: (instance: { render: () => Promise<void> }) => {
        instance.render();
      },
    };

    const scriptId = 'wo-webchat-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id  = scriptId;
      script.src = 'https://web-chat.global.assistant.watson.appdomain.cloud/versions/latest/WatsonAssistantChatEntry.js';
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup is intentionally omitted – the chat widget manages its own lifecycle.
    };
  }, [user]);

  return null; // The WO widget renders its own floating button
}

// ── Exported component ────────────────────────────────────────────────────────
export function WebchatWidget() {
  const useWOEmbed = Boolean(WO_AGENT_ID);

  if (useWOEmbed) {
    return <WatsonOrchestrateChat />;
  }

  // Fallback: custom in-app agent (local development or pre-deployment)
  return <AgentChat />;
}
