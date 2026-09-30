import React from 'react';
import { ArrowRight, ArrowLeft, Compass, CheckCircle2, TrendingUp } from 'lucide-react';

export default function SectorAnalysisView({ analyzerState, onBack, onProceed }) {
  const sectors = analyzerState?.selected_sectors || [
    'Banking & Financial Services',
    'Information Technology',
    'Energy & Conglomerate',
    'Infrastructure & Capital Goods',
    'FMCG Staples'
  ];

  const rationales = analyzerState?.sector_rationales || {
    "Banking & Financial Services": "High credit growth and robust deposit mobilization franchise.",
    "Information Technology": "Defensive cash flows with high dollar-denominated export revenues.",
    "Energy & Conglomerate": "Multi-engine scaling across retail, green energy, and telecom.",
    "Infrastructure & Capital Goods": "Direct proxy for national capex execution."
  };

  return (
    <div className="w-full enterprise-card rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden bg-white shadow-sm animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Step 03 of 04 • Stock Analyzer Agent
          </span>
          <h2 className="text-base font-bold tracking-tight text-slate-900 mt-0.5">
            Macroeconomic Sector Identification & Live NSE Feeds
          </h2>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <Compass className="w-4 h-4" />
        </div>
      </div>

      {/* Sectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {sectors.map((sec, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" /> {sec}
              </span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                High Conviction
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {rationales[sec] || "Selected based on sector momentum, P/E valuation multiples, and robust compounding metrics."}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Nav */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Risk Profiler
        </button>
        <button
          onClick={onProceed}
          className="px-7 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
        >
          Initialize Stock Bucket Agent <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}