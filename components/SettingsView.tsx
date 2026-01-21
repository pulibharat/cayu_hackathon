
import React, { useState } from 'react';
import { UserRole } from '../types.ts';

interface SettingsViewProps {
  role: UserRole;
  onLogout: () => void;
  onHome: () => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em] mb-4 mt-8 px-2">{children}</h3>
);

const SettingItem = ({ icon, title, subtitle, action, destructive = false }: any) => (
  <div className={`bg-white border border-slate-100 p-5 rounded-2xl mb-3 flex items-center gap-5 transition-all active:scale-[0.98] ${destructive ? 'border-orange-100' : 'hover:border-teal-500/30'}`}>
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

export const SettingsView: React.FC<SettingsViewProps> = ({ role, onLogout, onHome }) => {
  const [offlineMode, setOfflineMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('EN');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 px-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tighter">System Console</h2>
          <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
            Node: BUEA-RE-HOSP-04
          </p>
        </div>
        <button onClick={onHome} className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all">
          <span className="material-icons-round">home</span>
        </button>
      </div>

      <SectionTitle>Preferences</SectionTitle>
      
      <SettingItem 
        icon="language" 
        title="Display Language" 
        subtitle="Current: English (Cameroon)" 
        action={
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-100 text-[10px] font-black uppercase px-2 py-1.5 rounded-lg outline-none border-none"
          >
            <option value="EN">EN</option>
            <option value="FR">FR</option>
            <option value="PID">PID</option>
          </select>
        } 
      />

      <SettingItem 
        icon="contrast" 
        title="High Contrast" 
        subtitle="Optimize for outdoor viewing" 
        action={<Toggle active={highContrast} onToggle={() => setHighContrast(!highContrast)} />} 
      />

      <SectionTitle>Network & Cache</SectionTitle>

      <SettingItem 
        icon="wifi_off" 
        title="Offline Mode" 
        subtitle="Save records locally when offline" 
        action={<Toggle active={offlineMode} onToggle={() => setOfflineMode(!offlineMode)} />} 
      />

      <SettingItem 
        icon="notifications_active" 
        title="Outreach Alerts" 
        subtitle="Push dose reminders" 
        action={<Toggle active={notifications} onToggle={() => setNotifications(!notifications)} />} 
      />

      <SectionTitle>Management</SectionTitle>
      
      <SettingItem 
        icon="verified_user" 
        title="Access Level" 
        subtitle={role === UserRole.NURSE ? "Administrator (Full Write)" : "Monitor (View Only)"} 
        action={<span className={`material-icons-round ${role === UserRole.NURSE ? 'text-teal-500' : 'text-slate-300'}`}>{role === UserRole.NURSE ? 'admin_panel_settings' : 'visibility'}</span>} 
      />

      <div onClick={onLogout}>
        <SettingItem 
          icon="power_settings_new" 
          title="Terminal Logout" 
          subtitle="Clear local session" 
          destructive={true}
          action={<span className="material-icons-round text-orange-300">logout</span>} 
        />
      </div>

      <div className="mt-12 text-center p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Public Health Intelligence Unit</p>
         <p className="text-[8px] text-slate-300 mt-2 font-medium">Digital Health Stack v1.0.4-Stable</p>
         <div className="flex justify-center gap-3 mt-4">
            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
         </div>
      </div>
    </div>
  );
};
