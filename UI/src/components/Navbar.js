import React from 'react';
import { Sparkles, Sliders, Calculator, Activity, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="sticky top-4 z-40 w-full px-4 sm:px-6">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between px-6 py-3 rounded-2xl bg-[#0c0d12]/95 backdrop-blur-2xl border border-white/[0.14] shadow-[0_16px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(37,99,235,0.18)] relative">
        
        {/* Soft top border illumination glow */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-t-2xl pointer-events-none" />

        {/* Brand Identity */}
        <div 
          onClick={() => setActiveTab('workflow')}
          className="flex items-center space-x-3.5 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#0c0d12] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0c0d12] animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white font-sans">
                Nivesh<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Guru</span>
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                PRO AI
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono mt-0.5">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Multiagentic Stock Management (NSE/BSE)</span>
            </div>
          </div>
        </div>

        {/* Right Navigation & Status Alignment */}
        <div className="flex items-center space-x-5">
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-neutral-300 shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span>SEBI Compliant Fiduciary Mandate</span>
          </div>

          <nav className="flex items-center space-x-2 bg-black/60 p-1.5 rounded-xl border border-white/[0.08] shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('workflow')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'workflow'
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-blue-400/50'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Workflow Wizard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'calculator'
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-blue-400/50'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>CAGR Simulator</span>
            </button>
          </nav>
        </div>

      </div>
    </header>
  );
}