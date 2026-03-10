'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ConfigPanel from '../components/ConfigPanel';
import ChatPanel from '../components/ChatPanel';
import MessageInput from '../components/MessageInput';
import ResultsPanel from '../components/ResultsPanel';
import ErrorModal from '../components/ErrorModal';
import { startConversation, sendMessage, classifySession } from '../lib/api';
import { saveCompletedSession } from '../lib/storage';
import { UI_TEXT } from '../lib/constants';
import type { Message, LeadInfo, BusinessConfig, Classification, ConversationState, CompletedResponse } from '../types';
import { Settings, MessageCircle, Activity } from 'lucide-react';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [sessionId, setSessionId] = useState<string>('');
  const [turnCount, setTurnCount] = useState(0);
  const [agentName, setAgentName] = useState('GrowEasy AI');
  const [classification, setClassification] = useState<Classification | null>(null);
  
  // Modal Error State
  const [errorModal, setErrorModal] = useState<string | null>(null);
  
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  
  const [activeLeadInfo, setActiveLeadInfo] = useState<LeadInfo | null>(null);
  const [activeConfig, setActiveConfig] = useState<BusinessConfig | null>(null);

  // Mobile Tab State ('config', 'chat', 'results')
  const [mobileTab, setMobileTab] = useState<'config' | 'chat' | 'results'>('chat');

  const appendMessage = useCallback((role: Message['role'], content: string): Message => {
    const msg: Message = { id: generateId(), role, content, timestamp: new Date() };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const timeoutRef = useRef<NodeJS.Timeout| null>(null);
  const timeoutMs = parseInt(process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT_MS || '15000', 10);

  const clearInactivityTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleInactivity = useCallback(async () => {
    if (conversationState !== 'active') return;

    appendMessage('assistant', "Chat ended due to inactivity.");
    setConversationState('ended');
    setIsTyping(true); // Show typing while we get classification

    try {
      const response = await classifySession(sessionId, 'Inactivity') as CompletedResponse;
      setClassification(response.result);
      setMobileTab('results');
      if (activeLeadInfo && activeConfig) {
        saveCompletedSession(sessionId, activeLeadInfo, activeConfig, response.result);
      }
    } catch (err: any) {
      setErrorModal('Failed to finalize session on inactivity: ' + (err.message || 'Unknown error'));
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, conversationState, activeLeadInfo, activeConfig, appendMessage]);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    if (conversationState === 'active' && !isTyping) {
      timeoutRef.current = setTimeout(() => {
        handleInactivity();
      }, timeoutMs);
    }
  }, [conversationState, isTyping, timeoutMs, clearInactivityTimer, handleInactivity]);

  useEffect(() => {
    resetInactivityTimer();
    return () => clearInactivityTimer();
  }, [conversationState, isTyping, messages, resetInactivityTimer, clearInactivityTimer]);

  const handleStart = async (leadInfo: LeadInfo, config: BusinessConfig) => {
    const newSessionId = generateId();
    setSessionId(newSessionId);
    setMessages([]);
    setTurnCount(0);
    setClassification(null);
    setErrorModal(null);
    setSuggestedReplies([]);
    setActiveLeadInfo(leadInfo);
    setActiveConfig(config);
    setConversationState('active');
    setAgentName(config.agentName);
    setIsTyping(true);
    
    // Auto-switch to chat on mobile
    setMobileTab('chat');

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
      setErrorModal(err.response?.data?.error || err.message || 'Failed to connect to AI server.');
    }
  };

  const initialMessageOrGreeting = (info: LeadInfo) => {
    if (info.initialMessage?.trim()) return info.initialMessage;
    return `Hi, my name is ${info.name || 'Anonymous'}, reaching out via ${info.source || 'Website'}.`;
  };

  const handleSend = async (text: string) => {
    if (conversationState !== 'active' || isTyping) return;
    setErrorModal(null);

    appendMessage('user', text);
    setIsTyping(true);
    setSuggestedReplies([]);

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
        
        // Auto-switch to results tab on mobile
        setMobileTab('results');
        
        if (activeLeadInfo && activeConfig) {
          saveCompletedSession(sessionId, activeLeadInfo, activeConfig, response.result);
        }
      }
    } catch (err: any) {
      setIsTyping(false);
      setErrorModal(err.response?.data?.error || err.message || 'Failed to send message.');
    }
  };

  const handleReset = useCallback(() => {
    setMessages([]);
    setSessionId('');
    setTurnCount(0);
    setConversationState('idle');
    setIsTyping(false);
    setClassification(null);
    setErrorModal(null);
    setSuggestedReplies([]);
    setActiveLeadInfo(null);
    setActiveConfig(null);
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-slate-50 relative w-full">
      {/* ── Error Modal ── */}
      {errorModal && <ErrorModal message={errorModal} onClose={() => setErrorModal(null)} />}

      {/* ── Top App Bar ── */}
      <header className="bg-white md:px-6 h-14 flex items-center justify-between border-b border-slate-200 shrink-0 z-10 w-full relative pr-16 md:pr-6">
        <div className="flex items-center">
          <div>
            <p className="text-slate-900 font-extrabold text-base leading-none ">
              {UI_TEXT.headerTitle}
            </p>
            <p className="text-slate-400 text-[11px] mt-0.5 font-semibold">
              {UI_TEXT.headerSubtitle}
            </p>
          </div>
        </div>
        {sessionId && (
          <div className="hidden md:block mono-font text-[11px] text-primary bg-primary/10 px-2.5 py-1 rounded-md">
            SESSION_ID: {sessionId.slice(0, 8)}
          </div>
        )}
      </header>

      {/* ── Mobile Tab Navigation ── */}
      <div className="md:hidden flex border-b border-slate-200 bg-white shrink-0">
        <button 
          onClick={() => setMobileTab('config')}
          className={`flex-1 flex justify-center items-center gap-2 py-3 text-xs font-bold border-b-2 transition-colors ${mobileTab === 'config' ? 'border-primary text-primary-dark bg-primary/5' : 'border-transparent text-slate-500'}`}
        >
          <Settings size={16} /> Config
        </button>
        <button 
          onClick={() => setMobileTab('chat')}
          className={`flex-1 flex justify-center items-center gap-2 py-3 text-xs font-bold border-b-2 transition-colors ${mobileTab === 'chat' ? 'border-primary text-primary-dark bg-primary/5' : 'border-transparent text-slate-500'}`}
        >
          <MessageCircle size={16} /> Chat {conversationState === 'active' && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
        </button>
        <button 
          onClick={() => setMobileTab('results')}
          className={`flex-1 flex justify-center items-center gap-2 py-3 text-xs font-bold border-b-2 transition-colors ${mobileTab === 'results' ? 'border-primary text-primary-dark bg-primary/5' : 'border-transparent text-slate-500'}`}
        >
          <Activity size={16} /> Results {classification && <span className="w-2 h-2 rounded-full bg-hot" />}
        </button>
      </div>

      {/* ── Main Responsive Content ── */}
      <div className="flex-1 flex overflow-hidden w-full relative">

        {/* 1. Left Panel (Config) */}
        <div className={`
          ${mobileTab === 'config' ? 'flex' : 'hidden'} 
          md:flex flex-col h-full w-full md:w-[380px] md:min-w-[320px] 
          border-r border-slate-200 bg-white shrink-0 overflow-y-auto
        `}>
          <div className="-mx-[0px] h-full">
            <ConfigPanel
              onStart={handleStart}
              onReset={handleReset}
              conversationState={conversationState}
              turnCount={turnCount}
            />
          </div>
        </div>

        {/* 2. Center Panel (Chat) */}
        <div className={`
          ${mobileTab === 'chat' ? 'flex' : 'hidden'} 
          md:flex flex-col flex-1 h-full min-w-0 overflow-hidden bg-slate-50 relative
        `}>
          <ChatPanel messages={messages} isTyping={isTyping} agentName={agentName} />
          
          <MessageInput
            onSend={handleSend}
            isTyping={isTyping}
            conversationState={conversationState}
            suggestedReplies={suggestedReplies}
          />
        </div>

        {/* 3. Right Panel (Results) */}
        <div className={`
          ${mobileTab === 'results' ? 'flex' : 'hidden'} 
          md:flex flex-col h-full w-full md:w-[380px] md:min-w-[340px] 
          border-l border-slate-200 bg-white shrink-0 overflow-y-auto
        `}>
          <div className="-mx-[0px] h-full">
            <ResultsPanel classification={classification} conversationState={conversationState} />
          </div>
        </div>
        
      </div>
    </div>
  );
}
