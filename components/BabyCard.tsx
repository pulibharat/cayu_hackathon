
import React from 'react';
import { Baby, VaccineStatus } from '../types.ts';

interface BabyCardProps {
  baby: Baby;
  onClick: (baby: Baby) => void;
}

export const BabyCard: React.FC<BabyCardProps> = ({ baby, onClick }) => {
  const nextVaccine = baby.vaccines.find(v => v.status === VaccineStatus.DUE || v.status === VaccineStatus.PENDING);
  const missedCount = baby.vaccines.filter(v => v.status === VaccineStatus.MISSED).length;

  return (
    <div 
      onClick={() => onClick(baby)}
      className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-teal-500 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 cursor-pointer flex items-center gap-4 group relative overflow-hidden"
    >
      <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-800 font-extrabold text-lg group-hover:bg-teal-600 group-hover:text-white transition-all shadow-inner">
        {baby.firstName[0]}{baby.lastName[0]}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 tracking-tight truncate">{baby.firstName} {baby.lastName}</h3>
          <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-widest flex-shrink-0">{baby.id}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 opacity-60">
          <span className="material-icons-round text-[12px] text-teal-600">location_on</span>
          <span className="text-[9px] font-bold uppercase tracking-widest truncate">{baby.village}</span>
        </div>
        
        {nextVaccine && (
          <div className="mt-2.5 inline-flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors">
            <span className={`w-1.5 h-1.5 rounded-full ${nextVaccine.status === VaccineStatus.DUE ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`}></span>
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest truncate">
              {nextVaccine.status === VaccineStatus.DUE ? 'Due' : 'Upcoming'}: {nextVaccine.shortName} • {new Date(nextVaccine.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {missedCount > 0 ? (
          <div className="bg-rose-100 text-rose-700 text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-rose-200 shadow-sm">
            {missedCount} Missed
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-teal-600 transition-colors border border-slate-100 group-hover:border-teal-200">
            <span className="material-icons-round text-sm">chevron_right</span>
          </div>
        )}
      </div>
    </div>
  );
};
