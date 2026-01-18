
import React, { useState } from 'react';
import { VaccineRecord } from '../types';

interface VaccineModalProps {
  vaccine: VaccineRecord;
  onSave: (details: { completedDate: string; providerId: string; batchNumber: string }) => void;
  onClose: () => void;
}

export const VaccineModal: React.FC<VaccineModalProps> = ({ vaccine, onSave, onClose }) => {
  const [date, setDate] = useState(vaccine.completedDate || new Date().toISOString().split('T')[0]);
  const [provider, setProvider] = useState(vaccine.providerId || 'NURSE-MARY-EBOT');
  const [batch, setBatch] = useState(vaccine.batchNumber || '');

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 border border-slate-100">
        <div className="bg-teal-600 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors">
            <span className="material-icons-round">close</span>
          </button>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Technical Registry</p>
          <h3 className="text-2xl font-extrabold tracking-tight">{vaccine.name}</h3>
          <p className="text-xs opacity-80 mt-1 font-medium">Verify batch and provider credentials</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] pl-1">Administration Date</label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm">calendar_today</span>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-bold focus:bg-white focus:border-teal-500 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] pl-1">Provider ID</label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm">verified_user</span>
              <input 
                type="text" 
                value={provider} 
                onChange={(e) => setProvider(e.target.value)}
                placeholder="ID CODE"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-bold focus:bg-white focus:border-teal-500 outline-none transition-all uppercase" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] pl-1">Batch / Lot Code</label>
            <div className="relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm">qr_code</span>
              <input 
                type="text" 
                value={batch} 
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. B2309X"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-bold focus:bg-white focus:border-teal-500 outline-none transition-all uppercase" 
              />
            </div>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider px-1">Check vial sticker for batch number.</p>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-50 text-slate-400 font-bold py-4 rounded-2xl border border-slate-200 active:scale-95 transition-all text-[10px] uppercase tracking-widest"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave({ completedDate: date, providerId: provider, batchNumber: batch })}
              className="flex-1 bg-teal-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-teal-500/10 active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-teal-500/20"
            >
              <span className="material-icons-round text-sm">save</span>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
