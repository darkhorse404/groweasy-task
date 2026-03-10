'use client';

import { useState, useCallback } from 'react';
import ConfigPanel from '../components/ConfigPanel';
import ChatPanel from '../components/ChatPanel';
import MessageInput from '../components/MessageInput';
import { startConversation, sendMessage } from '../lib/api';
import type {
  Message,
  LeadInfo,
  BusinessConfig,
  Classification,
  ConversationState,
} from '../types';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [sessionId, setSessionId] = useState<string>('');
  const [turnCount, setTurnCount] = useState(0);
  const [agentName, setAgentName] = useState('Priya');
  const [classification, setClassification] = useState<Classification | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Append a message to the feed ────────────────────────────────────────────
  const appendMessage = useCallback((role: Message['role'], content: string): Message => {
    const msg: Message = { id: generateId(), role, content, timestamp: new Date() };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  // ── START Conversation (`/api/chat/start`) ──────────────────────────────────
  const handleStart = async (leadInfo: LeadInfo, config: BusinessConfig) => {
    const newSessionId = generateId();
    setSessionId(newSessionId);
    setMessages([]);
    setTurnCount(0);
    setClassification(null);
    setError(null);
    setConversationState('active');
    setAgentName(config.agentName);
    setIsTyping(true);

    try {
      // Phase 1 + 2: Init and Greet
      const initialReq = initialMessageOrGreeting(leadInfo);
      appendMessage('user', initialReq);

      const response = await startConversation(newSessionId, config, leadInfo);

      setIsTyping(false);
      appendMessage('assistant', response.message);
      setTurnCount(1); // 1 turn complete (User sent context -> AI greeted)
    } catch (err: any) {
      setIsTyping(false);
      setConversationState('idle');
      const msg = err.response?.data?.error || err.message || 'Failed to connect.';
      setError(msg);
    }
  };

  const initialMessageOrGreeting = (info: LeadInfo) => {
    if (info.initialMessage?.trim()) return info.initialMessage;
    return `Hi, my name is ${info.name || 'Anonymous'}, reaching out via ${info.source || 'Website'}.`;
  };

  // ── SEND Message (`/api/chat/send`) ─────────────────────────────────────────
  const handleSend = async (text: string) => {
    if (conversationState !== 'active' || isTyping) return;
    setError(null);

    appendMessage('user', text);
    setIsTyping(true);

    try {
      // Phase 3: Conversational Loop
      const response = await sendMessage(sessionId, text);

      setIsTyping(false);
      setTurnCount((prev) => prev + 1);

      if (response.status === 'chatting') {
        appendMessage('assistant', response.message);
      } else if (response.status === 'completed') {
        // Phase 4 + 5: Chat ended, Result ready
        setConversationState('ended');
        setClassification(response.result);
      }
    } catch (err: any) {
      setIsTyping(false);
      const msg = err.response?.data?.error || err.message || 'Error communicating with agent.';
      setError(msg);
    }
  };

  // ── RESET ───────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setMessages([]);
    setSessionId('');
    setTurnCount(0);
    setConversationState('idle');
    setIsTyping(false);
    setClassification(null);
    setError(null);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-app)',
    }}>
      {/* ── Top App Bar ──────────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(90deg, var(--blue-900), var(--blue-700))',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>🏡</div>
          <div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: '15px', lineHeight: 1 }}>
              Lead Qualifier
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginTop: '2px' }}>
              AI-powered WhatsApp Lead Qualification System
            </p>
          </div>
        </div>

        {sessionId && (
          <div style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'monospace',
          }}>
            Session: {sessionId.slice(0, 12)}…
          </div>
        )}
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left Panel */}
        <ConfigPanel
          onStart={handleStart}
          onReset={handleReset}
          conversationState={conversationState}
          turnCount={turnCount}
        />

        {/* Right Panel: Chat + Input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Error Banner */}
          {error && (
            <div style={{
              background: '#fef2f2',
              borderBottom: '1px solid #fecaca',
              padding: '10px 20px',
              color: '#dc2626',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Classification Banner (Phase 5 Visual Confirmation) */}
          {classification && conversationState === 'ended' && (
            <div className="animate-fade-up" style={{
              background: '#f8fafc',
              borderBottom: '1px solid var(--border)',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              zIndex: 5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '8px',
                  background: classification.status === 'Hot' ? '#fef2f2' : classification.status === 'Cold' ? '#f1f5f9' : '#fef3c7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                }}>
                  {classification.status === 'Hot' ? '🔥' : classification.status === 'Cold' ? '🧊' : '❌'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-dark)' }}>Classification Complete</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-mid)' }}>Lead evaluated as <strong style={{
                    color: classification.status === 'Hot' ? 'var(--hot)' : classification.status === 'Cold' ? 'var(--cold)' : 'var(--invalid)'
                  }}>{classification.status}</strong></p>
                </div>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-dark)', marginBottom: '16px', lineHeight: 1.5 }}>
                {classification.summary}
              </p>

              {/* Extracted Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(classification.extractedMetadata).map(([key, val]) => (
                  <span key={key} style={{
                    background: val ? 'var(--blue-50)' : '#f1f5f9',
                    color: val ? 'var(--blue-700)' : 'var(--text-light)',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    border: `1px solid ${val ? 'var(--blue-200)' : 'var(--border)'}`,
                  }}>
                    {key}: {val || 'Unknown'}
                  </span>
                ))}
              </div>
            </div>
          )}

          <ChatPanel
            messages={messages}
            isTyping={isTyping}
            agentName={agentName}
          />

          <MessageInput
            onSend={handleSend}
            isTyping={isTyping}
            conversationState={conversationState}
          />
        </div>
      </div>
    </div>
  );
}
