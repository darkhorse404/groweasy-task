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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ── Chat Header ── */}
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--border)',
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '14px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)', zIndex: 10, flexShrink: 0,
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'var(--green-50)', color: 'var(--primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 0 0 1px var(--green-200)',
        }}>
          <Bot size={22} />
        </div>
        <div>
          <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '16px', lineHeight: 1.2 }}>
            {agentName} <span style={{ marginLeft: '4px', fontSize: '10px', padding: '2px 6px', background: 'var(--green-100)', color: 'var(--primary-dark)', borderRadius: '12px', fontWeight: 700 }}>AI AGENT</span>
          </p>
          <p style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '3px', fontWeight: 500 }}>
            {isTyping ? <span style={{ color: 'var(--primary)' }}>Thinking...</span> : 'Ready to receive leads'}
          </p>
        </div>
      </div>

      {/* ── Message Feed ── */}
      <div style={{
        flex: 1, overflowY: 'auto', background: 'var(--bg-chat)', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', opacity: 0.6 }}>
            <Bot size={48} color="var(--primary)" />
            <p style={{ color: 'var(--primary-dark)', fontWeight: 600, fontSize: '14px', maxWidth: '280px', textAlign: 'center' }}>
              Initialize the conversation to test the AI Agent&apos;s qualification logic.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAI = message.role === 'assistant';

  return (
    <div className={isAI ? 'animate-slide-in-left' : 'animate-slide-in-right'} style={{ display: 'flex', justifyContent: isAI ? 'flex-start' : 'flex-end', marginBottom: '4px' }}>
      <div style={{
        maxWidth: '70%', padding: '12px 16px',
        borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        background: isAI ? 'var(--bubble-ai)' : 'var(--bubble-user)',
        color: isAI ? '#fff' : 'var(--text-dark)',
        fontSize: '14px', lineHeight: '1.5',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
        border: isAI ? 'none' : '1px solid var(--border)',
        wordBreak: 'break-word',
      }}>
        {message.content}
        <span style={{
          display: 'block', fontSize: '10px', marginTop: '6px', textAlign: 'right', fontWeight: 600,
          color: isAI ? 'rgba(255,255,255,0.7)' : 'var(--text-light)',
        }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
      <div style={{
        padding: '14px 18px', borderRadius: '4px 16px 16px 16px',
        background: 'var(--bubble-ai)', display: 'flex', gap: '5px', alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
      }}>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
