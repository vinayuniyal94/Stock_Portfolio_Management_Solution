import React from 'react';
import { BarChart3, TrendingUp, ShieldCheck, Activity, PieChart as PieIcon } from 'lucide-react';

export default function PortfolioAnalyticsView({ portfolioData }) {
  const portfolio = portfolioData?.portfolio || [
    { name: 'Sun Pharma', sector: 'Healthcare', allocation_percentage: 18.5, beta: 0.12 },
    { name: 'Reliance Industries', sector: 'Energy', allocation_percentage: 22.1, beta: 0.15 },
    { name: 'TCS', sector: 'IT', allocation_percentage: 20.0, beta: 0.85 },
    { name: 'HDFC Bank', sector: 'Banking', allocation_percentage: 39.4, beta: 1.05 }
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          Advanced Risk & Alpha Metrics
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Portfolio Analytics Suite</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="enterprise-card p-5 bg-white rounded-3xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Sharpe Ratio</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700">1.84</div>
          <span className="text-[10px] text-slate-500">Above Nifty 50 Benchmark (1.25)</span>
        </div>
        <div className="enterprise-card p-5 bg-white rounded-3xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Portfolio Beta</span>
          <div className="text-2xl font-extrabold font-mono text-slate-900">0.78</div>
          <span className="text-[10px] text-slate-500">Defensive volatility buffer</span>
        </div>
        <div className="enterprise-card p-5 bg-white rounded-3xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Sortino Ratio</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700">2.12</div>
          <span className="text-[10px] text-slate-500">Superior downside protection</span>
        </div>
        <div className="enterprise-card p-5 bg-white rounded-3xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Max Drawdown</span>
          <div className="text-2xl font-extrabold font-mono text-rose-600">-6.4%</div>
          <span className="text-[10px] text-slate-500">5-Year stress-tested horizon</span>
        </div>
      </div>

      <div className="enterprise-card p-6 bg-white rounded-3xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Holding Contribution & Factor Exposure</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3.5">Asset Name</th>
                <th className="p-3.5">Sector</th>
                <th className="p-3.5 text-right">Weight</th>
                <th className="p-3.5 text-right">Beta Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {portfolio.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">{item.name}</td>
                  <td className="p-3.5 text-slate-600">{item.sector}</td>
                  <td className="p-3.5 text-right font-mono">{item.allocation_percentage}%</td>
                  <td className="p-3.5 text-right font-mono text-emerald-700">{item.beta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}