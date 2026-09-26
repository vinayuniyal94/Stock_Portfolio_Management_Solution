import React from "react";
import { ShieldCheck, RotateCcw, Clock, TrendingUp } from "lucide-react";

export default function PortfolioBucketView({ portfolioData, onReset }) {
  const stocks = portfolioData?.portfolio || [];
  const horizons = portfolioData?.horizon_strategy || {};
  const cagr = portfolioData?.expected_cagr || "14-16%";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner Metric */}
      <div className="premium-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <ShieldCheck size={16} /> Tailored Indian Equity Portfolio
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Multi-Agent Capital Allocation</h2>
          <p className="text-xs text-slate-400 mt-0.5">Risk-calibrated asset weighting across high-conviction NSE/BSE sectors.</p>
        </div>
        <div className="bg-[#0b101b] border border-white/[0.08] px-5 py-3 rounded-xl text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Expected CAGR</div>
          <div className="text-xl font-black text-emerald-400 font-mono">{cagr}</div>
        </div>
      </div>

      {/* Institutional Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="fintech-table">
            <thead>
              <tr>
                <th>Company / Equity</th>
                <th>Sector</th>
                <th>Weightage</th>
                <th>Allocated Amount</th>
                <th>Investment Thesis</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="font-semibold text-white">{stock.name}</div>
                    <div className="text-[11px] text-blue-400 font-mono mt-0.5">{stock.ticker}</div>
                  </td>
                  <td>
                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] bg-slate-800/80 text-slate-300 border border-white/[0.06]">
                      {stock.sector}
                    </span>
                  </td>
                  <td>
                    <div className="font-bold text-white font-mono">{stock.allocation_percentage}%</div>
                    <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${stock.allocation_percentage}%` }}></div>
                    </div>
                  </td>
                  <td className="font-mono font-medium text-white">
                    ₹{Number(stock.allocated_amount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    {stock.rationale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Horizon Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="metric-tile p-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
            <Clock size={13} /> Short Term (1–12 Months)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {horizons.short_term || "Capital defense using defensive bluechips to absorb near-term macro volatility."}
          </p>
        </div>

        <div className="metric-tile p-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
            <TrendingUp size={13} /> Medium Term (1–3 Years)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {horizons.mid_term || "Earnings cycle compounding and periodic rebalancing across chosen leaders."}
          </p>
        </div>

        <div className="metric-tile p-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
            <ShieldCheck size={13} /> Long Term (3–5+ Years)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {horizons.long_term || "Sustained alpha generation aligned with long-term macroeconomic tailwinds."}
          </p>
        </div>
      </div>

      <div className="text-center pt-2">
        <button onClick={onReset} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-4 py-2.5 rounded-xl bg-[#0e1422] border border-white/[0.08] hover:border-white/[0.2] transition">
          <RotateCcw size={14} /> Configure Another Portfolio Mandate
        </button>
      </div>
    </div>
  );
}