
import React, { useState, useRef } from 'react';
import { Baby } from '../types.ts';
import { generateInitialVaxRecord } from '../constants.ts';
import { analyzeHealthCard } from '../services/geminiService.ts';

interface RegistrationModalProps {
  onSave: (baby: Baby) => void;
  onClose: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ onSave, onClose }) => {
  const [step, setStep] = useState<'CHOICE' | 'MANUAL' | 'OCR'>('CHOICE');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    registryNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: new Date().toISOString().split('T')[0],
    gender: 'M' as 'M' | 'F',
    weightAtBirth: undefined as number | undefined,
    heightAtBirth: undefined as number | undefined,
    parentName: '',
    parentPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    village: '',
    address: ''
  });

  const startCamera = async () => {
    setStep('OCR');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Could not access camera. Please try uploading a file or manual entry.");
      setStep('CHOICE');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const resizeAndCompressImage = (img: HTMLImageElement | HTMLVideoElement): string => {
    const canvas = document.createElement('canvas');
    const MAX_WIDTH = 1024;
    const MAX_HEIGHT = 1024;
    let width = (img instanceof HTMLVideoElement) ? img.videoWidth : img.width;
    let height = (img instanceof HTMLVideoElement) ? img.videoHeight : img.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = async () => {
        setLoading(true);
        const base64 = resizeAndCompressImage(img);
        const result = await analyzeHealthCard(base64);
        processOCRResult(result);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;
    setLoading(true);
    const base64Image = resizeAndCompressImage(videoRef.current);
    const result = await analyzeHealthCard(base64Image);
    processOCRResult(result);
    stopCamera();
  };

  // Fixed: Corrected the 'village' shorthand property error and completed the function
  const processOCRResult = (result: any) => {
    if (result) {
      setFormData({
        ...formData,
        registryNumber: result.registryNumber || '',
        firstName: result.firstName || '',
        lastName: result.lastName || '',
        dateOfBirth: result.dateOfBirth || formData.dateOfBirth,
        parentName: result.parentName || '',
        parentPhone: result.parentPhone || '',
        village: result.village || '',
        weightAtBirth: result.weightAtBirth || undefined,
      });
      setStep('MANUAL');
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = formData.registryNumber || `VX-${Date.now()}`;
    const newBaby: Baby = {
      ...formData,
      id,
      qrCode: id,
      registrationDate: new Date().toISOString().split('T')[0],
      vaccines: generateInitialVaxRecord(formData.dateOfBirth),
      weightHistory: formData.weightAtBirth ? [{
        ageMonths: 0,
        weightKg: formData.weightAtBirth,
        date: formData.dateOfBirth
      }] : [],
      location: { lat: 4.15 + (Math.random() - 0.5) * 0.02, lng: 9.24 + (Math.random() - 0.5) * 0.02 }
    };
    onSave(newBaby);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 animate-in zoom-in-95 duration-300">
        
        <div className="bg-teal-600 p-6 text-white flex justify-between items-center">
           <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Health Registry</p>
              <h3 className="text-xl font-black tracking-tight">New Patient Intake</h3>
           </div>
           <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <span className="material-icons-round">close</span>
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase text-teal-600 tracking-[0.3em]">Analyzing Document...</p>
            </div>
          ) : step === 'CHOICE' ? (
            <div className="space-y-4 py-4">
               <button 
                onClick={startCamera}
                className="w-full bg-slate-950 text-white p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:bg-slate-900 transition-all active:scale-[0.98]"
               >
                  <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                     <span className="material-icons-round text-3xl">camera_alt</span>
                  </div>
                  <div className="text-center">
                    <h4 className="font-black text-lg">AI Document Scan</h4>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1">Extract from Health Card</p>
                  </div>
               </button>

               <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em] text-slate-300 bg-white px-4">OR</div>
               </div>

               <button 
                onClick={() => setStep('MANUAL')}
                className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] flex items-center gap-5 hover:bg-white hover:border-teal-500 transition-all active:scale-[0.98]"
               >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-slate-100">
                     <span className="material-icons-round text-slate-400">edit_note</span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-slate-900">Manual Entry</h4>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Type details manually</p>
                  </div>
               </button>
            </div>
          ) : step === 'OCR' ? (
            <div className="space-y-6">
              <div className="relative aspect-[3/4] bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-dashed border-slate-300">
                 <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                 <div className="absolute inset-0 border-[2rem] border-slate-950/20 pointer-events-none"></div>
                 <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_15px_#14b8a6] animate-bounce opacity-50"></div>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => { stopCamera(); setStep('CHOICE'); }} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500">Back</button>
                 <button onClick={captureAndAnalyze} className="flex-[2] bg-teal-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-teal-500/20">Capture & Extract</button>
              </div>
              <div className="text-center">
                 <button onClick={() => fileInputRef.current?.click()} className="text-[9px] font-black uppercase tracking-widest text-teal-600 hover:underline">Or Upload Photo</button>
                 <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                      <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-teal-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-teal-500 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                      <input required type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-teal-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                      <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as 'M' | 'F'})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-teal-500 outline-none">
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Village / Quarter</label>
                    <input required type="text" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-teal-500 outline-none" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Name</label>
                    <input required type="text" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-teal-500 outline-none" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Phone</label>
                    <input required type="tel" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-teal-500 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Birth Weight (kg)</label>
                      <input type="number" step="0.1" value={formData.weightAtBirth || ''} onChange={e => setFormData({...formData, weightAtBirth: parseFloat(e.target.value) || undefined})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-teal-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Registry No.</label>
                      <input type="text" value={formData.registryNumber} onChange={e => setFormData({...formData, registryNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-teal-500 outline-none" />
                    </div>
                  </div>
               </div>

               <div className="flex gap-3 pt-4">
                 <button type="button" onClick={() => setStep('CHOICE')} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500">Back</button>
                 <button type="submit" className="flex-[2] bg-teal-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-teal-500/20">Register Patient</button>
               </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
