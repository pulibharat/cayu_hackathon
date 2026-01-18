
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserRole, Baby, VaccineStatus, ClinicStats, VaccineRecord, BabyLocation } from './types';
import { generateInitialVaxRecord } from './constants';
import { Layout } from './components/Layout';
import { DashboardStats } from './components/DashboardStats';
import { BabyCard } from './components/BabyCard';
import { getPublicHealthInsights, analyzeHealthCard } from './services/geminiService';
import { SplashScreen } from './components/SplashScreen';
import { GrowthChart } from './components/GrowthChart';
import { SettingsView } from './components/SettingsView';
import { VaccineModal } from './components/VaccineModal';
import { OutreachMap } from './components/OutreachMap';
import { Logo } from './components/Logo';

// Declare jsQR for TypeScript
declare const jsQR: any;

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
    ],
    location: { lat: 4.145, lng: 9.235 }
  }
];

const CLINIC_LOC = { lat: 4.15, lng: 9.24 };

const App: React.FC = () => {
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.NURSE);
  const [babies, setBabies] = useState<Baby[]>(INITIAL_BABIES);
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOutreachMap, setShowOutreachMap] = useState(false);
  const [editingVax, setEditingVax] = useState<VaccineRecord | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MISSED' | 'DUE_TODAY' | 'COMPLETED' | 'OUTREACH'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [ocrFilledFields, setOcrFilledFields] = useState<Set<string>>(new Set());
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement>(null);

  const [newBaby, setNewBaby] = useState<Partial<Baby>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'F',
    parentName: '',
    parentPhone: '',
    village: '',
    location: undefined
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

  // QR Scanning logic
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
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            if (code) {
              const patientId = code.data;
              const found = babies.find(b => b.id === patientId);
              if (found) {
                setSelectedBaby(found);
                setIsScanning(false);
                return; // Stop scanning
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
            videoRef.current.setAttribute("playsinline", "true");
            videoRef.current.play();
            requestAnimationFrame(tick);
          }
        })
        .catch(err => {
          console.error("Camera error:", err);
          setIsScanning(false);
          alert("Could not access camera. Please check permissions.");
        });
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isScanning, babies]);

  const handleCardClick = (filter: 'ALL' | 'COMPLETED' | 'MISSED' | 'OUTREACH', openMap?: boolean) => {
    setActiveFilter(filter);
    if (openMap) setShowOutreachMap(true);
    else setShowOutreachMap(false);
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const insights = await getPublicHealthInsights(babies, stats);
      setAiInsights(insights);
    } catch (err) {
       console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleLogout = () => {
    setIsSplashComplete(false);
    resetViews();
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewBaby(prev => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Captured via GPS"
          }
        }));
        setIsLocating(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("Unable to retrieve location. Please check permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

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
        qrCode: id,
        vaccines: generateInitialVaxRecord(newBaby.dateOfBirth!),
        weightHistory: [{ ageMonths: 0, weightKg: 3.3, date: new Date().toISOString().split('T')[0] }]
      };

      setBabies(prev => [...prev, baby]);
      setIsRegistering(false);
      setIsSyncing(false);
      setNewBaby({ firstName: '', lastName: '', dateOfBirth: '', gender: 'F', parentName: '', parentPhone: '', village: '', location: undefined });
      setSelectedBaby(baby);
      setOcrFilledFields(new Set());
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
        const filled = new Set<string>();
        if (result.firstName) filled.add('firstName');
        if (result.lastName) filled.add('lastName');
        if (result.dateOfBirth) filled.add('dateOfBirth');
        if (result.parentName) filled.add('parentName');
        if (result.village) filled.add('village');
        
        setOcrFilledFields(filled);
        setNewBaby(prev => ({
          ...prev,
          firstName: result.firstName || prev.firstName,
          lastName: result.lastName || prev.lastName,
          dateOfBirth: result.dateOfBirth || prev.dateOfBirth,
          parentName: result.parentName || prev.parentName,
          village: result.village || prev.village
        }));
      }
      setIsOcrLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const downloadIdCard = () => {
    if (!selectedBaby || !canvasRef.current) return;
    setIsDownloading(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsDownloading(false);
      return;
    }

    // High resolution card dimensions (approx ID-1 card ratio)
    canvas.width = 1012; 
    canvas.height = 638;

    // Helper for rounded rect (better browser compatibility than canvas.roundRect)
    const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    // 1. Draw Background
    ctx.fillStyle = '#0f172a'; // Deep slate
    drawRoundedRect(0, 0, canvas.width, canvas.height, 48);
    ctx.fill();

    // 2. Draw Subtle Gradient Overlays
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(20, 184, 166, 0.25)'); // Teal
    gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Draw Brand Label
    ctx.fillStyle = '#14b8a6'; // VaxEase Teal
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('VAXEASE • GLOBAL HEALTH ID', 70, 90);

    // 4. Draw Patient Information
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 84px sans-serif';
    ctx.fillText(`${selectedBaby.firstName.toUpperCase()}`, 70, 240);
    ctx.fillText(`${selectedBaby.lastName.toUpperCase()}`, 70, 330);

    // 5. Draw Patient ID Section
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`ID: ${selectedBaby.id}`, 70, 400);

    // 6. Draw Metadata Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    drawRoundedRect(70, 450, 240, 70, 20);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(selectedBaby.gender === 'F' ? 'FEMALE' : 'MALE', 95, 495);

    // 7. Load and Draw QR Code (Using external API with CORS handling)
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    // We request a larger size for clarity when scanned from a screen or print
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(selectedBaby.id)}&bgcolor=ffffff&color=0f172a&margin=20`;
    
    const handleDrawingComplete = () => {
      try {
        const link = document.createElement('a');
        link.download = `VaxEase_ID_${selectedBaby.id}_${selectedBaby.lastName}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Download failed:", err);
        alert("Failed to generate download. Please try again.");
      } finally {
        setIsDownloading(false);
        setShowQrModal(false);
      }
    };

    qrImg.onload = () => {
      // White container for QR for best scan contrast
      ctx.fillStyle = '#ffffff';
      drawRoundedRect(630, 160, 320, 320, 32);
      ctx.fill();
      
      // Draw QR Image inside container
      ctx.drawImage(qrImg, 630, 160, 320, 320);

      // 8. Draw Security & Verification Label
      ctx.fillStyle = 'rgba(20, 184, 166, 0.6)';
      ctx.font = '16px sans-serif';
      ctx.fillText('ENCRYPTED REGIONAL REGISTRY • VERIFIED BY MINISTRY OF PUBLIC HEALTH', 70, 580);
      
      handleDrawingComplete();
    };

    qrImg.onerror = () => {
      console.warn("QR Service failed, falling back to ID-only card.");
      // Even if QR fails, we download the card with text info
      handleDrawingComplete();
    };
  };

  const resetViews = () => {
    setIsRegistering(false);
    setSelectedBaby(null);
    setIsScanning(false);
    setIsSettingsOpen(false);
    setShowOutreachMap(false);
    setActiveFilter('ALL');
  };

  const renderInputField = (label: string, field: keyof typeof newBaby, type: string = 'text', required: boolean = true) => {
    const isAiFilled = ocrFilledFields.has(field as string);
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">{label}</label>
          {isAiFilled && (
            <span className="text-[8px] font-extrabold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md uppercase tracking-tighter flex items-center gap-1 border border-teal-100 animate-in fade-in slide-in-from-right-2">
              <span className="material-icons-round text-[10px]">auto_awesome</span>
              AI Captured
            </span>
          )}
        </div>
        <input 
          type={type} 
          required={required} 
          value={newBaby[field] as string} 
          onChange={e => setNewBaby({...newBaby, [field]: e.target.value})}
          className={`w-full bg-slate-50 border rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white outline-none transition-all ${
            isAiFilled 
              ? 'border-teal-500 bg-teal-50/30 ring-4 ring-teal-500/10' 
              : 'border-slate-200 focus:border-teal-500'
          }`} 
        />
      </div>
    );
  };

  if (!isSplashComplete) {
    return <SplashScreen onComplete={() => setIsSplashComplete(true)} />;
  }

  return (
    <Layout 
      role={role} 
      onSwitchRole={setRole} 
      onHome={resetViews} 
      onScan={() => { resetViews(); setIsScanning(true); }}
      onSettings={() => { resetViews(); setIsSettingsOpen(true); }}
      activeTab={isSettingsOpen ? 'settings' : 'home'}
    >
      
      {/* Hidden system surfaces */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={scanCanvasRef} className="hidden" />

      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />

      {isScanning && (
        <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-72 h-72 border-2 border-teal-500/50 rounded-3xl relative">
               <div className="absolute inset-0 bg-teal-500/5 animate-pulse rounded-3xl"></div>
               <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-teal-500 rounded-tl-3xl"></div>
               <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-teal-500 rounded-tr-3xl"></div>
               <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-teal-500 rounded-bl-3xl"></div>
               <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-teal-500 rounded-br-3xl"></div>
               <div className="absolute top-1/2 left-0 right-0 h-1 bg-teal-500 shadow-[0_0_25px_rgba(20,184,166,1)] animate-scan-line"></div>
            </div>
          </div>
          <style>{`
            @keyframes scan-line {
              0% { transform: translateY(-130px); opacity: 0.5; }
              50% { opacity: 1; }
              100% { transform: translateY(130px); opacity: 0.5; }
            }
            .animate-scan-line { animation: scan-line 2.5s ease-in-out infinite; }
          `}</style>
          <div className="absolute bottom-24 left-0 right-0 px-8 text-center text-white">
            <h3 className="text-xl font-bold mb-2 tracking-tight">Technical Scan Active</h3>
            <p className="text-xs opacity-50 mb-8 font-medium">Position patient card QR code in center...</p>
            <button onClick={() => setIsScanning(false)} className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest">
              Exit Scanner
            </button>
          </div>
        </div>
      )}

      {isSettingsOpen && !selectedBaby && !isRegistering && (
        <SettingsView role={role} onLogout={handleLogout} />
      )}

      {!isSettingsOpen && !selectedBaby && !isRegistering && !isScanning && (
        <div className="animate-in fade-in duration-700">
          <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {role === UserRole.NURSE ? 'Regional Portal' : 'Health Analytics'}
            </h2>
            <div className="flex gap-2">
              {role === UserRole.MIDWIFE && (
                <div className="flex gap-2">
                  <button onClick={() => setShowOutreachMap(!showOutreachMap)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider border transition-all ${showOutreachMap ? 'bg-teal-600 text-white border-teal-500 shadow-lg' : 'bg-white text-slate-600 border-slate-200'}`}>
                    <span className="material-icons-round text-sm">{showOutreachMap ? 'view_list' : 'map'}</span>
                    {showOutreachMap ? 'List' : 'Radar'}
                  </button>
                  <button onClick={fetchInsights} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider border border-slate-800 shadow-md">
                    <span className="material-icons-round text-sm text-teal-400">auto_awesome</span>
                    Analyze
                  </button>
                </div>
              )}
              {role === UserRole.NURSE && (
                <button onClick={() => setIsRegistering(true)} className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/20 active:scale-95 transition-all border border-teal-400/30">
                  <span className="material-icons-round">add_circle</span>
                </button>
              )}
            </div>
          </div>
          
          <DashboardStats stats={stats} onCardClick={handleCardClick} activeFilter={activeFilter} />

          {showOutreachMap && role === UserRole.MIDWIFE ? (
            <div className="mb-6 animate-in zoom-in duration-300">
               <OutreachMap babies={babies} clinicLocation={CLINIC_LOC} />
            </div>
          ) : (
            <>
              {aiInsights && (
                <div className="bg-slate-900 text-white p-6 rounded-3xl mb-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-top duration-500 border border-slate-800">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-icons-round text-lg text-teal-400">psychology</span>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/80">Gemini Intelligence Layer</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300 font-medium">{aiInsights}</p>
                  <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-center">
                    <button className="text-[9px] font-bold uppercase tracking-widest bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-500 shadow-lg shadow-teal-500/10">Execute Reminders</button>
                    <button onClick={() => setAiInsights(null)} className="text-slate-500 hover:text-white transition-colors">
                        <span className="material-icons-round text-lg">close</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center mb-8 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                <div className="w-10 h-10 flex items-center justify-center text-slate-400">
                  <span className="material-icons-round">search</span>
                </div>
                <input 
                  type="text" 
                  placeholder="Patient Name or ID..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold py-2 pr-4 text-slate-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {filteredBabies.map(baby => (
                  <BabyCard key={baby.id} baby={baby} onClick={setSelectedBaby} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {isRegistering && (
        <div className="animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setIsRegistering(false)} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-200">
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tighter">New Registration</h2>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative">
            {isOcrLoading && (
              <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center p-8 rounded-[2.5rem]">
                <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Digitize</h4>
                <p className="text-xs text-slate-500 font-bold text-center mt-2 max-w-[200px]">Extracting text from paper card...</p>
              </div>
            )}

            <div className="mb-10 p-5 bg-slate-50 border border-slate-200 rounded-3xl flex items-center gap-5">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm">
                  <span className="material-icons-round text-2xl">sensors</span>
               </div>
               <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">OCR Capture</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scan existing document</p>
               </div>
               <button type="button" onClick={handleOcrClick} className="bg-teal-600 text-white p-3 rounded-2xl shadow-xl shadow-teal-500/20 active:scale-95">
                  <span className="material-icons-round">document_scanner</span>
               </button>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {renderInputField('First Name', 'firstName')}
                {renderInputField('Last Name', 'lastName')}
              </div>
              {renderInputField('Date of Birth', 'dateOfBirth', 'date')}
              {renderInputField('Guardian Identity', 'parentName')}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] pl-1">Contact (WhatsApp/SMS)</label>
                <input type="tel" required placeholder="+237 ..." value={newBaby.parentPhone} onChange={e => setNewBaby({...newBaby, parentPhone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-teal-500 outline-none transition-all" />
              </div>
              {renderInputField('Village / Quarter', 'village')}

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] pl-1">Geo-Tagging (GPS)</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-[11px] font-bold text-slate-400 flex items-center gap-3">
                     <span className="material-icons-round text-teal-500 text-sm">gps_fixed</span>
                     {newBaby.location?.lat ? `${newBaby.location.lat.toFixed(6)}, ${newBaby.location.lng.toFixed(6)}` : 'Establishing GPS link...'}
                  </div>
                  <button type="button" onClick={handleCaptureLocation} className="bg-slate-900 text-white px-5 rounded-2xl shadow-lg active:scale-95">
                    {isLocating ? <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div> : <span className="material-icons-round text-sm">my_location</span>}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isSyncing} className="w-full bg-teal-600 text-white font-extrabold py-5 rounded-2xl shadow-xl shadow-teal-500/20 active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                {isSyncing ? 'Encrypting Record...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedBaby && !isScanning && (
        <div className="animate-in slide-in-from-right duration-500 pb-20">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setSelectedBaby(null)} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-200">
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h2 className="text-xl font-extrabold text-slate-900">Health Registry File</h2>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden mb-8">
            <div className="bg-slate-950 p-10 text-white relative">
              <button onClick={() => setShowQrModal(true)} className="absolute top-8 right-8 w-16 h-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2 flex items-center justify-center shadow-2xl active:scale-90 transition-all">
                 <span className="material-icons-round text-4xl text-teal-400">qr_code_2</span>
              </button>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-2">Patient Digital ID</p>
              <h3 className="text-3xl font-extrabold tracking-tight mb-6 leading-none">{selectedBaby.firstName}<br/>{selectedBaby.lastName}</h3>
              <div className="flex flex-wrap gap-2">
                 <span className="text-[9px] font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">{selectedBaby.id}</span>
                 <span className="text-[9px] font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">{selectedBaby.village}</span>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-8 px-1">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Immunization Status</h4>
                <div className="flex items-center gap-3">
                   <p className="text-xs font-extrabold text-teal-600">{Math.round((selectedBaby.vaccines.filter(v => v.status === VaccineStatus.COMPLETED).length / selectedBaby.vaccines.length) * 100)}%</p>
                   <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-teal-500" style={{ width: `${(selectedBaby.vaccines.filter(v => v.status === VaccineStatus.COMPLETED).length / selectedBaby.vaccines.length) * 100}%` }}></div>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedBaby.vaccines.map((vax) => (
                  <div key={vax.id} className={`flex gap-5 p-5 rounded-3xl transition-all border ${vax.status === VaccineStatus.DUE ? 'bg-teal-50/20 border-teal-200 shadow-xl shadow-teal-100/50' : 'bg-white border-slate-100'}`}>
                    <div className="flex flex-col items-center">
                      <div className={`w-5 h-5 rounded-full mt-1.5 z-10 border-4 border-white shadow-sm ${
                        vax.status === VaccineStatus.COMPLETED ? 'bg-teal-500' : 
                        vax.status === VaccineStatus.MISSED ? 'bg-orange-500' : 
                        vax.status === VaccineStatus.DUE ? 'bg-teal-500 animate-pulse' : 'bg-slate-200'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-slate-900 text-base">{vax.name}</h5>
                          <p className="text-[9px] text-slate-400 uppercase font-extrabold mt-1">{vax.targetAge}</p>
                        </div>
                        <span className={`text-[8px] font-bold px-3 py-1 rounded-lg uppercase border ${
                          vax.status === VaccineStatus.COMPLETED ? 'bg-teal-50 text-teal-700 border-teal-100' :
                          vax.status === VaccineStatus.MISSED ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                          vax.status === VaccineStatus.DUE ? 'bg-teal-600 text-white border-teal-500 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {vax.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showQrModal && selectedBaby && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[150] flex items-center justify-center p-8 animate-in fade-in duration-500">
           <div className="bg-white rounded-[3rem] p-12 w-full max-w-xs text-center relative animate-in zoom-in duration-300 shadow-2xl">
              <button onClick={() => setShowQrModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors">
                <span className="material-icons-round text-2xl">close</span>
              </button>
              
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Registry ID Card</h3>
              <p className="text-[10px] text-slate-400 mb-10 font-bold uppercase tracking-[0.2em]">Verified Secure Link</p>
              
              <div className="bg-slate-50 p-6 rounded-[2.5rem] shadow-inner mb-10 border border-slate-100">
                 <div className="w-44 h-44 bg-white rounded-3xl flex items-center justify-center border-2 border-slate-900 relative overflow-hidden shadow-lg">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(selectedBaby.id)}&bgcolor=f8fafc&color=0f172a&margin=10`} 
                      alt="QR Registry ID"
                      className="w-full h-full object-contain p-2"
                    />
                 </div>
              </div>

              <div className="mb-10">
                 <span className="font-extrabold text-sm text-slate-900 tracking-[0.2em]">{selectedBaby.id}</span>
              </div>
              
              <button 
                onClick={downloadIdCard} 
                disabled={isDownloading} 
                className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-2xl active:scale-95 transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 border border-slate-800"
              >
                 {isDownloading ? (
                   <>
                     <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></span>
                     Processing...
                   </>
                 ) : (
                   <>
                     <span className="material-icons-round text-sm">download</span>
                     Generate Hardcopy
                   </>
                 )}
              </button>
           </div>
        </div>
      )}

      {loadingInsights && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xl z-[200] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-14 rounded-[3.5rem] shadow-2xl text-center border border-slate-100 max-w-xs mx-auto">
             <div className="w-16 h-16 border-[6px] border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-xl shadow-teal-500/10"></div>
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-loose">Querying Regional Datasets...</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
