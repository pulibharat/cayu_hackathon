
import React from 'react';
import { ClinicStats } from '../types';

interface DashboardStatsProps {
  stats: ClinicStats;
  onCardClick: (filter: 'ALL' | 'COMPLETED' | 'MISSED' | 'OUTREACH') => void;
  activeFilter: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, onCardClick, activeFilter }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <button 
        onClick={() => onCardClick('ALL')}
        className={`text-left p-4 rounded-2xl border transition-all active:scale-95 ${activeFilter === 'ALL' ? 'bg-indigo-600 border-indigo-600 shadow-lg' : 'bg-white border-slate-100 shadow-sm'}`}
      >
        <div className={`${activeFilter === 'ALL' ? 'text-white bg-white/20' : 'text-indigo-600 bg-indigo-50'} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
          <span className="material-icons-round text-sm">child_care</span>
        </div>
        <div className={`text-2xl font-black ${activeFilter === 'ALL' ? 'text-white' : 'text-slate-800'}`}>{stats.totalBabies}</div>
        <div className={`text-[10px] font-black uppercase tracking-widest ${activeFilter === 'ALL' ? 'text-indigo-100' : 'text-slate-400'}`}>Registered</div>
      </button>
      
      <button 
        onClick={() => onCardClick('COMPLETED')}
        className={`text-left p-4 rounded-2xl border transition-all active:scale-95 ${activeFilter === 'COMPLETED' ? 'bg-emerald-600 border-emerald-600 shadow-lg' : 'bg-white border-slate-100 shadow-sm'}`}
      >
        <div className={`${activeFilter === 'COMPLETED' ? 'text-white bg-white/20' : 'text-emerald-600 bg-emerald-50'} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
          <span className="material-icons-round text-sm">task_alt</span>
        </div>
        <div className={`text-2xl font-black ${activeFilter === 'COMPLETED' ? 'text-white' : 'text-slate-800'}`}>{stats.completedVaxCount}</div>
        <div className={`text-[10px] font-black uppercase tracking-widest ${activeFilter === 'COMPLETED' ? 'text-emerald-100' : 'text-slate-400'}`}>Completed Doses</div>
      </button>

      <button 
        onClick={() => onCardClick('MISSED')}
        className={`text-left p-4 rounded-2xl border transition-all active:scale-95 ${activeFilter === 'MISSED' ? 'bg-rose-600 border-rose-600 shadow-lg' : 'bg-white border-slate-100 shadow-sm'}`}
      >
        <div className={`${activeFilter === 'MISSED' ? 'text-white bg-white/20' : 'text-rose-600 bg-rose-50'} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
          <span className="material-icons-round text-sm">error_outline</span>
        </div>
        <div className={`text-2xl font-black ${activeFilter === 'MISSED' ? 'text-white' : 'text-slate-800'}`}>{stats.missedDoseCount}</div>
        <div className={`text-[10px] font-black uppercase tracking-widest ${activeFilter === 'MISSED' ? 'text-rose-100' : 'text-slate-400'}`}>Missed Sessions</div>
      </button>

      <button 
        onClick={() => onCardClick('OUTREACH')}
        className={`text-left p-4 rounded-2xl border transition-all active:scale-95 ${activeFilter === 'OUTREACH' ? 'bg-amber-600 border-amber-600 shadow-lg' : 'bg-white border-slate-100 shadow-sm'}`}
      >
        <div className={`${activeFilter === 'OUTREACH' ? 'text-white bg-white/20' : 'text-amber-600 bg-amber-50'} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
          <span className="material-icons-round text-sm">campaign</span>
        </div>
        <div className={`text-2xl font-black ${activeFilter === 'OUTREACH' ? 'text-white' : 'text-slate-800'}`}>{stats.activeOutreachCount}</div>
        <div className={`text-[10px] font-black uppercase tracking-widest ${activeFilter === 'OUTREACH' ? 'text-amber-100' : 'text-slate-400'}`}>Outreach Needs</div>
      </button>
    </div>
  );
};
