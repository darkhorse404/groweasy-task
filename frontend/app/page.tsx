'use client';

import { useState, useCallback } from 'react';
import ConfigPanel from '../components/ConfigPanel';
import ChatPanel from '../components/ChatPanel';
import MessageInput from '../components/MessageInput';
import ResultsPanel from '../components/ResultsPanel';
import { startConversation, sendMessage } from '../lib/api';
import { saveCompletedSession } from '../lib/storage';
import type { Message, LeadInfo, BusinessConfig, Classification, ConversationState } from '../types';

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
  
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  
  // Track active payload to save history at the end
  const [activeLeadInfo, setActiveLeadInfo] = useState<LeadInfo | null>(null);
  const [activeConfig, setActiveConfig] = useState<BusinessConfig | null>(null);

  const appendMessage = useCallback((role: Message['role'], content: string): Message => {
    const msg: Message = { id: generateId(), role, content, timestamp: new Date() };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const handleStart = async (leadInfo: LeadInfo, config: BusinessConfig) => {
    const newSessionId = generateId();
    setSessionId(newSessionId);
    setMessages([]);
    setTurnCount(0);
    setClassification(null);
    setError(null);
    setSuggestedReplies([]);
    setActiveLeadInfo(leadInfo);
    setActiveConfig(config);
    setConversationState('active');
    setAgentName(config.agentName);
    setIsTyping(true);

    try {
      const initialReq = initialMessageOrGreeting(leadInfo);
      appendMessage('user', initialReq);

      const response = await startConversation(newSessionId, config, leadInfo);

      setIsTyping(false);
      appendMessage('assistant', response.message);
      setSuggestedReplies(response.suggested_replies || []);
      setTurnCount(1);
    } catch (err: any) {
      setIsTyping(false);
      setConversationState('idle');
      setError(err.response?.data?.error || err.message || 'Failed to connect.');
    }
  };

  const initialMessageOrGreeting = (info: LeadInfo) => {
    if (info.initialMessage?.trim()) return info.initialMessage;
    return `Hi, my name is ${info.name || 'Anonymous'}, reaching out via ${info.source || 'Website'}.`;
  };

  const handleSend = async (text: string) => {
    if (conversationState !== 'active' || isTyping) return;
    setError(null);

    appendMessage('user', text);
    setIsTyping(true);
    setSuggestedReplies([]); // clear fast

    try {
      const response = await sendMessage(sessionId, text);
      setIsTyping(false);
      setTurnCount((prev) => prev + 1);

      if (response.status === 'chatting') {
        appendMessage('assistant', response.message);
        setSuggestedReplies(response.suggested_replies || []);
      } else if (response.status === 'completed') {
        setConversationState('ended');
        setClassification(response.result);
        
        // Save to Admin History / Session Storage
        if (activeLeadInfo && activeConfig) {
          saveCompletedSession(sessionId, activeLeadInfo, activeConfig, response.result);
        }
      }
    } catch (err: any) {
      setIsTyping(false);
      setError(err.response?.data?.error || err.message || 'Error communicating with agent.');
    }
  };

  const handleReset = useCallback(() => {
    setMessages([]);
    setSessionId('');
    setTurnCount(0);
    setConversationState('idle');
    setIsTyping(false);
    setClassification(null);
    setError(null);
    setSuggestedReplies([]);
    setActiveLeadInfo(null);
    setActiveConfig(null);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-app)' }}>
      {/* ── Top App Bar ── */}
      <header style={{
        background: '#fff', padding: '0 24px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)', flexShrink: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <p style={{ color: 'var(--text-dark)', fontWeight: 800, fontSize: '16px', lineHeight: 1 }}>
              Test Environment
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '11px', marginTop: '2px', fontWeight: 600 }}>
              Build & Simulate AI Dialogs
            </p>
          </div>
        </div>
        {sessionId && (
          <div className="mono-font" style={{ fontSize: '11px', color: 'var(--primary-light)', background: 'var(--green-50)', padding: '4px 8px', borderRadius: '4px' }}>
            SESSION_ID: {sessionId.slice(0, 8)}
          </div>
        )}
      </header>

      {/* ── Main 3 Column Content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* 1. Left Panel (Input / JSON Toggle) */}
        <ConfigPanel
          onStart={handleStart}
          onReset={handleReset}
          conversationState={conversationState}
          turnCount={turnCount}
        />

        {/* 2. Center Panel: Chat + Input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {error && (
            <div style={{
              background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '10px 20px',
              color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 20
            }}>
              ⚠️ {error}
            </div>
          )}

          <ChatPanel messages={messages} isTyping={isTyping} agentName={agentName} />

          <MessageInput
            onSend={handleSend}
            isTyping={isTyping}
            conversationState={conversationState}
            suggestedReplies={suggestedReplies}
          />
        </div>

        {/* 3. Right Panel: Live JSON Metadata Results */}
        <ResultsPanel classification={classification} conversationState={conversationState} />
        
      </div>
    </div>
  );
}
