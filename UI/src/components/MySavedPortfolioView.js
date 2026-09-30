import React, { useState, useEffect } from 'react';
import { Briefcase, IndianRupee, TrendingUp, ShieldCheck, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function MySavedPortfolioView({ currentUser, onOpenAuth }) {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(0);

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserPortfolios();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchUserPortfolios = async () => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/api/portfolio/${currentUser.id}`);
      const data = await res.json();
      if (res.ok) {
        setPortfolios(data.portfolios || data || []);
      } else {
        throw new Error(data.detail || 'Failed to fetch saved portfolios');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto enterprise-card rounded-3xl p-12 text-center bg-white shadow-sm border border-slate-200 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <Briefcase className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Authentication Required</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please log in or register your account to view your securely saved portfolios synced with Supabase PostgreSQL RLS.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          Secure Login / Register
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Supabase Persistent Storage
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">My Saved Portfolios</h1>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          @{currentUser.username || currentUser.email}
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center flex items-center justify-center space-x-3 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
          <span className="text-xs font-mono text-slate-600">Fetching saved portfolios from Supabase...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      ) : portfolios.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <p className="text-xs text-slate-500 font-mono">No portfolios saved yet. Complete the workflow wizard and save your recommended bucket.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {portfolios.map((p, idx) => {
            const rawStocks = p.portfolio_json?.portfolio || p.portfolio_json?.allocations || [];
            const isExpanded = expandedIndex === idx;

            return (
              <div key={idx} className="enterprise-card bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
                
                {/* Header Summary */}
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      {p.bucket_archetype || 'Core Wealth Bucket'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{p.portfolio_name}</h3>
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                      <span>Initial Capital: <strong className="text-slate-900">₹{Number(p.initial_investment || 500000).toLocaleString('en-IN')}</strong></span>
                      <span>•</span>
                      <span>Risk Profile: <strong className="text-emerald-700">{p.risk_category} ({p.risk_score}/100)</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer ml-auto"
                  >
                    <span>{isExpanded ? 'Hide Holdings Breakdown' : `View ${rawStocks.length} Shares Bought`}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Shares Bought Table */}
                {isExpanded && (
                  <div className="p-6 sm:p-8 bg-slate-50/50 space-y-4 border-t border-slate-100 animate-in fade-in duration-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                      Detailed Breakdown of Shares Bought ({rawStocks.length} Equities)
                    </h4>

                    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                          <tr>
                            <th className="p-3.5">#</th>
                            <th className="p-3.5">Holding Name</th>
                            <th className="p-3.5">Sector</th>
                            <th className="p-3.5 text-right">Price (INR)</th>
                            <th className="p-3.5 text-right">Units</th>
                            <th className="p-3.5 text-right">Allocated Amount</th>
                            <th className="p-3.5 text-right">Beta</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {rawStocks.map((stock, sIdx) => (
                            <tr key={sIdx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5 font-mono text-slate-400">{stock.id || sIdx + 1}</td>
                              <td className="p-3.5 font-bold text-slate-900">
                                {stock.name || stock.StockName} 
                                <span className="text-[10px] font-mono text-slate-400 block">{stock.ticker || stock.Symbol}</span>
                              </td>
                              <td className="p-3.5 text-slate-600">{stock.sector || stock.Sector}</td>
                              <td className="p-3.5 text-right font-mono">₹{Number(stock.current_price || stock.Price || 1000).toLocaleString('en-IN')}</td>
                              <td className="p-3.5 text-right font-mono font-bold text-emerald-700">{stock.units || stock.Quantity || 10}</td>
                              <td className="p-3.5 text-right font-mono">₹{Number(stock.allocated_amount || stock.AllocationAmount || 50000).toLocaleString('en-IN')} ({stock.allocation_percentage || stock.AllocationPercentage || 11.1}%)</td>
                              <td className="p-3.5 text-right font-mono text-slate-600">{stock.beta || stock.Beta || 0.5}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}