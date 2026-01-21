
import React, { useRef } from 'react';
import { Baby } from '../types.ts';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

interface HealthIDCardProps {
  baby: Baby;
  onClose: () => void;
}

export const HealthIDCard: React.FC<HealthIDCardProps> = ({ baby, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `HealthID-${baby.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex justify-between items-center text-white">
          <h2 className="text-xl font-black">Global Health ID</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* The Card */}
        <div 
          ref={cardRef}
          className="w-full aspect-[1.6/1] bg-slate-950 rounded-[1.5rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10"
        >
          {/* Background Decorative */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase text-teal-400 tracking-[0.2em]">VaxEase Global Health ID</p>
              <h3 className="text-3xl font-black tracking-tight mt-6">{baby.firstName} {baby.lastName}</h3>
              <p className="text-sm font-bold opacity-60">PATIENT ID: {baby.id}</p>
            </div>
            
            <div className="bg-white p-2.5 rounded-xl">
              <QRCodeSVG 
                value={baby.id} 
                size={85} 
                level="H" 
                includeMargin={false}
              />
            </div>
          </div>

          <div className="relative z-10">
             <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 inline-block">
                <span className="text-[10px] font-black uppercase tracking-widest">{baby.gender === 'F' ? 'Female' : 'Male'}</span>
             </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/5 flex justify-between items-end">
             <p className="text-[7px] font-bold text-teal-500/50 uppercase tracking-[0.2em]">EPI Regional Monitoring System • Ministry of Public Health</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={downloadCard}
            className="bg-teal-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-sm">download</span>
            Save to Device
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-white text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-sm">print</span>
            Print ID Card
          </button>
        </div>
        
        <p className="text-white/40 text-center text-[10px] font-medium leading-relaxed">
          This digital ID allows rapid record synchronization. Scan at any community post or regional hospital for instant access to immunization history.
        </p>
      </div>
    </div>
  );
};
