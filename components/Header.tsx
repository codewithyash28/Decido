
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <i className="fa-solid fa-microchip text-slate-950 text-lg"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-slate-100">
            DECIDO <span className="text-emerald-400 font-mono text-sm ml-1">v2.1</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-mono">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            SYSTEM ONLINE
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
