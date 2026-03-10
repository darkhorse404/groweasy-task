'use client';

import { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import type { Message } from '../types';

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
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* ── Chat Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3.5 shadow-sm z-10 shrink-0">
        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(43,122,113,0.5)]">
          <Bot size={22} />
        </div>
        <div>
          <p className="text-slate-900 font-bold text-base leading-snug flex items-center">
            {agentName}
            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary-dark rounded-full font-bold">
              AI AGENT
            </span>
          </p>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            {isTyping ? <span className="text-primary">Thinking...</span> : 'Ready to receive leads'}
          </p>
        </div>
      </div>

      {/* ── Message Feed ── */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-6 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-60">
            <Bot size={48} className="text-primary" />
            <p className="text-primary-dark font-semibold text-sm max-w-[280px] text-center">
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
    <div className={`flex mb-1 ${isAI ? 'justify-start animate-slide-in-left' : 'justify-end animate-slide-in-right'}`}>
      <div className={`
        max-w-[70%] px-4 py-3 text-sm leading-relaxed shadow-sm break-words
        ${isAI ? 'rounded-[4px_16px_16px_16px] bg-primary text-white border-none' : 'rounded-[16px_4px_16px_16px] bg-white text-slate-900 border border-slate-200'}
      `}>
        {message.content}
        <span className={`block text-[10px] mt-1.5 text-right font-semibold ${isAI ? 'text-white/70' : 'text-slate-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-2 animate-fade-up">
      <div className="px-4.5 py-3.5 rounded-[4px_16px_16px_16px] bg-primary flex gap-1.5 items-center shadow-sm">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
