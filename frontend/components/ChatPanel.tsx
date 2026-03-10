'use client';

import { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import type { Message } from '../../types';

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  agentName: string;
}

export default function ChatPanel({ messages, isTyping, agentName }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* ── Chat Header ─────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--blue-600), var(--blue-800))',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        flexShrink: 0,
      }}>
        {/* Avatar */}
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.4)',
        }}>
          <Bot size={20} color="#fff" />
        </div>
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>
            {agentName}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', marginTop: '1px' }}>
            {isTyping ? 'typing…' : 'Sales Assistant · Prestige Realty'}
          </p>
        </div>
      </div>

      {/* ── Message Feed ────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: 'var(--bg-chat)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5b89c' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '12px',
            opacity: 0.5,
          }}>
            <Bot size={48} color="var(--blue-700)" />
            <p style={{ color: 'var(--blue-800)', fontWeight: 600, fontSize: '14px' }}>
              Press &ldquo;Start New Conversation&rdquo; to begin
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

/* ── Message Bubble ──────────────────────────────────────────────────────────── */

function MessageBubble({ message }: { message: Message }) {
  const isAI = message.role === 'assistant';

  return (
    <div
      className={isAI ? 'animate-slide-in-left' : 'animate-slide-in-right'}
      style={{
        display: 'flex',
        justifyContent: isAI ? 'flex-start' : 'flex-end',
        marginBottom: '2px',
      }}
    >
      <div style={{
        maxWidth: '68%',
        padding: '9px 13px',
        borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        background: isAI ? 'var(--bubble-ai)' : 'var(--bubble-user)',
        color: isAI ? '#fff' : 'var(--text-dark)',
        fontSize: '14px',
        lineHeight: '1.5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        position: 'relative',
        wordBreak: 'break-word',
      }}>
        {message.content}
        <span style={{
          display: 'block',
          fontSize: '10px',
          marginTop: '4px',
          textAlign: 'right',
          opacity: 0.6,
          color: isAI ? 'rgba(255,255,255,0.8)' : 'var(--text-light)',
        }}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

/* ── Typing Indicator ────────────────────────────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '2px' }}>
      <div style={{
        padding: '10px 14px',
        borderRadius: '4px 16px 16px 16px',
        background: 'var(--bubble-ai)',
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────────── */

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
