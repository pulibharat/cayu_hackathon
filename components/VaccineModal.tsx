
import React, { useState } from 'react';
import { VaccineRecord, VaccineStatus } from '../types.ts';

interface VaccineModalProps {
  vaccine: VaccineRecord;
  onSave: (details: { completedDate: string; providerId: string; batchNumber: string; status: VaccineStatus }) => void;
  onClose: () => void;
}

export const VaccineModal: React.FC<VaccineModalProps> = ({ vaccine, onSave, onClose }) => {
  const [date, setDate] = useState(vaccine.completedDate || new Date().toISOString().split('T')[0]);
  const [provider, setProvider] = useState(vaccine.providerId || 'NURSE-MARY-EBOT');
  const [batch, setBatch] = useState(vaccine.batchNumber || '');
  const [outcome, setOutcome] = useState<'TAKEN' | 'MISSED'>('TAKEN');

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-slate-100">
        {/* Header Section - Reduced Padding and Font Size */}
        <div className="bg-[#0d9488] p-5 text-white relative flex-shrink-0">
          <button onClick={onClose} className="absolute top-5 right-5 text-white/80 hover:text-white transition-colors">
            <span className="material-icons-round">close</span>
          </button>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">TECHNICAL REGISTRY</p>
          <h3 className="text-xl font-black tracking-tight leading-tight">{vaccine.name}</h3>
          <p className="text-[11px] opacity-90 mt-0.5 font-medium">Verify batch and provider credentials</p>
        </div>
        
        {/* Modal Body - Scrollable */}
        <div className="p-6 space-y-4 overflow-y-auto no-scrollbar">
          {/* Outcome Selector */}
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button 
              onClick={() => setOutcome('TAKEN')}
              className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${outcome === 'TAKEN' ? 'bg-white text-[#0d9488] shadow-sm' : 'text-slate-400'}`}
            >
              Vaccine Taken
            </button>
            <button 
              onClick={() => setOutcome('MISSED')}
              className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${outcome === 'MISSED' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
            >
              Missed Dose
            </button>
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] pl-1">ADMINISTRATION DATE</label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base">calendar_today</span>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-teal-500 outline-none transition-all" 
              />
            </div>
          </div>

          {/* Provider Input */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] pl-1">PROVIDER ID</label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base">verified</span>
              <input 
                type="text" 
                value={provider} 
                onChange={(e) => setProvider(e.target.value.toUpperCase())}
                placeholder="NURSE-ID"
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-teal-500 outline-none transition-all" 
              />
            </div>
          </div>

          {/* Batch Input */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] pl-1">BATCH / LOT CODE</label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-teal-600 text-base">qr_code_2</span>
              <input 
                type="text" 
                value={batch} 
                onChange={(e) => setBatch(e.target.value.toUpperCase())}
                placeholder="E.G. B2309X"
                className="w-full bg-white border border-[#14b8a6] rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all" 
              />
            </div>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider px-1">CHECK VIAL STICKER FOR BATCH NUMBER.</p>
          </div>
        </div>

        {/* Footer Buttons - Fixed to Bottom */}
        <div className="p-6 pt-2 flex gap-3 flex-shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 bg-white text-slate-400 font-black py-3.5 rounded-xl border border-[#e2e8f0] active:scale-95 transition-all text-[10px] uppercase tracking-widest"
          >
            CANCEL
          </button>
          <button 
            onClick={() => onSave({ 
              completedDate: date, 
              providerId: provider, 
              batchNumber: batch,
              status: outcome === 'TAKEN' ? VaccineStatus.COMPLETED : VaccineStatus.MISSED
            })}
            className="flex-1 bg-[#0d9488] text-white font-black py-3.5 rounded-xl shadow-lg shadow-teal-500/10 active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-sm">save</span>
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};
