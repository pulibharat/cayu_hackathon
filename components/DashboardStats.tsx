
import React from 'react';
import { ClinicStats } from '../types';

interface DashboardStatsProps {
  stats: ClinicStats;
  onCardClick: (filter: 'ALL' | 'COMPLETED' | 'MISSED' | 'OUTREACH', openMap?: boolean) => void;
  activeFilter: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, onCardClick, activeFilter }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-8">
      <button 
        onClick={() => onCardClick('ALL')}
        className={`text-left p-5 rounded-3xl border-2 transition-all ${activeFilter === 'ALL' ? 'bg-teal-600 border-teal-500 text-white shadow-xl shadow-teal-200' : 'bg-white border-transparent shadow-sm'}`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-4 ${activeFilter === 'ALL' ? 'bg-white/20' : 'bg-teal-50 text-teal-600'}`}>
          <span className="material-icons-round text-sm">groups</span>
        </div>
        <div className="text-2xl font-extrabold tracking-tighter leading-none">{stats.totalBabies}</div>
        <div className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-2">Registered</div>
      </button>
      
      <button 
        onClick={() => onCardClick('COMPLETED')}
        className={`text-left p-5 rounded-3xl border-2 transition-all ${activeFilter === 'COMPLETED' ? 'bg-slate-900 border-slate-800 text-white shadow-xl shadow-slate-200' : 'bg-white border-transparent shadow-sm'}`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-4 ${activeFilter === 'COMPLETED' ? 'bg-white/20' : 'bg-teal-50 text-teal-600'}`}>
          <span className="material-icons-round text-sm">verified</span>
        </div>
        <div className="text-2xl font-extrabold tracking-tighter leading-none">{stats.completedVaxCount}</div>
        <div className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-2">Fully Immune</div>
      </button>

      <button 
        onClick={() => onCardClick('MISSED')}
        className={`text-left p-5 rounded-3xl border-2 transition-all ${activeFilter === 'MISSED' ? 'bg-orange-500 border-orange-400 text-white shadow-xl shadow-orange-100' : 'bg-white border-transparent shadow-sm'}`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-4 ${activeFilter === 'MISSED' ? 'bg-white/20' : 'bg-orange-50 text-orange-600'}`}>
          <span className="material-icons-round text-sm">report_problem</span>
        </div>
        <div className="text-2xl font-extrabold tracking-tighter leading-none">{stats.missedDoseCount}</div>
        <div className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-2">Missed Doses</div>
      </button>

      <button 
        onClick={() => onCardClick('OUTREACH', true)}
        className={`text-left p-5 rounded-3xl border-2 transition-all ${activeFilter === 'OUTREACH' ? 'bg-sky-600 border-sky-500 text-white shadow-xl shadow-sky-100' : 'bg-white border-transparent shadow-sm'}`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-4 ${activeFilter === 'OUTREACH' ? 'bg-white/20' : 'bg-sky-50 text-sky-600'}`}>
          <span className="material-icons-round text-sm">satellite_alt</span>
        </div>
        <div className="text-2xl font-extrabold tracking-tighter leading-none">{stats.activeOutreachCount}</div>
        <div className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-2">Coverage Gaps</div>
      </button>
    </div>
  );
};
