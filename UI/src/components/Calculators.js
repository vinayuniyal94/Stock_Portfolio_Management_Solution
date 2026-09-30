import React, { useState } from 'react';
import { Calculator, TrendingUp, IndianRupee, ShieldCheck } from 'lucide-react';

export default function Calculators({ initialCapital = 500000 }) {
  const [capital, setCapital] = useState(initialCapital);
  const [horizonYears, setHorizonYears] = useState(5);
  const [cagrPercent, setCagrPercent] = useState(16.5);

  const calculateReturn = () => {
    const P = Number(capital) || 0;
    const r = Number(cagrPercent) / 100;
    const t = Number(horizonYears);
    const futureVal = P * Math.pow(1 + r, t);
    const netGains = futureVal - P;
    return {
      futureVal: Math.round(futureVal),
      netGains: Math.round(netGains),
      multiplier: P > 0 ? (futureVal / P).toFixed(2) : '1.0'
    };
  };

  const results = calculateReturn();

  return (
    <div className="w-full max-w-5xl mx-auto enterprise-card rounded-3xl p-6 sm:p-8 space-y-6 bg-white shadow-sm border border-slate-200 animate-in fade-in duration-200">
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Fiduciary Simulation Suite
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            Capital Growth & Compounding Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            Simulate portfolio returns under varying compound horizons and target CAGRs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Sliders Form */}
        <div className="space-y-5 text-xs">
          <div>
            <div className="flex justify-between text-slate-700 mb-1.5 font-semibold">
              <span>Capital Invested</span>
              <span className="font-mono text-emerald-700 font-bold">₹{Number(capital).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="5000000"
              step="50000"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-700 mb-1.5 font-semibold">
              <span>Horizon Duration</span>
              <span className="font-mono text-emerald-700 font-bold">{horizonYears} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={horizonYears}
              onChange={(e) => setHorizonYears(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-700 mb-1.5 font-semibold">
              <span>CAGR Target (%)</span>
              <span className="font-mono text-emerald-700 font-bold">{cagrPercent}%</span>
            </div>
            <input
              type="range"
              min="8"
              max="25"
              step="0.5"
              value={cagrPercent}
              onChange={(e) => setCagrPercent(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Display Results Card */}
        <div className="rounded-2xl bg-slate-900 text-white p-6 space-y-4 shadow-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400">Projected Portfolio Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            ₹{results.futureVal.toLocaleString('en-IN')}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Net Wealth Gain</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">₹{results.netGains.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Multiplier</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{results.multiplier}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}