'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import type { ConversationState } from '../types';

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
    <div className="shrink-0 border-t border-slate-200 bg-white">
      
      {/* ── Suggested Replies ── */}
      {suggestedReplies.length > 0 && conversationState === 'active' && !isTyping && (
        <div className="animate-fade-up flex gap-2 py-3 px-4 overflow-x-auto bg-slate-50 border-b border-slate-200 scrollbar-hide">
          {suggestedReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => onSend(reply)}
              className="px-3.5 py-1.5 rounded-full border border-primary-light/30 bg-primary/10 text-primary-dark text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-colors hover:bg-primary/20"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Box ── */}
      <div className="flex items-center gap-2.5 p-3 sm:px-4 bg-slate-50">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={conversationState !== 'active' || isTyping}
          className={`
            flex-1 px-4 py-2.5 rounded-full border text-sm outline-none transition-all shadow-inner
            ${conversationState === 'active' && !isTyping ? 'bg-white border-slate-200 focus:border-primary' : 'bg-slate-100 border-slate-200 text-slate-500'}
          `}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`
            w-11 h-11 rounded-full border-none flex items-center justify-center transition-all duration-200
            ${canSend 
              ? 'cursor-pointer bg-gradient-to-br from-primary to-primary-dark text-white transform scale-100 shadow-[0_4px_10px_rgba(34,94,87,0.3)] hover:scale-105' 
              : 'cursor-not-allowed bg-slate-300 text-white transform scale-95 shadow-none'
            }
          `}
        >
          <Send size={18} className={canSend ? 'translate-x-[-1px]' : ''} />
        </button>
      </div>
    </div>
  );
}
