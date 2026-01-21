
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserRole, Baby, VaccineStatus, ClinicStats, VaccineRecord, TrendPoint } from './types.ts';
import { generateInitialVaxRecord } from './constants.ts';
import { Layout } from './components/Layout.tsx';
import { DashboardStats } from './components/DashboardStats.tsx';
import { BabyCard } from './components/BabyCard.tsx';
import { getPublicHealthInsights } from './services/geminiService.ts';
import { SplashScreen } from './components/SplashScreen.tsx';
import { GrowthChart } from './components/GrowthChart.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { VaccineModal } from './components/VaccineModal.tsx';
import { OutreachMap } from './components/OutreachMap.tsx';
import { CoverageTrends } from './components/CoverageTrends.tsx';
import { RegistrationModal } from './components/RegistrationModal.tsx';
import { HealthIDCard } from './components/HealthIDCard.tsx';

// Declare jsQR for TypeScript
declare const jsQR: any;

const TODAY = new Date().toISOString().split('T')[0];

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
    vaccines: generateInitialVaxRecord('2023-12-15').map(v => v.dueDate <= TODAY ? { ...v, status: VaccineStatus.COMPLETED, completedDate: v.dueDate } : v),
    weightHistory: [
      { ageMonths: 0, weightKg: 3.2, date: '2023-12-15' },
      { ageMonths: 3, weightKg: 5.8, date: '2024-03-15' },
      { ageMonths: 6, weightKg: 7.4, date: '2024-06-15' },
      { ageMonths: 9, weightKg: 8.5, date: '2024-09-15' },
      { ageMonths: 12, weightKg: 9.3, date: '2024-12-15' },
    ],
    location: { lat: 4.155, lng: 9.245 }
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
      { ageMonths: 3, weightKg: 6.1, date: '2024-04-20' },
    ],
    location: { lat: 4.145, lng: 9.235 }
  },
  {
    id: 'VX-2024-003',
    firstName: 'Divine',
    lastName: 'Ngole',
    dateOfBirth: '2024-02-10',
    gender: 'M',
    parentName: 'Evelyn Ngole',
    parentPhone: '+237 680 99 88 77',
    village: 'Molyko',
    registrationDate: '2024-02-10',
    qrCode: 'VX-2024-003',
    vaccines: generateInitialVaxRecord('2024-02-10').map((v, i) => i < 2 ? { ...v, status: VaccineStatus.COMPLETED, completedDate: v.dueDate } : (i < 5 ? { ...v, status: VaccineStatus.MISSED } : v)),
    weightHistory: [
      { ageMonths: 0, weightKg: 3.1, date: '2024-02-10' },
      { ageMonths: 4, weightKg: 6.0, date: '2024-06-10' },
    ],
    location: { lat: 4.148, lng: 9.232 }
  },
  {
    id: 'VX-2024-004',
    firstName: 'Precious',
    lastName: 'Manyi',
    dateOfBirth: '2024-03-05',
    gender: 'F',
    parentName: 'Rose Manyi',
    parentPhone: '+237 655 22 33 44',
    village: 'Buea Town',
    registrationDate: '2024-03-05',
    qrCode: 'VX-2024-004',
    vaccines: generateInitialVaxRecord('2024-03-05').map(v => v.dueDate <= TODAY ? { ...v, status: VaccineStatus.COMPLETED, completedDate: v.dueDate } : v),
    weightHistory: [
      { ageMonths: 0, weightKg: 3.4, date: '2024-03-05' },
      { ageMonths: 2, weightKg: 4.9, date: '2024-05-05' },
    ],
    location: { lat: 4.152, lng: 9.248 }
  },
  {
    id: 'VX-2024-005',
    firstName: 'Jean-Claude',
    lastName: 'Atangana',
    dateOfBirth: '2023-11-20',
    gender: 'M',
    parentName: 'Marie Atangana',
    parentPhone: '+237 699 00 11 22',
    village: 'Mile 16',
    registrationDate: '2023-11-20',
    qrCode: 'VX-2024-005',
    vaccines: generateInitialVaxRecord('2023-11-20').map((v, i) => i < 3 ? { ...v, status: VaccineStatus.COMPLETED, completedDate: v.dueDate } : (i < 8 ? { ...v, status: VaccineStatus.MISSED } : v)),
    weightHistory: [
      { ageMonths: 0, weightKg: 3.0, date: '2023-11-20' },
      { ageMonths: 6, weightKg: 6.8, date: '2024-05-20' },
    ],
    location: { lat: 4.162, lng: 9.255 }
  },
  {
    id: 'VX-2024-006',
    firstName: 'Miriam',
    lastName: 'Bakari',
    dateOfBirth: '2024-08-12',
    gender: 'F',
    parentName: 'Hadidja Bakari',
    parentPhone: '+237 671 22 44 66',
    village: 'Muea',
    registrationDate: '2024-08-12',
    qrCode: 'VX-2024-006',
    vaccines: generateInitialVaxRecord('2024-08-12'),
    weightHistory: [
      { ageMonths: 0, weightKg: 3.2, date: '2024-08-12' },
    ],
    location: { lat: 4.140, lng: 9.225 }
  },
  {
    id: 'VX-2024-007',
    firstName: 'Junior',
    lastName: 'Tanyi',
    dateOfBirth: '2023-10-05',
    gender: 'M',
    parentName: 'Solange Tanyi',
    parentPhone: '+237 678 88 55 22',
    village: 'Bonduma',
    registrationDate: '2023-10-05',
    qrCode: 'VX-2024-007',
    vaccines: generateInitialVaxRecord('2023-10-05').map(v => v.dueDate <= TODAY ? { ...v, status: VaccineStatus.COMPLETED, completedDate: v.dueDate } : v),
    weightHistory: [
      { ageMonths: 0, weightKg: 3.6, date: '2023-10-05' },
      { ageMonths: 6, weightKg: 7.8, date: '2024-04-05' },
      { ageMonths: 12, weightKg: 10.1, date: '2024-10-05' },
    ],
    location: { lat: 4.158, lng: 9.238 }
  }
];

