import React from "react";
import { Layers, ArrowRight } from "lucide-react";

export default function SectorAnalysisView({ sectors = [], onProceed, loading }) {
  const defaultSectors = sectors.length ? sectors : ["Banking & Financials", "Information Technology", "FMCG / Defensive", "Automotive & EV", "Pharma & Healthcare"];

  return (
    <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-xl max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <Layers className="text-purple-400" size={24} />
          <div>
            <h2 className="text-lg font-bold text-white">Agent 2: Sectoral Screening & Selection</h2>
            <p className="text-xs text-slate-400">Identified top 4-5 Indian sectors matching your risk profile via FastMCP data tools.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {defaultSectors.map((sector, idx) => (
          <div key={idx} className="bg-[#0A0E17] p-4 rounded-xl border border-white/[0.08] hover:border-purple-500/50 transition">
            <span className="text-[10px] text-purple-400 uppercase font-semibold">Priority Sector 0{idx + 1}</span>
            <div className="text-sm font-bold text-white mt-1">{sector}</div>
            <p className="text-[11px] text-slate-400 mt-2">Screened for operating stability, price-to-earnings attractiveness, and institutional liquidity.</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0A0E17] p-4 rounded-xl border border-white/[0.08] flex justify-between items-center text-xs text-slate-400">
        <span>Proceed: <strong>Stock Bucket Agent</strong> will construct personalized stock weights.</span>
        <button
          onClick={onProceed}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
        >
          {loading ? "Allocating Baskets..." : "Build Stock Portfolio"} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}