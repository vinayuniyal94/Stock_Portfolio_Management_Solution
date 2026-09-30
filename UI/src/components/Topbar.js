import React from 'react';
import { ShieldCheck, Activity, Search, Bell } from 'lucide-react';

export default function Topbar({ currentUser }) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs w-full">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-800">NSE / BSE LIVE FEED</span>
        </div>
        <span className="text-slate-300">|</span>
        <span className="text-xs text-slate-600 font-medium">Multiagentic Portfolio Management System</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SEBI Fiduciary Aligned</span>
        </div>

        {currentUser && (
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
            User: @{currentUser.username}
          </span>
        )}
      </div>
    </header>
  );
}