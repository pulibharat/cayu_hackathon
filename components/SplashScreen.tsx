
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
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-indigo-600 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="animate-bounce">
        <Logo size={80} />
      </div>
      <h1 className="text-white text-4xl font-black mt-6 tracking-tighter">VaxEase</h1>
      <p className="text-indigo-200 mt-2 font-medium tracking-widest text-xs uppercase">AI for Public Health Impact</p>
      
      <div className="absolute bottom-12 flex flex-col items-center">
        <div className="flex gap-1 mb-4">
          <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse delay-75"></div>
          <div className="w-2 h-2 rounded-full bg-white animate-pulse delay-150"></div>
        </div>
        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Loading Clinic Data</p>
      </div>
    </div>
  );
};
