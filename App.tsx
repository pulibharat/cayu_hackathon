
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserRole, Baby, VaccineStatus, ClinicStats } from './types';
import { generateInitialVaxRecord } from './constants';
import { Layout } from './components/Layout';
import { DashboardStats } from './components/DashboardStats';
import { BabyCard } from './components/BabyCard';
import { getPublicHealthInsights, analyzeHealthCard } from './services/geminiService';
import { SplashScreen } from './components/SplashScreen';
import { GrowthChart } from './components/GrowthChart';

const INITIAL_BABIES: Baby[] = [
  {
    id: 'VX-2024-001',
    firstName: 'Amara',
    lastName: 'Ebot',
    dateOfBirth: '2023-12-15',
    gender: 'F',
    parentName: 'Beatrice Ebot',
    parentPhone: '+237 670 11 22 33',
    village: 'Buea Town',
    registrationDate: '2023-12-15',
    qrCode: 'VX-2024-001',
    vaccines: generateInitialVaxRecord('2023-12-15'),
    weightHistory: [
      { ageMonths: 0, weightKg: 3.2, date: '2023-12-15' },
      { ageMonths: 1.5, weightKg: 4.5, date: '2024-01-30' },
      { ageMonths: 3, weightKg: 5.8, date: '2024-03-15' },
    ]
  },
  {
    id: 'VX-2024-002',
    firstName: 'Samuel',
    lastName: 'Ndoh',
    dateOfBirth: '2024-01-20',
    gender: 'M',
    parentName: 'Alice Ndoh',
    parentPhone: '+237 675 44 55 66',
    village: 'Molyko',
    registrationDate: '2024-01-20',
    qrCode: 'VX-2024-002',
    vaccines: generateInitialVaxRecord('2024-01-20'),
    weightHistory: [
      { ageMonths: 0, weightKg: 3.5, date: '2024-01-20' },
      { ageMonths: 1.5, weightKg: 4.8, date: '2024-03-05' },
    ]
  }
];

