
import React from 'react';
import { Baby, VaccineStatus } from '../types.ts';

interface OutreachMapProps {
  babies: Baby[];
  clinicLocation: { lat: number; lng: number };
}

export const OutreachMap: React.FC<OutreachMapProps> = ({ babies, clinicLocation }) => {
  const mapWidth = 320;
  const mapHeight = 240;
  const padding = 40;

  const latMin = 4.13;
  const latMax = 4.17;
  const lngMin = 9.22;
  const lngMax = 9.26;

  const project = (lat: number, lng: number) => {
    const x = padding + ((lng - lngMin) / (lngMax - lngMin)) * (mapWidth - 2 * padding);
    const y = (mapHeight - padding) - ((lat - latMin) / (latMax - latMin)) * (mapHeight - 2 * padding);
    return { x, y };
  };

  const clinicPos = project(clinicLocation.lat, clinicLocation.lng);
  
  const unvaccinatedBabies = babies.filter(b => b.vaccines.some(v => v.status === VaccineStatus.MISSED || v.status === VaccineStatus.DUE));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border border-slate-800 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(79,70,229,0.1),_transparent)] pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-white text-lg font-black tracking-tight">Outreach Radar</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Geographic Tracking</p>
          </div>
          <div className="flex gap-2">
             <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"></div>
                <span className="text-[8px] text-slate-400 font-bold uppercase">Unvaccinated</span>
             </div>
          </div>
        </div>

        <div className="relative h-[240px] bg-slate-800/50 rounded-[2rem] border border-slate-700 overflow-hidden shadow-inner">
          <svg width="100%" height="100%" viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="absolute inset-0">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              </pattern>
              <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(79,70,229,0)" />
                <stop offset="100%" stopColor="rgba(79,70,229,0.15)" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Animated Radar Sweep */}
            <circle cx={clinicPos.x} cy={clinicPos.y} r="100" fill="url(#radarSweep)" className="animate-radar-sweep origin-center" />

            {/* Clinic Range Circles */}
            <circle cx={clinicPos.x} cy={clinicPos.y} r="40" fill="none" stroke="rgba(79,70,229,0.1)" strokeWidth="1" strokeDasharray="4,4" />
            <circle cx={clinicPos.x} cy={clinicPos.y} r="80" fill="none" stroke="rgba(79,70,229,0.05)" strokeWidth="1" strokeDasharray="4,4" />

            {/* Connectors for unvaccinated babies */}
            {unvaccinatedBabies.map((baby) => {
               if (!baby.location) return null;
               const pos = project(baby.location.lat, baby.location.lng);
               return (
                 <line 
                  key={`line-${baby.id}`} 
                  x1={clinicPos.x} y1={clinicPos.y} 
                  x2={pos.x} y2={pos.y} 
                  stroke="rgba(244,63,94,0.15)" 
                  strokeWidth="0.5" 
                 />
               );
            })}

            {/* Baby Markers */}
            {babies.map((baby) => {
              if (!baby.location) return null;
              const pos = project(baby.location.lat, baby.location.lng);
              const isUnvax = baby.vaccines.some(v => v.status === VaccineStatus.MISSED || v.status === VaccineStatus.DUE);
              
              return (
                <g key={baby.id} className="cursor-pointer">
                  <circle 
                    cx={pos.x} 
                    cy={pos.y} 
                    r={isUnvax ? "4" : "2"} 
                    fill={isUnvax ? "#f43f5e" : "#10b981"}
                    className={isUnvax ? "animate-pulse" : "opacity-40"}
                  />
                  {isUnvax && (
                    <circle 
                      cx={pos.x} 
                      cy={pos.y} 
                      r="8" 
                      fill="none" 
                      stroke="#f43f5e" 
                      strokeWidth="1" 
                      className="animate-ping opacity-20"
                    />
                  )}
                </g>
              );
            })}

            {/* Clinic Marker */}
            <g>
              <rect x={clinicPos.x - 6} y={clinicPos.y - 6} width="12" height="12" rx="3" fill="#4f46e5" className="shadow-lg" />
              <path d={`M ${clinicPos.x} ${clinicPos.y - 3} V ${clinicPos.y + 3} M ${clinicPos.x - 3} ${clinicPos.y} H ${clinicPos.x + 3}`} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </svg>

          <style>{`
            @keyframes radar-sweep {
              0% { transform: scale(0.1); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: scale(1.5); opacity: 0; }
            }
            .animate-radar-sweep { animation: radar-sweep 4s linear infinite; }
          `}</style>
          
          <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
             <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/80 px-2 py-1 rounded-md border border-slate-700">Sector: Buea North</span>
             <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest bg-slate-900/80 px-2 py-1 rounded-md border border-emerald-900/30">GPS Active</span>
          </div>
        </div>
      </div>

      {/* At-Risk Target List */}
      <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100">
         <div className="flex items-center gap-2 mb-4">
            <span className="material-icons-round text-rose-500">list_alt</span>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outreach Priority Targets</h4>
         </div>
         <div className="space-y-3">
            {unvaccinatedBabies.map(baby => (
               <div key={baby.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 font-black text-xs">
                     {baby.firstName[0]}{baby.lastName[0]}
                  </div>
                  <div className="flex-1">
                     <h5 className="text-xs font-black text-slate-800">{baby.firstName} {baby.lastName}</h5>
                     <div className="flex items-center gap-2">
                        <span className="material-icons-round text-[10px] text-slate-400">place</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{baby.village}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] font-black text-rose-600 uppercase bg-rose-50 px-2 py-1 rounded-lg inline-block">Missed Doses</p>
                  </div>
               </div>
            ))}
            {unvaccinatedBabies.length === 0 && (
               <div className="py-6 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Coverage 100% in this sector</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
