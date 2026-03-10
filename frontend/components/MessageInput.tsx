'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import type { ConversationState } from '../../types';

interface MessageInputProps {
  onSend: (message: string) => void;
  isTyping: boolean;
  conversationState: ConversationState;
  suggestedReplies?: string[];
}

export default function MessageInput({ 
  onSend, 
  isTyping, 
  conversationState,
  suggestedReplies = []
}: MessageInputProps) {
  const [text, setText] = useState('');

  const canSend = conversationState === 'active' && !isTyping && text.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const placeholder =
    conversationState === 'idle'
      ? 'Start a conversation first…'
      : conversationState === 'ended'
      ? 'Session ended. Check results panel.'
      : isTyping
      ? 'Agent is typing…'
      : 'Type a message…';

  return (
    <div style={{ flexShrink: 0, borderTop: '1px solid var(--border)', background: '#fff' }}>
      
      {/* ── Suggested Replies ──────────────────────────────────────── */}
      {suggestedReplies.length > 0 && conversationState === 'active' && !isTyping && (
        <div className="animate-fade-up" style={{
          display: 'flex', gap: '8px', padding: '12px 16px',
          overflowX: 'auto', background: '#f8fafc',
          borderBottom: '1px solid var(--border)'
        }}>
          {suggestedReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => onSend(reply)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid var(--primary-light)',
                background: 'var(--green-50)',
                color: 'var(--primary-dark)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--green-100)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--green-50)'}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Box ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', background: '#f8fafc',
      }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={conversationState !== 'active' || isTyping}
          style={{
            flex: 1, padding: '11px 16px', borderRadius: '24px',
            border: '1px solid var(--border)', fontSize: '14px',
            background: conversationState === 'active' && !isTyping ? '#fff' : '#f1f5f9',
            outline: 'none', transition: 'all 0.2s',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary-light)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: '44px', height: '44px', borderRadius: '50%', border: 'none',
            cursor: canSend ? 'pointer' : 'not-allowed',
            background: canSend ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : '#cbd5e1',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
            transform: canSend ? 'scale(1)' : 'scale(0.95)',
            boxShadow: canSend ? '0 4px 10px rgba(34, 94, 87, 0.3)' : 'none',
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
