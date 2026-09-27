import React from 'react';
import { Layers, Activity, TrendingUp, DollarSign } from 'lucide-react';

export default function SectorAnalysisView({ sectors = [], marketData = {} }) {
  return (
    <div className="w-full space-y-6">
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Screened Indian Market Sectors
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Identified based on investor risk profile and Indian equity macroeconomic cycles
        </p>

        <div className="flex flex-wrap gap-2.5">
          {sectors.map((sector, idx) => (
            <span
              key={idx}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium"
            >
              {sector}
            </span>
          ))}
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(marketData).map(([sector, stocks]) => (
          <div key={sector} className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{sector}</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">NSE Live</span>
            </div>

            <div className="space-y-3">
              {stocks.map((stock, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{stock.name}</h4>
                    <span className="text-xs text-slate-500 font-mono">{stock.ticker}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-100">₹{stock.current_price?.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Beta: {stock.beta} | P/E: {stock.pe_ratio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}