import React from 'react';
import { BarChart2, AlertCircle, ShieldAlert, TrendingUp, PieChart } from 'lucide-react';

export default function PortfolioAnalyticsView({ currentUser }) {
  // Retrieve saved portfolio safely from local storage or state
  let portfolioData = null;
  try {
    const raw = localStorage.getItem('arthveda_saved_portfolio') || localStorage.getItem('arthveda_latest_portfolio');
    if (raw) {
      portfolioData = JSON.parse(raw);
    }
  } catch (e) {
    portfolioData = null;
  }

  // Graceful fallback if portfolio has errors or doesn't exist yet
  if (!portfolioData || !portfolioData.portfolio || portfolioData.portfolio.length === 0) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl max-w-3xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Portfolio Analytics Awaiting Data</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            No active portfolio allocation was found. Portfolio analytics runs independently once your Stock Bucket agent successfully builds and saves a portfolio basket.
          </p>
        </div>
      </div>
    );
  }

  // Render analytics normally if portfolio data is valid
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Registered Suite • Advanced Metrics
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Portfolio Analytics Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Deep statistical breakdown of your active asset allocation and projected growth.
          </p>
        </div>
      </div>

      {/* Analytics content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Archetype</span>
          <h4 className="text-lg font-bold text-slate-900">{portfolioData.bucket_archetype || "Balanced Core"}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Target CAGR</span>
          <h4 className="text-lg font-bold text-emerald-600">{portfolioData.target_cagr || "13.8%"}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Deployed Capital</span>
          <h4 className="text-lg font-bold text-slate-900">₹{Number(portfolioData.total_capital_deployed || 0).toLocaleString()}</h4>
        </div>
      </div>
    </div>
  );
}