'use client';

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import type { ConversationState } from '../../types';

interface MessageInputProps {
  onSend: (message: string) => void;
  isTyping: boolean;
  conversationState: ConversationState;
}

export default function MessageInput({ onSend, isTyping, conversationState }: MessageInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const canSend = conversationState === 'active' && !isTyping && text.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const placeholder =
    conversationState === 'idle'
      ? 'Start a conversation first…'
      : conversationState === 'ended'
      ? 'Conversation ended. Reset to start again.'
      : isTyping
      ? 'Agent is typing…'
      : 'Type a message…';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 16px',
      background: '#f0f4f8',
      borderTop: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={conversationState !== 'active' || isTyping}
        style={{
          flex: 1,
          padding: '11px 16px',
          borderRadius: '24px',
          border: '1.5px solid var(--border)',
          fontSize: '14px',
          background: conversationState === 'active' && !isTyping ? '#fff' : '#f1f5f9',
          color: 'var(--text-dark)',
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
        }}
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        style={{
          width: '44px', height: '44px',
          borderRadius: '50%',
          border: 'none',
          cursor: canSend ? 'pointer' : 'not-allowed',
          background: canSend
            ? 'linear-gradient(135deg, var(--blue-500), var(--blue-700))'
            : '#cbd5e1',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
          boxShadow: canSend ? '0 3px 8px rgba(37,99,235,0.35)' : 'none',
          transform: canSend ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        <Send size={17} />
      </button>
    </div>
  );
}
