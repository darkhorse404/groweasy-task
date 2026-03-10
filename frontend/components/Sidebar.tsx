'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TerminalSquare, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Work space', path: '/', icon: TerminalSquare },
    { name: 'Insights', path: '/admin', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Mobile Hamburger Toggle (floating) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-3 right-4 z-40 bg-white p-2 rounded-lg shadow-md border border-slate-200 text-slate-700"
      >
        <Menu size={24} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 
        w-[72px] bg-[#173f3a] border-r border-white/10
        flex md:flex flex-col items-center pt-5 gap-6 shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Close button for mobile inside sidebar */}
        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute -right-10 top-4 bg-[#173f3a] text-white p-2 rounded-r-lg shadow-lg"
          >
            <X size={20} />
          </button>
        )}

        {/* Logo mark */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center text-white text-xl font-extrabold shadow-[0_4px_12px_rgba(34,94,87,0.4)]">
          🚀
        </div>

        <nav className="flex flex-col gap-4 mt-5 w-full px-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            const Icon = link.icon;
            return (
              <Link key={link.path} href={link.path} onClick={() => setIsOpen(false)} className={`
                flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 decoration-none
                ${isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}
              `}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-semibold tracking-wider text-center">
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
