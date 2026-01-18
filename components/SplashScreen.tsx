
import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 via-transparent to-transparent opacity-50"></div>
      <div className="animate-pulse relative z-10">
        <div className="bg-teal-600/20 p-6 rounded-[2.5rem] border border-teal-500/30 backdrop-blur-md shadow-2xl">
          <Logo size={80} />
        </div>
      </div>
      <h1 className="text-white text-4xl font-extrabold mt-8 tracking-tighter relative z-10">VaxEase</h1>
      <p className="text-teal-400 mt-2 font-bold tracking-[0.4em] text-[10px] uppercase relative z-10">AI Health Intelligence</p>
      
      <div className="absolute bottom-16 flex flex-col items-center z-10">
        <div className="flex gap-2 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500/20 animate-bounce"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500/40 animate-bounce delay-100"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce delay-200"></div>
        </div>
        <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.3em]">Establishing Secure Node</p>
      </div>
    </div>
  );
};
