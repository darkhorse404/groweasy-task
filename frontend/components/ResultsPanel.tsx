'use client';

import { Activity, Braces, Tag } from 'lucide-react';
import type { Classification, ConversationState } from '../types';

interface ResultsPanelProps {
  classification: Classification | null;
  conversationState: ConversationState;
}

export default function ResultsPanel({ classification, conversationState }: ResultsPanelProps) {
  const isIdle = conversationState === 'idle';
  const isActive = conversationState === 'active';
  const isEnded = conversationState === 'ended';

  return (
    <aside className="w-full h-full flex flex-col bg-white overflow-y-auto">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-primary to-primary-dark p-5 pt-6 text-white shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Activity size={20} />
          <span className="font-bold text-base tracking-wide">
            Live Results Engine
          </span>
        </div>
        <p className="text-xs text-white/75 mt-1">
          Final classification and extracted metadata dump.
        </p>
      </div>

      <div className="p-6 flex flex-col gap-6 flex-1 h-full">
        
        {isIdle && (
          <div className="text-center opacity-60 mt-10">
            <Braces size={40} className="text-primary-light mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Awaiting chat session.</p>
          </div>
        )}

        {isActive && !isEnded && (
          <div className="animate-pulse flex flex-col gap-4 mt-2">
             <p className="text-[13px] text-primary font-bold tracking-wide uppercase">Analyzing telemetry...</p>
             <div className="h-2.5 bg-slate-200 rounded w-4/5" />
             <div className="h-2.5 bg-slate-200 rounded w-3/5" />
             <div className="h-2.5 bg-slate-200 rounded w-11/12" />
          </div>
        )}

        {isEnded && classification && (
          <div className="animate-fade-up flex flex-col h-full">
            <div className="flex items-center gap-2.5 mb-4">
              <span className={`
                px-3 py-1 rounded-full font-extrabold text-[13px] border
                ${classification.status === 'Hot' ? 'bg-hot/10 text-hot border-hot/20' : 
                  classification.status === 'Cold' ? 'bg-cold/10 text-cold border-cold/20' : 
                  'bg-invalid/10 text-invalid border-invalid/20'}
              `}>
                {classification.status.toUpperCase()}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Confidence: {classification.confidence}
              </span>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed mb-6">
              {classification.summary}
            </p>

            <div className="flex items-center gap-1.5 mb-3.5">
              <Tag size={14} className="text-primary" />
              <span className="text-xs font-bold text-primary-dark uppercase tracking-widest">
                Extracted Metadata
              </span>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              {Object.entries(classification.extractedMetadata).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs text-slate-500 font-semibold">{key}</span>
                  <span className={`mono-font text-xs font-semibold ${val ? 'text-primary-dark' : 'text-slate-400'}`}>
                    {val || 'null'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col flex-1 min-h-0">
              <span className="text-[11px] font-bold text-slate-400 mb-2 uppercase block shrink-0">RAW JSON PAYLOAD</span>
              <pre className="mono-font flex-1 p-4 bg-slate-800 text-emerald-400 rounded-lg text-[11px] overflow-auto shadow-inner m-0 min-h-[150px]">
                {JSON.stringify(classification, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
