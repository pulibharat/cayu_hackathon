
import React from 'react';
import { Baby, VaccineStatus } from '../types';

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
      className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center gap-5 group"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-[1.5rem] flex items-center justify-center text-indigo-600 font-black text-xl group-hover:scale-105 transition-transform shadow-inner">
        {baby.firstName[0]}{baby.lastName[0]}
      </div>
      <div className="flex-1">
        <h3 className="font-black text-slate-800 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{baby.firstName} {baby.lastName}</h3>
        <div className="flex items-center gap-3 mt-1 opacity-60">
          <span className="text-[10px] text-slate-500 flex items-center font-bold uppercase tracking-wider">
            <span className="material-icons-round text-[12px] mr-1">place</span>
            {baby.village}
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="text-[10px] text-slate-500 font-bold">{baby.id}</span>
        </div>
        {nextVaccine && (
          <div className="mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              Next: {nextVaccine.shortName} • {new Date(nextVaccine.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        {missedCount > 0 && (
          <span className="bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg shadow-rose-100 uppercase tracking-widest">
            {missedCount} Missed
          </span>
        )}
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
          <span className="material-icons-round text-lg">chevron_right</span>
        </div>
      </div>
    </div>
  );
};