const App: React.FC = () => {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.NURSE);
  const [babies, setBabies] = useState<Baby[]>(INITIAL_BABIES);
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MISSED' | 'DUE_TODAY' | 'COMPLETED' | 'OUTREACH'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newBaby, setNewBaby] = useState<Partial<Baby>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'F',
    parentName: '',
    parentPhone: '',
    village: ''
  });

  const stats: ClinicStats = useMemo(() => {
    let completed = 0;
    let missed = 0;
    babies.forEach(b => {
      b.vaccines.forEach(v => {
        if (v.status === VaccineStatus.COMPLETED) completed++;
        if (v.status === VaccineStatus.MISSED) missed++;
      });
    });
    return {
      totalBabies: babies.length,
      completedVaxCount: completed,
      missedDoseCount: missed,
      activeOutreachCount: babies.filter(b => b.vaccines.some(v => v.status === VaccineStatus.MISSED)).length
    };
  }, [babies]);

  const filteredBabies = useMemo(() => {
    return babies.filter(b => {
      const matchesSearch = `${b.firstName} ${b.lastName} ${b.id}`.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeFilter === 'ALL') return matchesSearch;
      if (activeFilter === 'MISSED') return matchesSearch && b.vaccines.some(v => v.status === VaccineStatus.MISSED);
      if (activeFilter === 'DUE_TODAY') return matchesSearch && b.vaccines.some(v => v.status === VaccineStatus.DUE);
      if (activeFilter === 'COMPLETED') return matchesSearch && b.vaccines.every(v => v.status === VaccineStatus.COMPLETED);
      if (activeFilter === 'OUTREACH') return matchesSearch && b.vaccines.some(v => v.status === VaccineStatus.MISSED);
      return matchesSearch;
    });
  }, [babies, searchQuery, activeFilter]);

  useEffect(() => {
    if (isScanning && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Camera error:", err));
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [isScanning]);

  if (!isSplashComplete) {
    return <SplashScreen onComplete={() => setIsSplashComplete(true)} />;
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBaby.firstName || !newBaby.lastName || !newBaby.dateOfBirth) return;

    setIsSyncing(true);
    setTimeout(() => {
      const id = `VX-2024-${String(babies.length + 1).padStart(3, '0')}`;
      const baby: Baby = {
        ...newBaby as Baby,
        id,
        registrationDate: new Date().toISOString().split('T')[0],
        qrCode: id, // QR code now matches the ID for easy lookup
        vaccines: generateInitialVaxRecord(newBaby.dateOfBirth!),
        weightHistory: [{ ageMonths: 0, weightKg: 3.3, date: new Date().toISOString().split('T')[0] }]
      };

      setBabies(prev => [...prev, baby]);
      setIsRegistering(false);
      setIsSyncing(false);
      setNewBaby({ firstName: '', lastName: '', dateOfBirth: '', gender: 'F', parentName: '', parentPhone: '', village: '' });
      setSelectedBaby(baby); // Show the new baby card immediately
    }, 1000);
  };

  const handleOcrClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const result = await analyzeHealthCard(base64String);
      if (result) {
        setNewBaby(prev => ({
          ...prev,
          firstName: result.firstName,
          lastName: result.lastName,
          dateOfBirth: result.dateOfBirth,
          parentName: result.parentName,
          village: result.village
        }));
      }
      setIsOcrLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const updateVaccine = (babyId: string, vaxId: string) => {
    setBabies(prev => prev.map(b => {
      if (b.id !== babyId) return b;
      return {
        ...b,
        vaccines: b.vaccines.map(v => {
          if (v.id !== vaxId) return v;
          return { ...v, status: VaccineStatus.COMPLETED, completedDate: new Date().toISOString().split('T')[0] };
        })
      };
    }));
    
    if (selectedBaby && selectedBaby.id === babyId) {
       setSelectedBaby(prev => prev ? {
         ...prev,
         vaccines: prev.vaccines.map(v => v.id === vaxId ? { ...v, status: VaccineStatus.COMPLETED, completedDate: new Date().toISOString().split('T')[0] } : v)
       } : null);
    }
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    const text = await getPublicHealthInsights(babies, stats);
    setAiInsights(text || "Error fetching insights.");
    setLoadingInsights(false);
  };

  const resetViews = () => {
    setIsRegistering(false);
    setSelectedBaby(null);
    setIsScanning(false);
    setActiveFilter('ALL');
  };

  const handleScanSimulation = () => {
    setIsScanning(true);
    // Real logic simulation: After 3 seconds, we "scan" a random baby's ID
    setTimeout(() => {
      if (isScanning) {
        const randomBaby = babies[Math.floor(Math.random() * babies.length)];
        setSelectedBaby(randomBaby);
        setIsScanning(false);
      }
    }, 3000);
  };

  // Function to download/display QR code - for demo, we'll just show a big version
  const [showQrModal, setShowQrModal] = useState(false);

  return (
    <Layout role={role} onSwitchRole={setRole} onHome={resetViews} onScan={handleScanSimulation}>
      
      {/* Hidden File Input for OCR */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />

      {isScanning && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-[40px] border-black/40 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-indigo-400 rounded-3xl relative">
               <div className="absolute inset-0 bg-indigo-400/10 animate-pulse"></div>
               <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
               <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
               <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] animate-scan-line"></div>
            </div>
          </div>
          <style>{`
            @keyframes scan-line {
              0% { transform: translateY(-110px); }
              100% { transform: translateY(110px); }
            }
            .animate-scan-line { animation: scan-line 2s ease-in-out infinite alternate; }
          `}</style>
          <div className="absolute bottom-20 left-0 right-0 px-8 text-center text-white">
            <h3 className="text-xl font-black mb-2 tracking-tight">EPI System Scan</h3>
            <p className="text-sm opacity-80 mb-6 font-medium">Auto-detecting Child ID from QR or Card...</p>
            <button onClick={() => setIsScanning(false)} className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {!selectedBaby && !isRegistering && !isScanning && (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {role === UserRole.NURSE ? 'Clinic Dashboard' : 'Outreach Strategy'}
            </h2>
            <div className="flex gap-2">
              {role === UserRole.MIDWIFE && (
                <button onClick={fetchInsights} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-100 shadow-sm active:scale-95 transition-all">
                  <span className="material-icons-round text-sm">auto_awesome</span>
                  Gen AI Report
                </button>
              )}
              {role === UserRole.NURSE && (
                <button onClick={() => setIsRegistering(true)} className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                  <span className="material-icons-round">person_add</span>
                </button>
              )}
            </div>
          </div>
          
          <DashboardStats stats={stats} onCardClick={(f) => setActiveFilter(f as any)} activeFilter={activeFilter} />

          {aiInsights && (
            <div className="bg-indigo-600 text-white p-5 rounded-[2rem] mb-6 shadow-xl shadow-indigo-100 relative overflow-hidden animate-in slide-in-from-top duration-300 border border-white/20">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-icons-round text-lg">auto_awesome</span>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-200">AI-Powered Community Insight</h3>
              </div>
              <p className="text-sm leading-relaxed text-indigo-50 font-medium">
                {aiInsights}
              </p>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                 <button className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-xl hover:bg-white/30 transition-colors">Generate SMS Reminders</button>
                 <button onClick={() => setAiInsights(null)} className="text-white/40 hover:text-white">
                    <span className="material-icons-round text-sm">close</span>
                 </button>
              </div>
            </div>
          )}

          <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex items-center mb-6 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <div className="w-10 h-10 flex items-center justify-center text-slate-400">
               <span className="material-icons-round">search</span>
            </div>
            <input 
              type="text" 
              placeholder="Search by Baby Name or ID..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-2 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Patient List</h3>
             <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isSyncing ? 'Syncing...' : 'Local DB Ready'}</p>
             </div>
          </div>

          <div className="space-y-3">
            {filteredBabies.map(baby => (
              <BabyCard key={baby.id} baby={baby} onClick={setSelectedBaby} />
            ))}
            {filteredBabies.length === 0 && (
              <div className="py-20 text-center">
                <span className="material-icons-round text-slate-200 text-6xl">person_search</span>
                <p className="text-slate-400 font-bold mt-4">No matching records found</p>
                <button onClick={() => setActiveFilter('ALL')} className="text-indigo-600 text-xs font-bold mt-2">Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isRegistering && (
        <div className="animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setIsRegistering(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 active:scale-90 transition-transform">
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Register New Baby</h2>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-50">
            <div className="mb-8 p-5 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm relative overflow-hidden">
                  {isOcrLoading ? (
                    <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : <span className="material-icons-round">document_scanner</span>}
               </div>
               <div className="flex-1">
                  <h4 className="text-sm font-black text-indigo-900">AI Digitization</h4>
                  <p className="text-[10px] font-medium text-indigo-600/60 uppercase tracking-widest">Auto-fill from paper card photo</p>
               </div>
               <button 
                type="button"
                onClick={handleOcrClick}
                disabled={isOcrLoading}
                className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
               >
                  <span className="material-icons-round text-sm">camera_alt</span>
               </button>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-2">First Name</label>
                  <input type="text" required value={newBaby.firstName} onChange={e => setNewBaby({...newBaby, firstName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-2">Last Name</label>
                  <input type="text" required value={newBaby.lastName} onChange={e => setNewBaby({...newBaby, lastName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-2">Date of Birth</label>
                <input type="date" required value={newBaby.dateOfBirth} onChange={e => setNewBaby({...newBaby, dateOfBirth: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-2">Parent/Guardian Name</label>
                <input type="text" required value={newBaby.parentName} onChange={e => setNewBaby({...newBaby, parentName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-2">Guardian Phone</label>
                <input type="tel" required placeholder="+237 ..." value={newBaby.parentPhone} onChange={e => setNewBaby({...newBaby, parentPhone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-2">Village</label>
                <input type="text" required value={newBaby.village} onChange={e => setNewBaby({...newBaby, village: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
              </div>
              <button type="submit" disabled={isSyncing} className="w-full bg-indigo-600 text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-indigo-100 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                {isSyncing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Syncing with Regional DB...
                  </>
                ) : 'Complete Onboarding'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedBaby && (
        <div className="animate-in slide-in-from-right duration-300 pb-10">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setSelectedBaby(null)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 active:scale-90 transition-transform">
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">VaxCard Pro Digital</h2>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white relative">
              <button 
                onClick={() => setShowQrModal(true)}
                className="absolute top-8 right-8 w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-2 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
              >
                 <span className="material-icons-round text-4xl">qr_code_2</span>
              </button>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">EPI Regional Database</p>
              <h3 className="text-3xl font-black tracking-tighter mb-2">{selectedBaby.firstName} {selectedBaby.lastName}</h3>
              <div className="flex gap-4">
                 <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">{selectedBaby.gender === 'F' ? 'Female' : 'Male'}</span>
                 <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">{selectedBaby.id}</span>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Surveillance</h4>
                    <p className="text-lg font-black text-slate-800">Weight-for-Age</p>
                  </div>
                  <button className="text-indigo-600 font-bold text-[10px] uppercase bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 active:scale-95 transition-transform">
                    Record Weigh-in
                  </button>
                </div>
                {selectedBaby.weightHistory && (
                  <GrowthChart data={selectedBaby.weightHistory} gender={selectedBaby.gender} />
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vaccination Coverage</h4>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] font-black text-indigo-600">{Math.round((selectedBaby.vaccines.filter(v => v.status === VaccineStatus.COMPLETED).length / selectedBaby.vaccines.length) * 100)}%</p>
                   <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${(selectedBaby.vaccines.filter(v => v.status === VaccineStatus.COMPLETED).length / selectedBaby.vaccines.length) * 100}%` }}></div>
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                {selectedBaby.vaccines.map((vax) => (
                  <div key={vax.id} className={`flex gap-4 p-4 rounded-2xl transition-colors ${vax.status === VaccineStatus.DUE ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}>
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full mt-1.5 z-10 border-2 border-white ring-2 ${
                        vax.status === VaccineStatus.COMPLETED ? 'bg-emerald-500 ring-emerald-100' : 
                        vax.status === VaccineStatus.MISSED ? 'bg-rose-500 ring-rose-100' : 
                        vax.status === VaccineStatus.DUE ? 'bg-indigo-500 ring-indigo-100 animate-pulse' : 'bg-slate-200 ring-slate-50'
                      }`} />
                      <div className="w-0.5 flex-1 bg-slate-100 -my-1 mt-2" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-black text-slate-800 text-sm tracking-tight">{vax.name}</h5>
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{vax.targetAge}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm ${
                            vax.status === VaccineStatus.COMPLETED ? 'bg-emerald-50 text-emerald-600' :
                            vax.status === VaccineStatus.MISSED ? 'bg-rose-50 text-rose-600' : 
                            vax.status === VaccineStatus.DUE ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
                          }`}>
                            {vax.status}
                          </span>
                        </div>
                      </div>
                      {role === UserRole.NURSE && vax.status !== VaccineStatus.COMPLETED && (
                        <div className="mt-4 flex gap-2">
                          <button onClick={() => updateVaccine(selectedBaby.id, vax.id)}
                            className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg shadow-indigo-100 uppercase tracking-widest active:scale-95 transition-all">
                            Log Administered
                          </button>
                          <button className="bg-slate-100 text-slate-400 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-slate-200 transition-colors">
                            Batch #
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Download/Demo Modal */}
      {showQrModal && selectedBaby && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] p-8 w-full max-w-xs text-center relative animate-in zoom-in duration-300">
              <button 
                onClick={() => setShowQrModal(false)}
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-600"
              >
                <span className="material-icons-round">close</span>
              </button>
              
              <h3 className="text-xl font-black text-slate-800 mb-2">Digital ID</h3>
              <p className="text-xs text-slate-400 mb-8 font-medium">Scan this code at any regional clinic to retrieve {selectedBaby.firstName}'s records.</p>
              
              <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-[2rem] inline-block mb-8">
                 {/* QR Simulation - in a real app use a lib like qrcode.react */}
                 <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center border border-slate-200 relative">
                    <span className="material-icons-round text-8xl text-indigo-900 opacity-20">qr_code_2</span>
                    <div className="absolute inset-4 border-4 border-indigo-900 rounded-lg flex flex-col items-center justify-center gap-1">
                       <span className="text-[10px] font-black text-indigo-900 tracking-tighter">VaxEase</span>
                       <div className="w-24 h-24 border-2 border-indigo-900 flex items-center justify-center font-black text-xs">
                          {selectedBaby.id}
                       </div>
                    </div>
                 </div>
              </div>
              
              <button 
                onClick={() => setShowQrModal(false)}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
              >
                 <span className="material-icons-round text-sm">download</span>
                 Download for Demo
              </button>
           </div>
        </div>
      )}

      {loadingInsights && (
        <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-md z-[200] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-[280px]">
             <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
             <h3 className="text-2xl font-black text-indigo-900 tracking-tighter mb-2">Analyzing Public Health</h3>
             <p className="text-slate-500 text-sm font-medium leading-relaxed">Gemini AI is processing regional session data to predict coverage gaps...</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
