'use client';

import { useState } from 'react';
import { Settings, User, Building2, RefreshCw, Play } from 'lucide-react';
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
  onStart,
  onReset,
  conversationState,
  turnCount,
}: ConfigPanelProps) {
  const [leadName, setLeadName] = useState('');
  const [leadSource, setLeadSource] = useState('Website');
  const [initialMsg, setInitialMsg] = useState('');
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT_CONFIG);

  const handleStart = () => {
    if (conversationState !== 'idle') return;
    onStart(
      { name: leadName.trim(), source: leadSource.trim(), initialMessage: initialMsg.trim() },
      config
    );
  };

  const handleReset = () => {
    setLeadName('');
    setLeadSource('Website');
    setInitialMsg('');
    setConfig(DEFAULT_CONFIG);
    onReset();
  };

  const isActive = conversationState === 'active';

  return (
    <aside
      style={{
        width: '360px',
        minWidth: '320px',
        background: 'var(--bg-panel)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--blue-700), var(--blue-900))',
        padding: '24px 20px 20px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Settings size={20} />
          <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '0.02em' }}>
            Dev / Config Tools
          </span>
        </div>
        <p style={{ fontSize: '12px', opacity: 0.75, marginTop: '4px' }}>
          Configure the bot and lead info before starting a session.
        </p>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>

        {/* ── Lead Info ──────────────────────────────────────────────── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <User size={15} color="var(--blue-600)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--blue-700)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Lead Info
            </span>
          </div>

          <label style={labelStyle}>Lead Name (optional)</label>
          <input
            type="text"
            value={leadName}
            onChange={(e) => setLeadName(e.target.value)}
            placeholder="e.g. Rohit"
            disabled={isActive}
            style={inputStyle(isActive)}
          />

          <label style={{ ...labelStyle, marginTop: '12px' }}>Source (optional)</label>
          <input
            type="text"
            value={leadSource}
            onChange={(e) => setLeadSource(e.target.value)}
            placeholder="e.g. Website"
            disabled={isActive}
            style={inputStyle(isActive)}
          />

          <label style={{ ...labelStyle, marginTop: '12px' }}>Initial Message (optional)</label>
          <textarea
            value={initialMsg}
            onChange={(e) => setInitialMsg(e.target.value)}
            placeholder="e.g. Looking for a flat in Pune"
            disabled={isActive}
            rows={3}
            style={{ ...inputStyle(isActive), resize: 'none' }}
          />
        </section>

        <Divider />

        {/* ── Business Config ────────────────────────────────────────── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Building2 size={15} color="var(--blue-600)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--blue-700)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Business Config
            </span>
          </div>

          <label style={labelStyle}>Business Name</label>
          <input
            type="text"
            value={config.businessName}
            onChange={(e) => setConfig((c) => ({ ...c, businessName: e.target.value }))}
            disabled={isActive}
            style={inputStyle(isActive)}
          />

          <label style={{ ...labelStyle, marginTop: '12px' }}>Agent Name</label>
          <input
            type="text"
            value={config.agentName}
            onChange={(e) => setConfig((c) => ({ ...c, agentName: e.target.value }))}
            disabled={isActive}
            style={inputStyle(isActive)}
          />

          <label style={{ ...labelStyle, marginTop: '12px' }}>Industry</label>
          <input
            type="text"
            value={config.industry}
            onChange={(e) => setConfig((c) => ({ ...c, industry: e.target.value }))}
            disabled={isActive}
            style={inputStyle(isActive)}
          />
        </section>

        <Divider />

        {/* ── Session Stats ──────────────────────────────────────────── */}
        <section>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Session Stats
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <StatChip label="Status" value={
              conversationState === 'idle' ? 'Idle'
              : conversationState === 'active' ? 'Active'
              : 'Ended'
            } color={
              conversationState === 'active' ? '#22c55e'
              : conversationState === 'ended' ? 'var(--blue-600)'
              : 'var(--text-light)'
            } />
            <StatChip label="Turns" value={String(turnCount)} color="var(--blue-600)" />
          </div>
        </section>

        {/* ── Action Buttons ─────────────────────────────────────────── */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleStart}
            disabled={isActive}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              cursor: isActive ? 'not-allowed' : 'pointer',
              background: isActive
                ? '#cbd5e1'
                : 'linear-gradient(135deg, var(--blue-600), var(--blue-800))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? 'none' : '0 4px 12px rgba(37,99,235,0.35)',
            }}
          >
            <Play size={15} />
            Start New Conversation
          </button>

          <button
            onClick={handleReset}
            disabled={conversationState === 'idle'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '11px',
              borderRadius: '10px',
              border: '1.5px solid var(--border)',
              cursor: conversationState === 'idle' ? 'not-allowed' : 'pointer',
              background: '#fff',
              color: conversationState === 'idle' ? 'var(--text-light)' : 'var(--blue-700)',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={14} />
            Reset Session
          </button>
        </div>
      </div>
    </aside>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: 'var(--border)', margin: '0 -20px' }} />;
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: 'var(--bg-app)',
      borderRadius: '8px',
      padding: '10px 12px',
      border: '1px solid var(--border)',
    }}>
      <p style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '16px', fontWeight: 800, color }}>{value}</p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-mid)',
  marginBottom: '6px',
};

const inputStyle = (disabled: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1.5px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text-dark)',
  background: disabled ? '#f8fafc' : '#fff',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit',
});
