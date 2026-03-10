'use client';

import { useEffect, useState } from 'react';
import { getSavedSessions, type SavedSession } from '../../lib/storage';
import { Users, Flame, Snowflake, AlertOctagon } from 'lucide-react';

export default function AdminInsights() {
  const [sessions, setSessions] = useState<SavedSession[]>([]);

  useEffect(() => {
    setSessions(getSavedSessions());
  }, []);

  const total = sessions.length;
  const hotCount = sessions.filter(s => s.classification.status === 'Hot').length;
  const coldCount = sessions.filter(s => s.classification.status === 'Cold').length;
  const invalidCount = sessions.filter(s => s.classification.status === 'Invalid').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', background: 'var(--bg-app)' }}>
      {/* ── Header ── */}
      <header style={{
        background: '#fff', borderBottom: '1px solid var(--border)',
        padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 4px 0' }}>Admin Insights</h1>
          <p style={{ color: 'var(--text-mid)', fontSize: '14px', margin: 0 }}>Review completely qualified leads and extracted telemetry.</p>
        </div>
      </header>

      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* ── Overview Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <StatCard title="Total Leads Tested" value={total} icon={Users} color="var(--primary)" bg="var(--green-50)" />
          <StatCard title="Hot Leads" value={hotCount} icon={Flame} color="var(--hot)" bg="#fef2f2" />
          <StatCard title="Cold Leads" value={coldCount} icon={Snowflake} color="var(--blue-500)" bg="#eff6ff" />
          <StatCard title="Invalid / SPAM" value={invalidCount} icon={AlertOctagon} color="var(--invalid)" bg="#fef3c7" />
        </div>

        {/* ── Global Sessions Grid ── */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '16px' }}>Lead Qualification Log</h2>
          {sessions.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-light)', fontWeight: 600 }}>No leads tested yet. Run a session in the Test Environment first.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {sessions.map((s, idx) => (
                <div key={idx} style={{
                  background: '#fff', padding: '20px', borderRadius: '12px',
                  border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex', flexDirection: 'column', gap: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>
                        {s.leadInfo.name || 'Anonymous Lead'}
                      </h3>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)', fontWeight: 500 }}>
                        {new Date(s.date).toLocaleString()} • {s.leadInfo.source || 'Direct'}
                      </p>
                    </div>
                    <span style={{
                      background: s.classification.status === 'Hot' ? '#fecaca' : s.classification.status === 'Cold' ? '#cbd5e1' : '#fde68a',
                      color: s.classification.status === 'Hot' ? '#991b1b' : s.classification.status === 'Cold' ? '#334155' : '#92400e',
                      padding: '4px 10px', borderRadius: '12px', fontWeight: 800, fontSize: '11px'
                    }}>
                      {s.classification.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.5, flex: 1 }}>
                    "{s.classification.summary}"
                  </p>

                  <div className="mono-font" style={{
                    background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)',
                    fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-light)' }}>budget:</span>
                      <span style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{s.classification.extractedMetadata.budget || 'null'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-light)' }}>timeline:</span>
                      <span style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{s.classification.extractedMetadata.timeline || 'null'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-light)' }}>propertyType:</span>
                      <span style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{s.classification.extractedMetadata.propertyType || 'null'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-light)' }}>purpose:</span>
                      <span style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{s.classification.extractedMetadata.purpose || 'null'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: number, icon: any, color: string, bg: string }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: '12px',
      padding: '24px', display: 'flex', alignItems: 'center', gap: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px', background: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-mid)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
        <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}
