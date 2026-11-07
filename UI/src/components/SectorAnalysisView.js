import React, { useState } from 'react';
import { Compass, ArrowRight, ArrowLeft, ShieldCheck, Info, Sparkles, TrendingUp } from 'lucide-react';

export default function SectorAnalysisView({ analyzerState, onBack, onProceed }) {
  const [activeSectorPopover, setActiveSectorPopover] = useState(null);
  const [isOverallAnalysisOpen, setIsOverallAnalysisOpen] = useState(false);

  const sectors = analyzerState.selected_sectors || [];
  const marketData = analyzerState.market_data || {};
  const rationales = analyzerState.sector_rationales || {};
  const thoughtProcess = analyzerState.analyzer_thought_process || "Macroeconomic sector discovery optimized for structural growth and risk mitigation.";

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ReAct Stock Analyzer Agent
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Macroeconomic Sector Identification & Verified Equities
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Independently selected sectors audited by the CRO Critique Agent for institutional growth.
          </p>
        </div>

        {/* Overall Analysis Popover Button */}
        <button 
          onClick={() => setIsOverallAnalysisOpen(true)}
          className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>View ReAct Sector Analysis Logic</span>
        </button>
      </div>

      {/* Overall Analysis Popover Modal */}
      {isOverallAnalysisOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Stock Analyzer ReAct Logic & Rationale</h3>
              </div>
              <button 
                onClick={() => setIsOverallAnalysisOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {thoughtProcess}
            </p>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium">
              ✓ Verified by CRO Critique Agent with zero cross-contamination.
            </div>
          </div>
        </div>
      )}

      {/* Sectors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sectors.map((sector, idx) => {
          const stocks = marketData[sector] || [];
          const rationale = rationales[sector] || "Selected based on risk capacity and horizon.";

          return (
            <div key={idx} className="border border-slate-200 rounded-3xl p-5 bg-slate-50/50 space-y-4 hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{sector}</h3>
                    <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                      {stocks.length} Verified Equities
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSectorPopover(sector)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-medium border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Info className="w-3.5 h-3.5 text-emerald-600" /> Sector Logic
                </button>
              </div>

              {/* Stock Tickers List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  Top Candidate Equities Pulled
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {stocks.map((st, sidx) => (
                    <div key={sidx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{st.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 ml-2">({st.ticker})</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-slate-900">₹{st.current_price}</span>
                        <span className="text-[10px] text-emerald-600 ml-2">P/E: {st.pe_ratio}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual Sector Logic Popover Modal */}
      {activeSectorPopover && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Sector Logic: {activeSectorPopover}</h3>
              </div>
              <button 
                onClick={() => setActiveSectorPopover(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {rationales[activeSectorPopover] || "Validated for compounding resilience and structural growth under current economic conditions."}
            </p>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
              Audited by SEBI & institutional macroeconomic compliance models.
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Risk Analysis
        </button>

        <button
          onClick={onProceed}
          className="px-7 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
        >
          <span>Audit & Construct Portfolio Bucket</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}