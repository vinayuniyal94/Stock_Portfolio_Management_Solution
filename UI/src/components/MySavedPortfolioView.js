import React, { useState, useEffect } from 'react';
import { Briefcase, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, Bell, Loader2, Sparkles, Newspaper, ShieldAlert, CheckCircle2, X } from 'lucide-react';

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000'
  : (process.env.REACT_APP_API_BASE_URL || 'https://arthveda-ai-backend.onrender.com');

export default function MySavedPortfolioView({ currentUser, onOpenAuth, setActiveNav }) {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSurveillance, setActiveSurveillance] = useState(null);
  const [surveillanceLoading, setSurveillanceLoading] = useState(false);
  const [expandedPortfolioId, setExpandedPortfolioId] = useState(null);

  // Notification Drawer State (Bifurcated: Buy/Sell Calls vs. News & Events)
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTab, setNotificationTab] = useState('calls'); // 'calls' or 'news'
  const [newsFeed, setNewsFeed] = useState([
    { title: "RBI Maintains Repo Rate at 6.5%", category: "Macro", time: "15m ago", impact: "Neutral" },
    { title: "IT Sector Q3 Earnings Projected Strong Multi-Year Growth", category: "Sector", time: "1h ago", impact: "Bullish" },
    { title: "Infrastructure Capex Outlay Accelerated by 12%", category: "Policy", time: "3h ago", impact: "High Bullish" }
  ]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserPortfolios();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchUserPortfolios = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/portfolio/${currentUser.id}`);
      const data = await res.json();
      if (res.ok) {
        setPortfolios(data.portfolios || data || []);
      }
    } catch (err) {
      console.error("Failed to fetch saved portfolios", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAgentSurveillance = async (portfolio) => {
    setSurveillanceLoading(true);
    setExpandedPortfolioId(portfolio.id);
    try {
      const stocks = portfolio.portfolio_json?.portfolio || portfolio.portfolio_json?.allocations || [];
      const res = await fetch(`${API_BASE_URL}/api/agents/active-portfolio-monitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stocks: stocks,
          risk_score: portfolio.risk_score || 65,
          user_id: currentUser?.id,
          portfolio_name: portfolio.portfolio_name
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSurveillance(data);
      }
    } catch (err) {
      console.error("Agent surveillance failed", err);
    } finally {
      setSurveillanceLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="enterprise-card bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 max-w-4xl mx-auto space-y-5">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
          <Briefcase className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900">Authentication Required</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please log in or register your account to view your securely saved portfolios synced with Supabase PostgreSQL RLS.
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Secure Login / Register</span>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-12 text-center flex items-center justify-center space-x-3 bg-white rounded-3xl border border-slate-200 max-w-5xl mx-auto">
        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
        <span className="text-xs font-mono text-slate-600">Loading saved portfolios from Supabase...</span>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="enterprise-card bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 max-w-4xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Saved Portfolios Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You haven't saved any portfolio allocations yet. Complete the workflow wizard to store your custom stock bucket.
        </p>
        <button
          onClick={() => setActiveNav && setActiveNav('dashboard')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Top Header with Live Observer Pulse & Notification Bell */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Observer Agent Active • Real-Time Telemetry Scanning
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Saved Portfolios & Agent Hub</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotificationModal(true)}
            className="relative p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer flex items-center gap-2"
            title="Open Agent Notifications"
          >
            <Bell className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold font-mono">Alerts</span>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-mono flex items-center justify-center font-bold shadow-sm">
              {activeSurveillance?.notifications?.length || 3}
            </span>
          </button>
          <span className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-2.5 rounded-2xl border border-slate-200">
            @{currentUser.username || currentUser.email.split('@')[0]}
          </span>
        </div>
      </div>

      {portfolios.map((port, idx) => {
        const stocks = port.portfolio_json?.portfolio || port.portfolio_json?.allocations || [];
        const isExpanded = expandedPortfolioId === port.id;

        return (
          <div key={port.id || idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {port.bucket_archetype || "Balanced Core"}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">{port.portfolio_name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Initial Capital: <strong className="font-mono text-slate-900">₹{Number(port.initial_investment || 500000).toLocaleString('en-IN')}</strong> • Risk Profile: <strong className="text-slate-900">{port.risk_category} ({port.risk_score}/100)</strong>
                </p>
              </div>

              <button
                onClick={() => handleRunAgentSurveillance(port)}
                disabled={surveillanceLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {surveillanceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                <span>{surveillanceLoading ? 'Running Active Agents...' : 'Run Agent Surveillance'}</span>
              </button>
            </div>

            {/* Observer Agent Live Feed & Circuit Limits Display */}
            {isExpanded && activeSurveillance && (
              <div className="space-y-6 animate-in fade-in duration-200 pt-2">
                <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Observer Agent • Live Circuit & Price Telemetry</h3>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                      MegaBull Feed Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {activeSurveillance.observer_feed?.map((item, i) => (
                      <div key={i} className={`p-3.5 rounded-xl border ${item.is_circuit_limit ? 'bg-rose-950/40 border-rose-800' : 'bg-slate-800/80 border-slate-700'} space-y-1`}>
                        <div className="flex justify-between items-center text-xs">
                          <strong className="font-mono text-white">{item.ticker}</strong>
                          <span className={`font-mono font-bold flex items-center gap-0.5 ${item.change_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.change_pct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {item.change_pct}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                          <span>LTP: ₹{item.ltp}</span>
                          {item.is_circuit_limit && <span className="text-[10px] bg-rose-900 text-rose-200 px-1.5 py-0.5 rounded font-bold">CIRCUIT HIT</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifier & Planner Audit Log */}
                <div className="bg-emerald-50/60 border border-emerald-200 p-6 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs font-mono uppercase tracking-wider">
                    <Bell className="w-4 h-4 text-emerald-700" />
                    <span>Notifier Agent & Planner Autonomous Audit Feed</span>
                  </div>
                  <div className="space-y-2">
                    {activeSurveillance.notifications?.map((note, i) => (
                      <div key={i} className="bg-white p-3.5 rounded-xl border border-emerald-100 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 flex items-center gap-2 font-mono">
                            <span>{note.ticker}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase font-bold">{note.action}</span>
                          </div>
                          <p className="text-slate-600">{note.reason}</p>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex-shrink-0">
                          {note.execution_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Holdings Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-500">Managed Equities Breakdown ({stocks.length} Assets)</h4>
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
                    {stocks.map((stock, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-mono text-slate-400">{i + 1}</td>
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
      })}

      {/* Bifurcated Notification Modal (Buy/Sell Calls vs. News & Events) */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full space-y-5 border border-slate-200 relative">
            <button
              onClick={() => setShowNotificationModal(false)}
              className="absolute top-6 right-6 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Agent Intelligence & Alerts</h3>
                <p className="text-xs text-slate-500">Autonomous planner calls and real-time market news feeds.</p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setNotificationTab('calls')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${notificationTab === 'calls' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Buy / Sell Calls ({activeSurveillance?.notifications?.length || 3})</span>
              </button>
              <button
                onClick={() => setNotificationTab('news')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${notificationTab === 'news' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>News & Events ({newsFeed.length})</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {notificationTab === 'calls' ? (
                activeSurveillance?.notifications?.length > 0 ? (
                  activeSurveillance.notifications.map((note, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center text-xs font-mono font-bold">
                        <span className="text-slate-900">{note.ticker}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase text-[10px]">{note.action}</span>
                      </div>
                      <p className="text-xs text-slate-600">{note.reason}</p>
                      <span className="text-[10px] font-mono text-slate-400 block pt-1">{note.execution_status}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs font-mono text-slate-400">
                    Run Agent Surveillance on any portfolio to generate live execution calls.
                  </div>
                )
              ) : (
                newsFeed.map((news, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                      <span>{news.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{news.impact}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>Category: {news.category}</span>
                      <span>{news.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}