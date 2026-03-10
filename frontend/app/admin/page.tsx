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
    <div className="flex flex-col h-screen overflow-y-auto bg-slate-50 relative w-full">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 py-4 md:py-6 px-6 md:px-8 flex items-center justify-between sticky top-0 z-10 pr-16 md:pr-8">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-primary-dark m-0 mb-1">Admin Insights</h1>
          <p className="text-slate-500 text-xs md:text-sm m-0 font-medium">Review completely qualified leads and extracted telemetry.</p>
        </div>
      </header>

      <div className="p-4 md:p-8 flex flex-col gap-8 w-full">
        
        {/* ── Overview Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <StatCard title="Total Leads Tested" value={total} icon={Users} color="var(--color-primary)" bg="var(--color-primary)/10" />
          <StatCard title="Hot Leads" value={hotCount} icon={Flame} color="var(--color-hot)" bg="var(--color-hot)/10" />
          <StatCard title="Cold Leads" value={coldCount} icon={Snowflake} color="var(--color-cold)" bg="var(--color-cold)/10" />
          <StatCard title="Invalid" value={invalidCount} icon={AlertOctagon} color="var(--color-invalid)" bg="var(--color-invalid)/10" />
        </div>

        {/* ── Global Sessions Grid ── */}
        <div className="w-full">
          <h2 className="text-base font-bold text-slate-800 mb-4">Lead Qualification Log</h2>
          {sessions.length === 0 ? (
            <div className="p-10 md:p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-400 font-semibold text-sm">No leads tested yet. Run a session in the Workspace Environment first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 w-full">
              {sessions.map((s, idx) => (
                <div key={idx} style={{
                  background: '#fff', padding: '20px', borderRadius: '12px',
                  border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex', flexDirection: 'column', gap: '16px'
                }}>
                  <div className="flex flex-col">
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {s.leadInfo.name || 'Anonymous Lead'}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`
                        px-2.5 py-1 rounded font-bold text-[11px] border
                        ${s.classification.status === 'Hot' ? 'bg-hot/10 text-hot border-hot/20' : 
                          s.classification.status === 'Cold' ? 'bg-cold/10 text-cold border-cold/20' : 
                          'bg-invalid/10 text-invalid border-invalid/20'}
                      `}>
                        {s.classification.status.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {new Date(s.date).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.5, flex: 1 }}>
                      "{s.classification.summary}"
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 w-24 shrink-0">Source:</span>
                      <span className="text-slate-900 font-medium">{s.leadInfo.source || 'Website'}</span>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 my-4" />

                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[11px] font-bold text-primary-dark uppercase tracking-widest">Metadata</span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    {Object.entries(s.classification.extractedMetadata).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">{k}</span>
                        <span className={`mono-font font-semibold ${v ? 'text-primary' : 'text-slate-400'}`}>
                          {v || 'null'}
                        </span>
                      </div>
                    ))}
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
