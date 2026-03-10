'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TerminalSquare, LayoutDashboard } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Test Env', path: '/', icon: TerminalSquare },
    { name: 'Insights', path: '/admin', icon: LayoutDashboard },
  ];

  return (
    <aside style={{
      width: '64px',
      background: 'var(--primary-dark)',
      borderRight: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px',
      gap: '24px',
      flexShrink: 0,
      zIndex: 50,
    }}>
      {/* Logo mark */}
      <div style={{
        width: '40px', height: '40px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--green-400), var(--green-600))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '20px', fontWeight: 800,
        boxShadow: '0 4px 12px rgba(20, 184, 166, 0.4)'
      }}>
        🚀
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          const Icon = link.icon;
          return (
            <Link key={link.path} href={link.path} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              textDecoration: 'none',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              padding: '10px',
              borderRadius: '12px',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'all 0.2s',
            }}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em' }}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
