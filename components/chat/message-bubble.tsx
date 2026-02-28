'use client';

/**
 * MessageBubble
 * Renders a single chat message with simple markdown support.
 */

import { AgentMessage } from '@/lib/agent-types';
import { Bot, User } from 'lucide-react';

interface Props {
  message: AgentMessage;
}

/** Very lightweight markdown → JSX converter (no external dep). */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Process bold + code in a line
    const parts = parseLine(line);
    return (
      <span key={i}>
        {parts}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

function parseLine(line: string): React.ReactNode[] {
  // Tokenize: **bold**, `code`, plain text
  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(line)) !== null) {
    if (m.index > last) tokens.push(line.slice(last, m.index));
    const raw = m[0];
    if (raw.startsWith('**')) {
      tokens.push(<strong key={m.index}>{raw.slice(2, -2)}</strong>);
    } else if (raw.startsWith('`')) {
      tokens.push(
        <code
          key={m.index}
          className="rounded bg-muted px-1 py-0.5 font-mono text-xs"
        >
          {raw.slice(1, -1)}
        </code>
      );
    }
    last = m.index + raw.length;
  }

  if (last < line.length) tokens.push(line.slice(last));
  return tokens;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-emerald-600 text-white'
        }`}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {!isUser && message.agentName && (
          <span className="text-[10px] text-muted-foreground px-1">{message.agentName}</span>
        )}
        <div
          className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
            isUser
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-tl-sm bg-muted text-foreground'
          }`}
        >
          {renderMarkdown(message.content)}
        </div>
        <span className={`text-[10px] text-muted-foreground px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
