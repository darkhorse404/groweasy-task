'use client';

import { Activity, Braces, Tag } from 'lucide-react';
import type { Classification, ConversationState } from '../../types';

interface ResultsPanelProps {
  classification: Classification | null;
  conversationState: ConversationState;
}

export default function ResultsPanel({ classification, conversationState }: ResultsPanelProps) {
  const isIdle = conversationState === 'idle';
  const isActive = conversationState === 'active';
  const isEnded = conversationState === 'ended';

  return (
    <aside style={{
      width: '380px', minWidth: '340px',
      background: 'var(--bg-panel)', borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto'
    }}>
      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-700), var(--green-900))',
        padding: '24px 20px 20px', color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Activity size={20} />
          <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '0.02em' }}>
            Live Results Engine
          </span>
        </div>
        <p style={{ fontSize: '12px', opacity: 0.75, marginTop: '4px' }}>
          Final classification and extracted metadata dump.
        </p>
      </div>

      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {isIdle && (
          <div style={{ textAlign: 'center', opacity: 0.6, marginTop: '40px' }}>
            <Braces size={40} color="var(--primary-light)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>Awaiting chat session.</p>
          </div>
        )}

        {isActive && !isEnded && (
          <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <p style={{ fontSize: '13px', color: 'var(--primary-light)', fontWeight: 600 }}>Analyzing telemetry...</p>
             <div style={{ height: '10px', background: 'var(--border)', borderRadius: '4px', width: '80%' }} />
             <div style={{ height: '10px', background: 'var(--border)', borderRadius: '4px', width: '60%' }} />
             <div style={{ height: '10px', background: 'var(--border)', borderRadius: '4px', width: '90%' }} />
          </div>
        )}

        {isEnded && classification && (
          <div className="animate-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{
                background: classification.status === 'Hot' ? '#fef2f2' : classification.status === 'Cold' ? '#f1f5f9' : '#fef3c7',
                color: classification.status === 'Hot' ? 'var(--hot)' : classification.status === 'Cold' ? 'var(--cold)' : 'var(--invalid)',
                padding: '4px 12px', borderRadius: '16px', fontWeight: 800, fontSize: '13px',
                border: `1px solid ${classification.status === 'Hot' ? '#fecaca' : classification.status === 'Cold' ? '#cbd5e1' : '#fde68a'}`
              }}>
                {classification.status.toUpperCase()}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-mid)', fontWeight: 600 }}>
                Confidence: {classification.confidence}
              </span>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-dark)', lineHeight: 1.5, marginBottom: '24px' }}>
              {classification.summary}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
              <Tag size={14} color="var(--primary)" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase' }}>
                Extracted Metadata
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(classification.extractedMetadata).map(([key, val]) => (
                <div key={key} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '10px 14px',
                  background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-mid)', fontWeight: 600 }}>{key}</span>
                  <span className="mono-font" style={{ fontSize: '12px', color: val ? 'var(--primary-dark)' : 'var(--text-light)', fontWeight: 600 }}>
                    {val || 'null'}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', marginBottom: '8px', display: 'block' }}>RAW JSON PAYLOAD</span>
              <pre className="mono-font" style={{
                padding: '16px', background: '#1e293b', color: '#10b981',
                borderRadius: '8px', fontSize: '11px', overflowX: 'auto'
              }}>
                {JSON.stringify(classification, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
