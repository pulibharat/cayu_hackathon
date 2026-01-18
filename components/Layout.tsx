
import React from 'react';
import { UserRole } from '../types.ts';
import { Logo } from './Logo.tsx';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onHome?: () => void;
  onScan?: () => void;
  onSettings?: () => void;
  activeTab?: 'home' | 'settings';
}

export const Layout: React.FC<LayoutProps> = ({ children, role, onSwitchRole, onHome, onScan, onSettings, activeTab = 'home' }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative overflow-hidden bg-transparent border-x border-slate-200 shadow-2xl">
      {/* Header */}
      <header className="bg-slate-950 text-white p-6 pb-12 rounded-b-[3rem] shadow-2xl relative z-10 overflow-hidden">
        {/* Abstract Technical Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 via-transparent to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onHome}>
            <div className="bg-teal-500/20 p-2.5 rounded-2xl border border-teal-500/30 backdrop-blur-md">
              <Logo size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">VaxEase</h1>
              <div className="flex items-center gap-1.5 opacity-60">
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-bold uppercase tracking-widest">Global Health ID</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onSwitchRole(role === UserRole.NURSE ? UserRole.MIDWIFE : UserRole.NURSE)}
            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.1em] transition-all border border-white/10 backdrop-blur-md"
          >
            Switch to {role === UserRole.NURSE ? 'Monitor' : 'Provider'}
          </button>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg border border-teal-400/30">
             <span className="material-icons-round text-2xl">{role === UserRole.NURSE ? 'medical_services' : 'insights'}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold tracking-tight">{role === UserRole.NURSE ? 'Admin: Mary Ebot' : 'Lead: Sarah Tanyi'}</p>
            <p className="text-[9px] text-teal-400 uppercase tracking-widest font-extrabold mt-0.5">
              {role === UserRole.NURSE ? 'Buea Regional Hospital' : 'Community Outreach Unit'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
             <span className="material-icons-round text-sm opacity-40">chevron_right</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 overflow-y-auto pb-40 -mt-6 z-0 no-scrollbar">
        {children}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] bg-slate-950/90 backdrop-blur-2xl border border-white/10 p-2 flex justify-around items-center rounded-3xl shadow-2xl z-50">
        <button onClick={onHome} className={`flex flex-col items-center transition-all p-3 rounded-2xl ${activeTab === 'home' ? 'text-teal-400 bg-white/5' : 'text-slate-500'}`}>
          <span className="material-icons-round text-2xl">grid_view</span>
          <span className="text-[8px] font-bold uppercase mt-1 tracking-widest">Portal</span>
        </button>
        
        <button onClick={onScan} className="bg-teal-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-teal-500/20 border border-teal-400/50 transition-all active:scale-95">
          <span className="material-icons-round text-3xl">qr_code_scanner</span>
        </button>
        
        <button onClick={onSettings} className={`flex flex-col items-center transition-all p-3 rounded-2xl ${activeTab === 'settings' ? 'text-teal-400 bg-white/5' : 'text-slate-500'}`}>
          <span className="material-icons-round text-2xl">tune</span>
          <span className="text-[8px] font-bold uppercase mt-1 tracking-widest">Settings</span>
        </button>
      </nav>
    </div>
  );
};
