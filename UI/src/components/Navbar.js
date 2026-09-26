import React from "react";
import { TrendingUp, Calculator, Sparkles } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="border-b border-white/[0.06] bg-[#080B11]/80 backdrop-blur-md sticky top-0 z-40 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-400 p-[1px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0B0F17] rounded-[11px] flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">NiveshAI</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                NSE / BSE Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Institutional Multi-Agent Equity Engine</p>
          </div>
        </div>

        <div className="flex items-center bg-[#101622] p-1 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setActiveTab("onboarding")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "onboarding"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles size={14} /> Agent Allocation
          </button>
          <button
            onClick={() => setActiveTab("calculators")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "calculators"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calculator size={14} /> Financial Calculators
          </button>
        </div>

      </div>
    </header>
  );
}