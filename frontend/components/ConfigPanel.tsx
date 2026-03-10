'use client';

import { useState } from 'react';
import { Settings, User, Building2, RefreshCw, Play, Code2, LayoutTemplate } from 'lucide-react';
import type { LeadInfo, BusinessConfig, ConversationState } from '../../types';

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
};

export default function ConfigPanel({
  onStart, onReset, conversationState, turnCount,
}: ConfigPanelProps) {
  const [mode, setMode] = useState<'ui' | 'json'>('ui');
  const [jsonText, setJsonText] = useState(JSON.stringify(DEFAULT_CONFIG, null, 2));
  const [jsonError, setJsonError] = useState('');

  const [leadName, setLeadName] = useState('');
  const [leadSource, setLeadSource] = useState('Website');
  const [initialMsg, setInitialMsg] = useState('');
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT_CONFIG);

  const isActive = conversationState === 'active';

  // Sync UI to JSON when switching to JSON mode
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
      setConfig(parsed); // Sync JSON back to UI state behind the scenes
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
    <aside style={{
      width: '380px', minWidth: '320px',
      background: 'var(--bg-panel)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto'
    }}>
      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
        padding: '24px 20px 20px', color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} />
            <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '0.02em' }}>
              Input Parameters
            </span>
          </div>
          {/* Modes Toggle */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '2px' }}>
            <button onClick={() => handleToggleMode('ui')} style={toggleBtnStyle(mode === 'ui')}>
              <LayoutTemplate size={13} /> UI
            </button>
            <button onClick={() => handleToggleMode('json')} style={toggleBtnStyle(mode === 'json')}>
              <Code2 size={13} /> JSON
            </button>
          </div>
        </div>
        <p style={{ fontSize: '12px', opacity: 0.75, marginTop: '8px' }}>
          Configure lead state and business override payload.
        </p>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>

        {/* ── Lead Info (Always UI) ── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <User size={15} color="var(--primary)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Lead Context
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Lead Name</label>
              <input type="text" value={leadName} onChange={e => setLeadName(e.target.value)} disabled={isActive} style={inputStyle(isActive)} placeholder="Rohit" />
            </div>
            <div>
              <label style={labelStyle}>Source</label>
              <input type="text" value={leadSource} onChange={e => setLeadSource(e.target.value)} disabled={isActive} style={inputStyle(isActive)} placeholder="Website" />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <label style={labelStyle}>Initial Message</label>
            <textarea value={initialMsg} onChange={e => setInitialMsg(e.target.value)} disabled={isActive} rows={2} style={{ ...inputStyle(isActive), resize: 'none' }} placeholder="Looking for a flat..." />
          </div>
        </section>

        <Divider />

        {/* ── Business Config (UI or JSON) ── */}
        <section style={{ display: 'flex', flexDirection: 'column', flex: mode === 'json' ? 1 : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Building2 size={15} color="var(--primary)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Business Config
            </span>
            {jsonError && <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--hot)', fontWeight: 600 }}>{jsonError}</span>}
          </div>

          {mode === 'ui' ? (
            <>
              <label style={labelStyle}>Business Name</label>
              <input type="text" value={config.businessName} onChange={e => setConfig(c => ({ ...c, businessName: e.target.value }))} disabled={isActive} style={inputStyle(isActive)} />
              <label style={{ ...labelStyle, marginTop: '12px' }}>Agent Name</label>
              <input type="text" value={config.agentName} onChange={e => setConfig(c => ({ ...c, agentName: e.target.value }))} disabled={isActive} style={inputStyle(isActive)} />
              <label style={{ ...labelStyle, marginTop: '12px' }}>Industry</label>
              <input type="text" value={config.industry} onChange={e => setConfig(c => ({ ...c, industry: e.target.value }))} disabled={isActive} style={inputStyle(isActive)} />
            </>
          ) : (
            <textarea
              className="mono-font"
              value={jsonText}
              onChange={handleJsonChange}
              disabled={isActive}
              spellCheck={false}
              style={{
                width: '100%', flex: 1, minHeight: '200px', padding: '12px',
                background: '#1e293b', color: '#10b981', borderRadius: '8px',
                border: jsonError ? '1px solid var(--hot)' : '1px solid transparent',
                fontSize: '12px', outline: 'none', resize: 'none'
              }}
            />
          )}
        </section>

        {/* ── Action Buttons ── */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleStart}
            disabled={isActive || !!jsonError}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '8px', border: 'none',
              cursor: (isActive || !!jsonError) ? 'not-allowed' : 'pointer',
              background: (isActive || !!jsonError) ? '#cbd5e1' : 'linear-gradient(135deg, var(--primary-light), var(--primary))',
              color: '#fff', fontWeight: 700, fontSize: '14px', transition: 'all 0.2s ease',
            }}
          >
            <Play size={15} fill="currentColor" /> Initialize Conversation
          </button>
        </div>
      </div>
    </aside>
  );
}

const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: '4px',
  padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
  background: active ? '#fff' : 'transparent', color: active ? 'var(--primary-dark)' : 'rgba(255,255,255,0.7)',
  fontSize: '11px', fontWeight: 600, transition: 'all 0.2s',
});

function Divider() { return <div style={{ height: '1px', background: 'var(--border)', margin: '0 -20px' }} />; }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-mid)', marginBottom: '6px' };
const inputStyle = (disabled: boolean): React.CSSProperties => ({
  width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px',
  background: disabled ? '#f8fafc' : '#fff', color: 'var(--text-dark)', outline: 'none',
});