const TREND_DATA: TrendPoint[] = [
  { month: 'Jan', completed: 45, missed: 8, due: 55 },
  { month: 'Feb', completed: 52, missed: 5, due: 58 },
  { month: 'Mar', completed: 48, missed: 12, due: 62 },
  { month: 'Apr', completed: 65, missed: 4, due: 70 },
  { month: 'May', completed: 58, missed: 7, due: 68 },
  { month: 'Jun', completed: 72, missed: 3, due: 78 },
];

const CLINIC_LOC = { lat: 4.15, lng: 9.24 };

const App: React.FC = () => {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.NURSE);
  const [babies, setBabies] = useState<Baby[]>(INITIAL_BABIES);
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [showHealthCard, setShowHealthCard] = useState<Baby | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOutreachMap, setShowOutreachMap] = useState(false);
  const [editingVax, setEditingVax] = useState<VaccineRecord | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MISSED' | 'DUE_TODAY' | 'COMPLETED' | 'OUTREACH'>('ALL');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement>(null);

  const stats: ClinicStats = useMemo(() => {
    return {
      totalBabies: babies.length,
      completedVaxCount: babies.filter(b => 
        b.vaccines.filter(v => v.dueDate <= TODAY).every(v => v.status === VaccineStatus.COMPLETED)
      ).length,
      missedDoseCount: babies.reduce((acc, b) => acc + b.vaccines.filter(v => v.status === VaccineStatus.MISSED).length, 0),
      activeOutreachCount: babies.filter(b => b.vaccines.some(v => v.status === VaccineStatus.MISSED)).length
    };
  }, [babies]);

  const filteredBabies = useMemo(() => {
    return babies.filter(b => {
      const matchesSearch = `${b.firstName} ${b.lastName} ${b.id} ${b.village}`.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'MISSED') return b.vaccines.some(v => v.status === VaccineStatus.MISSED);
      if (activeFilter === 'COMPLETED') {
        return b.vaccines.filter(v => v.dueDate <= TODAY).every(v => v.status === VaccineStatus.COMPLETED);
      }
      if (activeFilter === 'OUTREACH') return b.vaccines.some(v => v.status === VaccineStatus.MISSED);
      return true;
    });
  }, [babies, searchQuery, activeFilter]);

  useEffect(() => {
    let animationFrameId: number;
    let stream: MediaStream | null = null;
    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = scanCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
              const found = babies.find(b => b.id === code.data);
              if (found) {
                setSelectedBaby(found);
                setIsScanning(false);
                return;
              }
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };
    if (isScanning) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => { 
          stream = s; 
          if (videoRef.current) { 
            videoRef.current.srcObject = stream; 
            videoRef.current.play(); 
            requestAnimationFrame(tick); 
          } 
        })
        .catch(() => setIsScanning(false));
    }
    return () => { 
      cancelAnimationFrame(animationFrameId); 
      if (stream) stream.getTracks().forEach(t => t.stop()); 
    };
  }, [isScanning, babies]);

  const handleCardClick = (filter: 'ALL' | 'COMPLETED' | 'MISSED' | 'OUTREACH', openMap?: boolean) => {
    setActiveFilter(filter);
    if (openMap) setShowOutreachMap(true);
    else setShowOutreachMap(false);
  };

  const resetViews = () => {
    setSelectedBaby(null);
    setIsScanning(false);
    setIsSettingsOpen(false);
    setShowOutreachMap(false);
    setIsRegistering(false);
    setActiveFilter('ALL');
  };

  const handleSaveVaccine = (details: { completedDate: string; providerId: string; batchNumber: string; status: VaccineStatus }) => {
    if (!selectedBaby || !editingVax || role !== UserRole.NURSE) return;
    const updatedVaccines = selectedBaby.vaccines.map(v => 
      v.id === editingVax.id ? { ...v, ...details } : v
    );
    const updatedBaby = { ...selectedBaby, vaccines: updatedVaccines };
    setBabies(prev => prev.map(b => b.id === selectedBaby.id ? updatedBaby : b));
    setSelectedBaby(updatedBaby);
    setEditingVax(null);
  };

  const handleAddBaby = (newBaby: Baby) => {
    if (role !== UserRole.NURSE) return;
    setBabies(prev => [newBaby, ...prev]);
    setIsRegistering(false);
    setSelectedBaby(newBaby);
  };

  const isNurse = role === UserRole.NURSE;

  if (!isSplashComplete) return <SplashScreen onComplete={() => setIsSplashComplete(true)} />;

  const coveragePercentage = selectedBaby ? Math.round((selectedBaby.vaccines.filter(v => v.status === VaccineStatus.COMPLETED).length / selectedBaby.vaccines.length) * 100) : 0;

  return (
    <Layout 
      role={role} 
      onSwitchRole={(r) => { resetViews(); setRole(r); }} 
      onHome={resetViews} 
      onScan={() => { resetViews(); setIsScanning(true); }}
      onSettings={() => { resetViews(); setIsSettingsOpen(true); }}
      activeTab={isSettingsOpen ? 'settings' : 'home'}
    >
      <canvas ref={scanCanvasRef} className="hidden" />

      {isScanning && (
        <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-72 h-72 border-2 border-teal-500 rounded-[3rem] relative animate-pulse shadow-[0_0_50px_rgba(20,184,166,0.2)]">
               <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_15px_#14b8a6] animate-bounce"></div>
            </div>
            <p className="absolute bottom-40 text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Align QR with Frame</p>
          </div>
          <button onClick={() => setIsScanning(false)} className="absolute bottom-24 bg-white/10 backdrop-blur-md border border-white/10 px-8 py-3 rounded-2xl font-bold uppercase text-[10px] text-white">Cancel</button>
        </div>
      )}

      {isRegistering && isNurse && <RegistrationModal onSave={handleAddBaby} onClose={() => setIsRegistering(false)} />}
      
      {showHealthCard && <HealthIDCard baby={showHealthCard} onClose={() => setShowHealthCard(null)} />}

      {isSettingsOpen && (
        <SettingsView 
          role={role} 
          onHome={resetViews} 
          onLogout={() => window.location.reload()} 
        />
      )}

      {!isSettingsOpen && !selectedBaby && !isScanning && (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{isNurse ? 'Clinic Dashboard' : 'Outreach Radar'}</h2>
            <div className="flex gap-2">
              {isNurse && (
                <button 
                  onClick={() => setIsRegistering(true)} 
                  className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                >
                  <span className="material-icons-round">person_add</span>
                </button>
              )}
              <button 
                onClick={async () => { 
                  setLoadingInsights(true); 
                  const insights = await getPublicHealthInsights(babies, stats);
                  setAiInsights(insights); 
                  setLoadingInsights(false); 
                }}
                className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                {loadingInsights ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-icons-round">auto_awesome</span>
                )}
              </button>
            </div>
          </div>

          {aiInsights && (
            <div className="bg-teal-900 text-white p-6 rounded-[2rem] mb-8 shadow-2xl animate-in slide-in-from-top border border-teal-800">
              <div className="flex justify-between mb-2">
                <span className="text-[9px] font-black uppercase text-teal-400 tracking-[0.2em]">AI Intelligence Unit</span>
                <button onClick={() => setAiInsights(null)} className="opacity-50 hover:opacity-100 transition-opacity"><span className="material-icons-round text-xs">close</span></button>
              </div>
              <p className="text-xs leading-relaxed opacity-90 font-medium">{aiInsights}</p>
            </div>
          )}
          
          <DashboardStats stats={stats} onCardClick={handleCardClick} activeFilter={activeFilter} />

          {!showOutreachMap && activeFilter === 'ALL' && <CoverageTrends data={TREND_DATA} />}

          {showOutreachMap ? (
            <OutreachMap babies={babies} clinicLocation={CLINIC_LOC} />
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center focus-within:border-teal-500 transition-colors">
                <span className="material-icons-round text-slate-400 ml-3">search</span>
                <input 
                  type="text" 
                  placeholder="ID, Name, or Village..." 
                  className="flex-1 bg-transparent p-3 text-sm font-bold outline-none placeholder:text-slate-300" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                />
              </div>
              <div className="space-y-3">
                {filteredBabies.map(baby => <BabyCard key={baby.id} baby={baby} onClick={setSelectedBaby} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedBaby && !isScanning && !isSettingsOpen && (
        <div className="animate-in slide-in-from-right pb-20">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setSelectedBaby(null)} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200 transition-all active:scale-90 hover:text-teal-600">
              <span className="material-icons-round">arrow_back</span>
            </button>
            <button 
              onClick={() => setShowHealthCard(selectedBaby)}
              className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95 transition-all border border-white/5"
            >
              <span className="material-icons-round text-sm">badge</span>
              Health ID Card
            </button>
          </div>
          
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden mb-6">
            <div className="bg-slate-950 p-8 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <span className="material-icons-round text-8xl">verified_user</span>
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{selectedBaby.firstName} {selectedBaby.lastName}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[9px] uppercase font-bold text-teal-400 tracking-widest bg-white/5 px-2.5 py-1 rounded-md border border-white/5">{selectedBaby.id}</span>
                    {!isNurse && (
                      <span className="text-[9px] uppercase font-black text-rose-400 tracking-widest bg-white/5 px-2.5 py-1 rounded-md border border-white/5">View Only</span>
                    )}
                  </div>
                </div>
                <div onClick={() => setShowHealthCard(selectedBaby)} className="w-16 h-16 bg-white p-1 rounded-xl shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 border-2 border-slate-900">
                   <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900"><path fill="currentColor" d="M3,3H9V9H3V3M5,5V7H7V5H5M15,3H21V9H15V3M17,5V7H19V5H17M3,15H9V21H3V15M5,17V19H7V17H5M15,15H17V17H15V15M17,17H19V19H17V17M19,19H21V21H19V19M17,19V21H15V19H17M19,15H21V17H19V15M21,11H19V13H21V11M13,3H11V5H13V3M11,7H13V9H11V7M13,11H11V13H13V11M11,15H13V17H11V15M13,19H11V21H13V19M7,11H9V13H7V11M3,11H5V13H3V11M15,11H17V13H15V11M11,11V9H9V11H11Z" /></svg>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Growth Intelligence</h4>
                 <GrowthChart data={selectedBaby.weightHistory || []} gender={selectedBaby.gender} />
              </div>

              <div className="flex justify-between items-center mb-6 px-1 mt-10">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-[0.2em]">REGISTRY DETAILS</h4>
                <div className="text-[10px] font-black text-teal-600 bg-[#e6fff7] px-4 py-1.5 rounded-full border border-teal-100 uppercase tracking-widest shadow-sm">
                  {coveragePercentage}% COVERAGE
                </div>
              </div>

              <div className="space-y-4">
                {selectedBaby.vaccines.map(vax => (
                  <div 
                    key={vax.id} 
                    onClick={() => { 
                      if (isNurse && vax.status !== VaccineStatus.COMPLETED) {
                        setEditingVax(vax); 
                      }
                    }}
                    className={`flex items-center gap-5 p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all group ${isNurse && vax.status !== VaccineStatus.COMPLETED ? 'hover:border-teal-500 hover:shadow-lg cursor-pointer' : 'opacity-80'}`}
                  >
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        vax.status === VaccineStatus.COMPLETED ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 
                        vax.status === VaccineStatus.MISSED ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 
                        vax.status === VaccineStatus.DUE ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                        'bg-slate-300'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-slate-900 text-base tracking-tight">{vax.name}</h5>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {vax.targetAge.toUpperCase()} • {vax.dueDate}
                      </p>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                       <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 transition-colors ${
                         vax.status === VaccineStatus.COMPLETED ? 'bg-teal-50 text-teal-600' :
                         vax.status === VaccineStatus.MISSED ? 'bg-rose-50 text-rose-600' :
                         vax.status === VaccineStatus.DUE ? 'bg-amber-50 text-amber-600' :
                         'bg-slate-50 text-slate-300'
                       }`}>
                          <span className="material-icons-round text-xl">
                            {vax.status === VaccineStatus.COMPLETED ? 'check_circle' : 
                             vax.status === VaccineStatus.MISSED ? 'error' : 
                             vax.status === VaccineStatus.DUE ? 'notification_important' : 
                             'schedule'}
                          </span>
                       </div>
                       {vax.status === VaccineStatus.COMPLETED && (
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{vax.completedDate}</span>
                       )}
                       {!isNurse && vax.status !== VaccineStatus.COMPLETED && (
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">LOCKED</span>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {editingVax && isNurse && <VaccineModal vaccine={editingVax} onSave={handleSaveVaccine} onClose={() => setEditingVax(null)} />}
    </Layout>
  );
};

export default App;
