'use client';

import { useState } from 'react';
import { Settings, User, Building2, Play, Code2, LayoutTemplate } from 'lucide-react';
import type { LeadInfo, BusinessConfig, ConversationState } from '../types';

interface ConfigPanelProps {
  onStart: (leadInfo: LeadInfo, config: BusinessConfig) => void;
  onReset: () => void;
  conversationState: ConversationState;
  turnCount: number;
}

const DEFAULT_CONFIG: BusinessConfig = {
  businessName: 'Prestige Realty Group',
  agentName: 'Priya',
  industry: 'Real Estate',
  location: 'Pune',
  qualifyingQuestions: [
    "What is your budget for the property?",
    "Are you looking for 2BHK or 3BHK?",
    "When are you planning to move in?"
  ],
  rules: "Be polite. Do not reveal you are an AI. Always try to ask the qualifying questions naturally."
};

export default function ConfigPanel({
  onStart, conversationState,
}: ConfigPanelProps) {
  const [mode, setMode] = useState<'ui' | 'json'>('ui');
  const [jsonText, setJsonText] = useState(JSON.stringify(DEFAULT_CONFIG, null, 2));
  const [jsonError, setJsonError] = useState('');

  const [leadName, setLeadName] = useState('');
  const [leadSource, setLeadSource] = useState('Website');
  const [initialMsg, setInitialMsg] = useState('');
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT_CONFIG);

  const isActive = conversationState === 'active';

  const handleToggleMode = (newMode: 'ui' | 'json') => {
    if (newMode === 'json') {
      setJsonText(JSON.stringify(config, null, 2));
      setJsonError('');
    }
    setMode(newMode);
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setConfig(parsed);
      setJsonError('');
    } catch {
      setJsonError('Invalid JSON format');
    }
  };

  const handleStart = () => {
    if (conversationState !== 'idle' || jsonError) return;
    onStart(
      { name: leadName.trim(), source: leadSource.trim(), initialMessage: initialMsg.trim() },
      config
    );
  };

  return (
    <aside className="w-full flex flex-col h-full bg-white overflow-y-auto">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-primary-dark to-primary p-5 pt-6 text-white shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings size={20} />
            <span className="font-bold text-base tracking-wide">
              Input Parameters
            </span>
          </div>
          {/* Modes Toggle */}
          <div className="flex bg-black/20 rounded-md p-0.5">
            <button 
              onClick={() => handleToggleMode('ui')} 
              className={`flex items-center gap-1 px-2 py-1 rounded border-none cursor-pointer text-[11px] font-semibold transition-colors ${mode === 'ui' ? 'bg-white text-primary-dark' : 'bg-transparent text-white/70 hover:text-white'}`}
            >
              <LayoutTemplate size={13} /> UI
            </button>
            <button 
              onClick={() => handleToggleMode('json')} 
              className={`flex items-center gap-1 px-2 py-1 rounded border-none cursor-pointer text-[11px] font-semibold transition-colors ${mode === 'json' ? 'bg-white text-primary-dark' : 'bg-transparent text-white/70 hover:text-white'}`}
            >
              <Code2 size={13} /> JSON
            </button>
          </div>
        </div>
        <p className="text-xs text-white/75 mt-2">
          Configure lead state and business override payload.
        </p>
      </div>

      <div className="p-5 flex flex-col gap-6 flex-1 h-full">

        {/* ── Lead Info (Always UI) ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <User size={15} className="text-primary" />
            <span className="text-[13px] font-bold text-primary-dark uppercase tracking-wider">
              Lead Context
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Lead Name</label>
              <input 
                type="text" value={leadName} onChange={e => setLeadName(e.target.value)} 
                disabled={isActive} placeholder="Rohit" 
                className={`w-full px-3 py-2 rounded-md border text-[13px] outline-none transition-colors ${isActive ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white border-slate-200 text-slate-900 focus:border-primary'}`} 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Source</label>
              <input 
                type="text" value={leadSource} onChange={e => setLeadSource(e.target.value)} 
                disabled={isActive} placeholder="Website" 
                className={`w-full px-3 py-2 rounded-md border text-[13px] outline-none transition-colors ${isActive ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white border-slate-200 text-slate-900 focus:border-primary'}`} 
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Initial Message</label>
            <textarea 
              value={initialMsg} onChange={e => setInitialMsg(e.target.value)} 
              disabled={isActive} rows={2} 
              className={`w-full px-3 py-2 rounded-md border text-[13px] outline-none resize-none transition-colors ${isActive ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white border-slate-200 text-slate-900 focus:border-primary'}`} 
              placeholder="Looking for a flat..." 
            />
          </div>
        </section>

        <div className="h-px bg-slate-200 -mx-5" />

        {/* ── Business Config (UI or JSON) ── */}
        <section className={`flex flex-col ${mode === 'json' ? 'flex-1' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={15} className="text-primary" />
            <span className="text-[13px] font-bold text-primary-dark uppercase tracking-wider">
              Business Config
            </span>
          </div>

          {mode === 'ui' ? (
            <>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Business Name</label>
              <input type="text" value={config.businessName} onChange={e => setConfig(c => ({ ...c, businessName: e.target.value }))} disabled={isActive} className={`w-full px-3 py-2 rounded-md border text-[13px] outline-none transition-colors ${isActive ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white border-slate-200 text-slate-900 focus:border-primary'}`} />
              
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 mt-3">Agent Name</label>
              <input type="text" value={config.agentName} onChange={e => setConfig(c => ({ ...c, agentName: e.target.value }))} disabled={isActive} className={`w-full px-3 py-2 rounded-md border text-[13px] outline-none transition-colors ${isActive ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white border-slate-200 text-slate-900 focus:border-primary'}`} />
              
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 mt-3">Industry</label>
              <input type="text" value={config.industry} onChange={e => setConfig(c => ({ ...c, industry: e.target.value }))} disabled={isActive} className={`w-full px-3 py-2 rounded-md border text-[13px] outline-none transition-colors ${isActive ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white border-slate-200 text-slate-900 focus:border-primary'}`} />

              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 mt-3">Location (Optional)</label>
              <input type="text" value={config.location || ''} onChange={e => setConfig(c => ({ ...c, location: e.target.value }))} disabled={isActive} className={`w-full px-3 py-2 rounded-md border text-[13px] outline-none transition-colors ${isActive ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white border-slate-200 text-slate-900 focus:border-primary'}`} />

              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 mt-3">Qualifying Questions (One per line)</label>
              <textarea 
                value={(config.qualifyingQuestions || []).join('\n')} 
                onChange={e => setConfig(c => ({ ...c, qualifyingQuestions: e.target.value.split('\n').filter(q => q.trim() !== '') }))} 
                disabled={isActive} rows={3} 
                className={`w-full px-3 py-2 rounded-md border text-[13px] outline-none resize-none transition-colors ${isActive ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white border-slate-200 text-slate-900 focus:border-primary'}`} 
              />

              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 mt-3">Rules / Guardrails (Optional)</label>
              <textarea 
                value={config.rules || ''} onChange={e => setConfig(c => ({ ...c, rules: e.target.value }))} 
                disabled={isActive} rows={3} 
                className={`w-full px-3 py-2 rounded-md border text-[13px] outline-none resize-none transition-colors ${isActive ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white border-slate-200 text-slate-900 focus:border-primary'}`} 
              />
            </>
          ) : (
            <div className="flex flex-col flex-1 gap-3 h-full min-h-0">
              {jsonError && (
                <div className="animate-fade-up bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col gap-1 shrink-0">
                  <span className="text-red-600 text-[13px] font-extrabold">Syntax Error</span>
                  <span className="text-red-700 text-xs font-medium">{jsonError}. Please fix the JSON formatting to continue.</span>
                </div>
              )}
              <textarea
                className={`mono-font w-full flex-1 min-h-[160px] p-4 bg-slate-800 text-emerald-400 rounded-lg text-[13px] outline-none resize-none shadow-inner ${jsonError ? 'border border-red-500' : 'border border-transparent focus:border-primary/50'}`}
                value={jsonText}
                onChange={handleJsonChange}
                disabled={isActive}
                spellCheck={false}
              />
            </div>
          )}
        </section>

        {/* ── Action Buttons ── */}
        <div className="mt-auto pb-6 flex flex-col gap-2.5 pt-4 shrink-0">
          <button
            onClick={handleStart}
            disabled={isActive || !!jsonError}
            className={`
              flex items-center justify-center gap-2 p-3 rounded-lg border-none font-bold text-sm transition-colors
              ${(isActive || !!jsonError) 
                ? 'cursor-not-allowed bg-slate-300 text-white' 
                : 'cursor-pointer bg-gradient-to-br from-primary to-primary-dark text-white hover:from-primary-light hover:to-primary shadow-sm'}
            `}
          >
            <Play size={15} fill="currentColor" /> Initialize Conversation
          </button>
        </div>
      </div>
    </aside>
  );
}
