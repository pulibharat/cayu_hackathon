
import React from 'react';
import { UserRole } from '../types';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onHome?: () => void;
  onScan?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, role, onSwitchRole, onHome, onScan }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-slate-50 shadow-2xl relative overflow-hidden border-x border-slate-200">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform" onClick={onHome}>
            <Logo size={36} />
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none">VaxEase</h1>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Impact MVP</span>
            </div>
          </div>
          <button 
            onClick={() => onSwitchRole(role === UserRole.NURSE ? UserRole.MIDWIFE : UserRole.NURSE)}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/20 backdrop-blur-md"
          >
            {role === UserRole.NURSE ? 'Monitoring View' : 'Clinical View'}
          </button>
        </div>
        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-[2rem] border border-white/10 backdrop-blur-sm relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white shadow-lg border border-white/20">
             <span className="material-icons-round text-2xl">{role === UserRole.NURSE ? 'medication' : 'insights'}</span>
          </div>
          <div className="flex-1">
            <p className="text-white text-base font-black tracking-tight">{role === UserRole.NURSE ? 'Nurse Mary Ebot' : 'Midwife Sarah Ndoh'}</p>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[9px] text-indigo-100 uppercase tracking-widest font-black opacity-80">
                 {role === UserRole.NURSE ? 'Regional Hosp. Buea' : 'Community Outreach'}
               </span>
               <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 overflow-y-auto pb-32 -mt-4 z-0">
        {children}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] bg-white/90 backdrop-blur-2xl border border-white/40 p-3 flex justify-around items-center rounded-[2.5rem] shadow-2xl z-50">
        <button onClick={onHome} className="flex flex-col items-center text-indigo-600 transition-transform active:scale-90 px-4">
          <span className="material-icons-round text-2xl">home</span>
          <span className="text-[8px] font-black uppercase mt-1 tracking-widest">Home</span>
        </button>
        
        <button onClick={onScan} className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-white -mt-14 shadow-2xl shadow-indigo-200 border-[6px] border-white transition-all active:scale-95 hover:scale-105">
          <span className="material-icons-round text-4xl">qr_code_scanner</span>
        </button>
        
        <button className="flex flex-col items-center text-slate-300 transition-transform active:scale-90 px-4">
          <span className="material-icons-round text-2xl">settings</span>
          <span className="text-[8px] font-black uppercase mt-1 tracking-widest">Settings</span>
        </button>
      </nav>
    </div>
  );
};
