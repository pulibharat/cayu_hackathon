
import React from 'react';
import { GrowthPoint } from '../types';

interface GrowthChartProps {
  data: GrowthPoint[];
  gender: 'M' | 'F';
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ data, gender }) => {
  // WHO Weight-for-age Simplified Reference (Approximate Z-scores)
  // Curves: Median (0), +2 SD, -2 SD
  const referenceData = [
    { age: 0, median: 3.3, p97: 4.4, p3: 2.4 },
    { age: 3, median: 6.2, p97: 8.0, p3: 4.8 },
    { age: 6, median: 7.6, p97: 9.8, p3: 5.9 },
    { age: 9, median: 8.6, p97: 11.2, p3: 6.7 },
    { age: 12, median: 9.2, p97: 12.0, p3: 7.2 },
    { age: 18, median: 10.6, p97: 14.0, p3: 8.2 },
    { age: 24, median: 12.0, p97: 16.0, p3: 9.2 },
  ];

  const width = 300;
  const height = 180;
  const padding = 25;

  const xScale = (age: number) => padding + (age / 24) * (width - 2 * padding);
  const yScale = (weight: number) => (height - padding) - (weight / 18) * (height - 2 * padding);

  const getPath = (key: 'median' | 'p97' | 'p3') => {
    return referenceData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.age)} ${yScale(d[key])}`).join(' ');
  };

  return (
    <div className="bg-[#f0f9ff] border border-blue-100 rounded-3xl p-4 my-4 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-800">
          Weight-for-age {gender === 'F' ? 'GIRLS' : 'BOYS'} (z-scores)
        </h4>
        <span className="material-icons-round text-blue-400 text-sm">show_chart</span>
      </div>
      
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 6, 12, 18, 24].map(age => (
          <line key={age} x1={xScale(age)} y1={padding} x2={xScale(age)} y2={height-padding} stroke="#bfdbfe" strokeWidth="0.5" strokeDasharray="2,2" />
        ))}
        {[5, 10, 15].map(w => (
          <line key={w} x1={padding} y1={yScale(w)} x2={width-padding} y2={yScale(w)} stroke="#bfdbfe" strokeWidth="0.5" strokeDasharray="2,2" />
        ))}

        {/* Reference Curves */}
        <path d={getPath('p97')} fill="none" stroke="#93c5fd" strokeWidth="1" />
        <path d={getPath('median')} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
        <path d={getPath('p3')} fill="none" stroke="#fca5a5" strokeWidth="1" />

        {/* Actual Data Points */}
        {data.length > 1 && (
          <path 
            d={data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.ageMonths)} ${yScale(p.weightKg)}`).join(' ')} 
            fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" 
          />
        )}
        {data.map((p, i) => (
          <circle key={i} cx={xScale(p.ageMonths)} cy={yScale(p.weightKg)} r="3" fill="#1e3a8a" />
        ))}

        {/* Labels */}
        <text x={padding} y={height-5} fontSize="8" fill="#64748b" textAnchor="middle">Birth</text>
        <text x={xScale(12)} y={height-5} fontSize="8" fill="#64748b" textAnchor="middle">1 Year</text>
        <text x={xScale(24)} y={height-5} fontSize="8" fill="#64748b" textAnchor="middle">2 Years</text>
        <text x={5} y={yScale(10)} fontSize="8" fill="#64748b" transform={`rotate(-90, 5, ${yScale(10)})`}>Weight (kg)</text>
      </svg>
      
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 bg-blue-500"></div>
          <span className="text-[8px] font-bold text-slate-500 uppercase">Median</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 bg-blue-300"></div>
          <span className="text-[8px] font-bold text-slate-500 uppercase">+2 SD</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 bg-red-300"></div>
          <span className="text-[8px] font-bold text-slate-500 uppercase">-2 SD</span>
        </div>
      </div>
    </div>
  );
};
