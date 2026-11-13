import React, { useState, useEffect } from 'react';
import { BarChart2, AlertCircle, ShieldAlert, TrendingUp, PieChart, Loader2 } from 'lucide-react';
import ErrorFallbackState from './ErrorFallbackState';

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000'
  : (process.env.REACT_APP_API_BASE_URL || 'https://arthveda-ai-backend.onrender.com');

export default function PortfolioAnalyticsView({ currentUser, setActiveNav }) {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserPortfolios();
    } else {
      // Fallback to local storage if user isn't authenticated yet
      try {
        const raw = localStorage.getItem('arthveda_saved_portfolio') || localStorage.getItem('arthveda_latest_portfolio');
        if (raw) {
          setPortfolios([JSON.parse(raw)]);
        }
      } catch (e) {
        setPortfolios([]);
      } finally {
        setLoading(false);
      }
    }
  }, [currentUser]);

  const fetchUserPortfolios = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/portfolio/${currentUser.id}`);
      const data = await res.json();
      if (res.ok) {
        setPortfolios(data.portfolios || data || []);
      } else {
        throw new Error(data.detail || 'Failed to fetch portfolio analytics.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex items-center justify-center space-x-3 bg-white rounded-3xl border border-slate-200 max-w-4xl mx-auto">
        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
        <span className="text-xs font-mono text-slate-600">Loading portfolio analytics...</span>
      </div>
    );
  }

  if (errorMsg || portfolios.length === 0) {
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
        {setActiveNav && (
          <button
            onClick={() => setActiveNav('dashboard')}
            className="px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            Go to Workflow Dashboard
          </button>
        )}
      </div>
    );
  }

  const portfolioData = portfolios[0];
  const rawStocks = portfolioData.portfolio_json?.portfolio || portfolioData.portfolio_json?.allocations || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Registered Suite • Advanced Metrics
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {portfolioData.portfolio_name || "Portfolio Analytics Dashboard"}
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
          <span className="text-xs font-mono text-slate-400 uppercase">Risk Category & Score</span>
          <h4 className="text-lg font-bold text-emerald-600">{portfolioData.risk_category || "Moderate"} ({portfolioData.risk_score || 65}/100)</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Initial Capital</span>
          <h4 className="text-lg font-bold text-slate-900">₹{Number(portfolioData.initial_investment || 500000).toLocaleString('en-IN')}</h4>
        </div>
      </div>

      {/* Holdings Overview Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700">Managed Equities Breakdown ({rawStocks.length} Assets)</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">#</th>
                <th className="p-3.5">Holding Name</th>
                <th className="p-3.5">Sector</th>
                <th className="p-3.5 text-right">Price</th>
                <th className="p-3.5 text-right">Units</th>
                <th className="p-3.5 text-right">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {rawStocks.map((stock, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="p-3.5 font-mono text-slate-400">{idx + 1}</td>
                  <td className="p-3.5 font-bold text-slate-900">{stock.name || stock.StockName} <span className="text-[10px] font-mono text-slate-400 block">{stock.ticker || stock.Symbol}</span></td>
                  <td className="p-3.5 text-slate-600">{stock.sector || stock.Sector}</td>
                  <td className="p-3.5 text-right font-mono">₹{Number(stock.current_price || stock.Price || 1000).toLocaleString('en-IN')}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-700">{stock.units || stock.Quantity || 10}</td>
                  <td className="p-3.5 text-right font-mono">₹{Number(stock.allocated_amount || 50000).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}