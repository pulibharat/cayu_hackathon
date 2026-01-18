
import React, { useState } from 'react';
import { UserRole } from '../types';

interface SettingsViewProps {
  role: UserRole;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ role, onLogout }) => {
  const [sessionActive, setSessionActive] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [radius, setRadius] = useState(15);

  const SectionTitle = ({ children }: { children: string }) => (
    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em] mb-4 mt-8 px-2">{children}</h3>
  );

  const SettingItem = ({ icon, title, subtitle, action, destructive = false }: any) => (
    <div className={`bg-white border border-slate-100 p-5 rounded-2xl mb-3 flex items-center gap-5 transition-all active:scale-[0.98] cursor-pointer ${destructive ? 'border-orange-100' : ''}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${destructive ? 'bg-orange-50 text-orange-500' : 'bg-slate-50 text-slate-700'}`}>
        <span className="material-icons-round text-xl">{icon}</span>
      </div>
      <div className="flex-1">
        <h4 className={`text-sm font-bold tracking-tight ${destructive ? 'text-orange-600' : 'text-slate-900'}`}>{title}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{subtitle}</p>
      </div>
      {action}
    </div>
  );

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <div 
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${active ? 'bg-teal-600' : 'bg-slate-200'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tighter">System Console</h2>
        <span className="text-[9px] font-extrabold text-teal-600 bg-teal-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-teal-100">Alpha 1.0.4</span>
      </div>

      <SectionTitle>Application State</SectionTitle>
      
      <SettingItem 
        icon="notifications" 
        title="Sync Notifications" 
        subtitle="Push alerts for missed doses" 
        action={<Toggle active={notifications} onToggle={() => setNotifications(!notifications)} />} 
      />

      {role === UserRole.NURSE ? (
        <>
          <SectionTitle>Provider Node</SectionTitle>
          <SettingItem 
            icon="event_note" 
            title="Clinic Session" 
            subtitle={sessionActive ? "Station Active • Site 092" : "Station Offline"} 
            action={<Toggle active={sessionActive} onToggle={() => setSessionActive(!sessionActive)} />} 
          />
          <SettingItem 
            icon="cloud_sync" 
            title="Database Sync" 
            subtitle="Last linked 14s ago" 
            action={<button className="text-teal-600 bg-teal-50 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-teal-100">Force</button>} 
          />
        </>
      ) : (
        <>
          <SectionTitle>Analysis Parameters</SectionTitle>
          <div className="bg-white border border-slate-100 p-7 rounded-3xl mb-3 shadow-sm">
             <div className="flex justify-between items-center mb-5">
                <h4 className="text-sm font-bold text-slate-900 tracking-tight">Community Radius</h4>
                <span className="text-teal-600 font-extrabold text-xs">{radius} km</span>
             </div>
             <input 
              type="range" 
              min="5" 
              max="50" 
              value={radius} 
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-teal-600"
             />
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-5 leading-relaxed">
               Calibrates the geospatial model for predictive dropout intelligence.
             </p>
          </div>
        </>
      )}

      <SectionTitle>Management</SectionTitle>
      <SettingItem 
        icon="verified_user" 
        title="Security Protocol" 
        subtitle="End-to-End Encryption" 
        action={<span className="material-icons-round text-slate-300">verified</span>} 
      />
      <div onClick={onLogout}>
        <SettingItem 
          icon="power_settings_new" 
          title="Terminal Logout" 
          subtitle="Clear local cache" 
          destructive={true}
          action={<span className="material-icons-round text-orange-300">logout</span>} 
        />
      </div>

      <div className="mt-12 text-center">
         <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">Public Health Intelligence Unit</p>
         <div className="flex justify-center gap-3 mt-4 opacity-10">
            <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
         </div>
      </div>
    </div>
  );
};
