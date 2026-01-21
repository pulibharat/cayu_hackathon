
import React from 'react';
import { TrendPoint } from '../types.ts';

interface CoverageTrendsProps {
  data: TrendPoint[];
}

export const CoverageTrends: React.FC<CoverageTrendsProps> = ({ data }) => {
  const width = 340;
  const height = 180;
  const padding = 30;

  // Scaling helpers
  const maxVal = Math.max(...data.map(d => Math.max(d.due, d.completed, d.missed)), 10);
  const xScale = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
  const yScale = (val: number) => (height - padding) - (val / maxVal) * (height - 2 * padding);

  const getPath = (key: 'completed' | 'missed' | 'due') => {
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d[key])}`).join(' ');
  };

  const getAreaPath = (key: 'completed' | 'missed' | 'due') => {
    const line = getPath(key);
    return `${line} L ${xScale(data.length - 1)} ${height - padding} L ${xScale(0)} ${height - padding} Z`;
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-slate-900 text-sm font-extrabold tracking-tight">Coverage Trends</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">EPI Performance Monitoring</p>
        </div>
        <div className="flex items-center gap-1.5 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
          <span className="text-[8px] font-black text-teal-600 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      <div className="relative h-[180px] w-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Horizontal Grid */}
          {[0, 0.5, 1].map((p, i) => (
            <line 
              key={i} 
              x1={padding} y1={yScale(maxVal * p)} 
              x2={width - padding} y2={yScale(maxVal * p)} 
              stroke="#f1f5f9" strokeWidth="1" 
            />
          ))}

          {/* Due Line (Area) */}
          <path d={getAreaPath('due')} fill="rgba(241, 245, 249, 0.5)" stroke="none" />
          <path d={getPath('due')} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />

          {/* Missed Line */}
          <path d={getPath('missed')} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Completed Line */}
          <path d={getPath('completed')} fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points for Completed */}
          {data.map((d, i) => (
            <g key={`dots-${i}`}>
              <circle cx={xScale(i)} cy={yScale(d.completed)} r="4" fill="white" stroke="#0d9488" strokeWidth="2" />
              <text x={xScale(i)} y={height - 10} fontSize="7" fontWeight="bold" fill="#94a3b8" textAnchor="middle" className="uppercase tracking-widest">
                {d.month}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 border-t border-slate-50 pt-5">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-teal-500"></div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
          </div>
          <div className="text-sm font-black text-slate-900 tracking-tight">84%</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Missed</span>
          </div>
          <div className="text-sm font-black text-slate-900 tracking-tight">12%</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Dropout</span>
          </div>
          <div className="text-sm font-black text-slate-900 tracking-tight">4.2%</div>
        </div>
      </div>
    </div>
  );
};
