import React, { useState, useEffect } from 'react';
import {
  Briefcase, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Bell, Loader2, Sparkles, Newspaper, RefreshCw, X, Clock, CheckCircle2, ShieldAlert, Layers
} from 'lucide-react';

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000'
  : (process.env.REACT_APP_API_BASE_URL || 'https://arthveda-ai-backend.onrender.com');

function checkIndianMarketHoursClient() {
  try {
    const now = new Date();
    const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const istDate = new Date(istString);
    const day = istDate.getDay(); // 0 Sun .. 6 Sat
    const mins = istDate.getHours() * 60 + istDate.getMinutes();
    const isWeekday = day >= 1 && day <= 5;
    const isOpen = isWeekday && mins >= (9 * 60 + 15) && mins <= (15 * 60 + 30);
    return {
      isOpen,
      label: isOpen ? 'NSE/BSE MARKET OPEN' : 'MARKET CLOSED (Opens 09:15 AM IST)',
      windowText: 'Mon–Fri • 09:15 AM – 03:30 PM IST'
    };
  } catch {
    return { isOpen: false, label: 'MARKET HOURS CHECK', windowText: '09:15 AM – 03:30 PM IST' };
  }
}

export default function MySavedPortfolioView({ currentUser, onOpenAuth, setActiveNav }) {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSurveillance, setActiveSurveillance] = useState(null);
  const [surveillanceLoading, setSurveillanceLoading] = useState(false);

  // Clean Sub-Navigation Tab ('holdings' | 'observer' | 'notifier')
  const [activeSectionTab, setActiveSectionTab] = useState('holdings');

  // Order Execution State for Notifier Rebalance / Buy / Sell actions
  const [executingTicker, setExecutingTicker] = useState(null);
  const [tradeFeedback, setTradeFeedback] = useState(null);

  // Live MegaBull Holdings State
  const [megabullHoldingsMap, setMegabullHoldingsMap] = useState({});
  const [megabullRawList, setMegabullRawList] = useState([]);
  const [megabullSummary, setMegabullSummary] = useState({ totalPnl: 0, totalValue: 0, totalInvested: 0, synced: false });
  const [syncingMegabull, setSyncingMegabull] = useState(false);

  // Market Hours Status
  const [marketClock, setMarketClock] = useState(checkIndianMarketHoursClient());

  // Notification Drawer State
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTab, setNotificationTab] = useState('calls');
  const [newsFeed] = useState([
    { title: "RBI Maintains Repo Rate at 6.5%", category: "Macro", time: "15m ago", impact: "Neutral" },
    { title: "IT Sector Q3 Earnings Projected Strong Multi-Year Growth", category: "Sector", time: "1h ago", impact: "Bullish" },
    { title: "Infrastructure Capex Outlay Accelerated by 12%", category: "Policy", time: "3h ago", impact: "High Bullish" }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setMarketClock(checkIndianMarketHoursClient()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserPortfolios();
      fetchMegabullLiveHoldings();
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

  const fetchMegabullLiveHoldings = async () => {
    try {
      setSyncingMegabull(true);
      const res = await fetch(`${API_BASE_URL}/api/megabull/holdings`);
      if (!res.ok) return;

      const data = await res.json();
      const rawItems = Array.isArray(data)
        ? data
        : (data.holdings || data.data || data.positions || []);

      const map = {};
      const normalizedList = [];
      let totalPnl = 0;
      let totalValue = 0;
      let totalInvested = 0;

      rawItems.forEach((item, index) => {
        const rawSym = String(
          item.instrumentName || item.instrument || item.symbol || item.tradingsymbol || item.ticker || ''
        ).toUpperCase();
        const cleanSym = rawSym.replace('.NS', '').replace('.BO', '').trim();
        if (!cleanSym) return;

        const qty = Number(item.qty || item.quantity || item.units || 0);
        const avgPrice = Number(item.avgBuyPrice || item.priceAvg || item.avg_price || item.average_price || item.avg || 0);
        const ltp = Number(item.ltp || item.last_price || item.current_price || item.lastPrice || avgPrice);
        const pnl = (ltp > 0 && avgPrice > 0)
          ? (ltp - avgPrice) * qty
          : Number(item.pl ?? item.pnl ?? 0);
        const chgPct = (ltp > 0 && avgPrice > 0)
          ? ((ltp - avgPrice) / avgPrice) * 100
          : Number(item.chg ?? item.percent_change ?? 0);

        if (qty > 0) {
          const entry = {
            id: index + 1,
            name: cleanSym,
            ticker: `${cleanSym}.NS`,
            sector: item.sector || 'NSE Equity',
            qty,
            avgPrice: Number(avgPrice.toFixed(2)),
            ltp: Number(ltp.toFixed(2)),
            currentValue: Number((ltp * qty).toFixed(2)),
            investedValue: Number((avgPrice * qty).toFixed(2)),
            pnl: Number(pnl.toFixed(2)),
            chgPct: Number(chgPct.toFixed(2))
          };
          map[cleanSym] = entry;
          map[`${cleanSym}.NS`] = entry;
          normalizedList.push(entry);
          totalPnl += pnl;
          totalValue += ltp * qty;
          totalInvested += avgPrice * qty;
        }
      });

      if (normalizedList.length > 0) {
        setMegabullHoldingsMap(map);
        setMegabullRawList(normalizedList);
        setMegabullSummary({
          totalPnl: Number(totalPnl.toFixed(2)),
          totalValue: Number(totalValue.toFixed(2)),
          totalInvested: Number(totalInvested.toFixed(2)),
          synced: true
        });
      }
    } catch (err) {
      console.error("Failed to sync MegaBull holdings:", err);
    } finally {
      setSyncingMegabull(false);
    }
  };

  const handleRunAgentSurveillance = async (portfolio) => {
    setSurveillanceLoading(true);
    setTradeFeedback(null);
    try {
      const savedStocks = portfolio.portfolio_json?.portfolio || portfolio.portfolio_json?.allocations || [];
      const mergedStocks = savedStocks.map((s) => {
        const sym = String(s.ticker || s.Symbol || s.name || '').toUpperCase().replace('.NS', '');
        const live = megabullHoldingsMap[sym];
        if (live) {
          return {
            ...s,
            ticker: live.ticker,
            current_price: live.ltp,
            avg_price: live.avgPrice,
            units: live.qty,
            allocated_amount: live.currentValue
          };
        }
        return s;
      });

      const res = await fetch(`${API_BASE_URL}/api/agents/active-portfolio-monitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stocks: mergedStocks,
          risk_score: portfolio.risk_score || 65,
          user_id: currentUser?.id,
          portfolio_name: portfolio.portfolio_name
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSurveillance(data);
        setActiveSectionTab('notifier');
        fetchMegabullLiveHoldings();
      }
    } catch (err) {
      console.error("Agent rebalancing scan failed", err);
    } finally {
      setSurveillanceLoading(false);
    }
  };

  const handleExecuteNotifierAction = async (note) => {
    const isMarketOpen = activeSurveillance?.market_status?.is_open ?? marketClock.isOpen;
    if (!isMarketOpen) {
      setTradeFeedback({
        type: 'warning',
        text: `Order blocked: NSE/BSE markets are currently closed (${marketClock.windowText}).`
      });
      return;
    }

    setExecutingTicker(note.ticker);
    setTradeFeedback(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/megabull/execute-rebalance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: note.symbol || note.ticker,
          action: note.action,
          quantity: note.suggested_qty || 1
        })
      });
      const data = await res.json();
      if (res.ok && data.executed) {
        setTradeFeedback({
          type: 'success',
          text: data.message || `Executed ${note.action} (${note.suggested_qty} qty) for ${note.ticker} on MegaBull.`
        });
        await fetchMegabullLiveHoldings();
      } else {
        setTradeFeedback({
          type: 'warning',
          text: data.detail || data.message || `Unable to execute ${note.action} order on MegaBull.`
        });
      }
    } catch (err) {
      setTradeFeedback({
        type: 'warning',
        text: `Execution error: ${err.message}`
      });
    } finally {
      setExecutingTicker(null);
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
        <span className="text-xs font-mono text-slate-600">Loading saved portfolios from Supabase & MegaBull...</span>
      </div>
    );
  }

  if (portfolios.length === 0 && megabullRawList.length === 0) {
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

  const isBackendMarketOpen = activeSurveillance?.market_status?.is_open ?? marketClock.isOpen;
  const actionableCallsCount = activeSurveillance?.notifications?.filter((n) => n.action !== 'HOLD').length || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Top Command Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded border ${
              isBackendMarketOpen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <Clock className="w-3 h-3" />
              {activeSurveillance?.market_status?.status_label || marketClock.label}
            </span>

            {megabullSummary.synced && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-700 font-bold bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                MegaBull Synced ({megabullRawList.length} Holdings)
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Saved Portfolios &amp; Rebalancing Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Autonomous Observer, Planner, Notifier &amp; Executer agents • Order execution strictly gated to {marketClock.windowText}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchMegabullLiveHoldings}
            disabled={syncingMegabull}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${syncingMegabull ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold font-mono">{syncingMegabull ? 'Syncing...' : 'Sync MegaBull'}</span>
          </button>

          <button
            onClick={() => setShowNotificationModal(true)}
            className="relative px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer flex items-center gap-2"
          >
            <Bell className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold font-mono">Alerts</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold">
              {actionableCallsCount || newsFeed.length}
            </span>
          </button>
        </div>
      </div>

      {/* Trade Feedback Banner */}
      {tradeFeedback && (
        <div className={`p-4 rounded-2xl border text-xs font-mono flex items-center justify-between gap-3 ${
          tradeFeedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-2">
            {tradeFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-amber-600" />}
            <span>{tradeFeedback.text}</span>
          </div>
          <button onClick={() => setTradeFeedback(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {portfolios.map((port, idx) => {
        const savedStocks = port.portfolio_json?.portfolio || port.portfolio_json?.allocations || [];

        const sectorLookup = {};
        savedStocks.forEach((s) => {
          const sym = String(s.ticker || s.Symbol || s.name || '').toUpperCase().replace('.NS', '');
          if (sym && (s.sector || s.Sector)) {
            sectorLookup[sym] = s.sector || s.Sector;
          }
        });

        const displayStocks = megabullSummary.synced && megabullRawList.length > 0
          ? megabullRawList.map((mb) => ({
              name: mb.name,
              ticker: mb.ticker,
              sector: sectorLookup[mb.name] || mb.sector,
              avg_price: mb.avgPrice,
              current_price: mb.ltp,
              units: mb.qty,
              allocated_amount: mb.currentValue,
              pnl: mb.pnl,
              chg_pct: mb.chgPct
            }))
          : savedStocks.map((s) => {
              const sym = String(s.ticker || s.Symbol || s.name || '').toUpperCase().replace('.NS', '');
              const live = megabullHoldingsMap[sym];
              if (live) {
                return {
                  ...s,
                  name: s.name || live.name,
                  ticker: live.ticker,
                  sector: s.sector || s.Sector || live.sector,
                  avg_price: live.avgPrice,
                  current_price: live.ltp,
                  units: live.qty,
                  allocated_amount: live.currentValue,
                  pnl: live.pnl,
                  chg_pct: live.chgPct
                };
              }
              return {
                ...s,
                name: s.name || s.StockName || sym,
                ticker: s.ticker || s.Symbol || `${sym}.NS`,
                sector: s.sector || s.Sector || 'NSE Equity',
                avg_price: Number(s.avg_price || s.current_price || s.Price || 0),
                current_price: Number(s.current_price || s.Price || 0),
                units: Number(s.units || s.Quantity || 0),
                allocated_amount: Number(s.allocated_amount || 0),
                pnl: null,
                chg_pct: null
              };
            });

        return (
          <div key={port.id || idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* Portfolio Title & Trigger Rebalancing Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {port.bucket_archetype || "Balanced Core"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                    Risk Score: {port.risk_score}/100 ({port.risk_category})
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1.5">{port.portfolio_name}</h2>
              </div>

              <button
                onClick={() => handleRunAgentSurveillance(port)}
                disabled={surveillanceLoading}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {surveillanceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                <span>{surveillanceLoading ? 'Analyzing Rebalancing...' : 'Trigger Rebalancing'}</span>
              </button>
            </div>

            {/* Clean KPI Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Invested Value</span>
                <span className="text-lg font-extrabold font-mono text-slate-900 mt-0.5 block">
                  ₹{Number(megabullSummary.synced ? megabullSummary.totalInvested : (port.initial_investment || 0)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Current Market Value</span>
                <span className="text-lg font-extrabold font-mono text-slate-900 mt-0.5 block">
                  ₹{Number(megabullSummary.synced ? megabullSummary.totalValue : (port.initial_investment || 0)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Net Unrealized P&amp;L</span>
                <span className={`text-lg font-extrabold font-mono mt-0.5 block ${
                  megabullSummary.totalPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {megabullSummary.totalPnl >= 0 ? '+' : ''}₹{Number(megabullSummary.totalPnl || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Clean 3-Tab Sub-Navigation */}
            <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveSectionTab('holdings')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeSectionTab === 'holdings'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Holdings &amp; Live P&amp;L ({displayStocks.length})</span>
              </button>

              <button
                onClick={() => setActiveSectionTab('observer')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeSectionTab === 'observer'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Observer Live Telemetry ({activeSurveillance?.observer_feed?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveSectionTab('notifier')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeSectionTab === 'notifier'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-emerald-600" />
                <span>Notifier &amp; Rebalance Calls ({actionableCallsCount})</span>
              </button>
            </div>

            {/* TAB 1: HOLDINGS & LIVE P&L */}
            {activeSectionTab === 'holdings' && (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl animate-in fade-in duration-150">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">Holding</th>
                      <th className="p-3.5">Sector</th>
                      <th className="p-3.5 text-right">Avg Buy</th>
                      <th className="p-3.5 text-right">Live LTP</th>
                      <th className="p-3.5 text-right">Units</th>
                      <th className="p-3.5 text-right">Current Value</th>
                      <th className="p-3.5 text-right">P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {displayStocks.map((stock, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-mono text-slate-400">{i + 1}</td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {stock.name}
                          <span className="text-[10px] font-mono text-slate-400 block">{stock.ticker}</span>
                        </td>
                        <td className="p-3.5 text-slate-600">{stock.sector}</td>
                        <td className="p-3.5 text-right font-mono text-slate-600">
                          ₹{Number(stock.avg_price || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-mono font-semibold text-slate-900">
                          ₹{Number(stock.current_price || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                          {stock.units}
                        </td>
                        <td className="p-3.5 text-right font-mono">
                          ₹{Number(stock.allocated_amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold">
                          {stock.pnl !== null && stock.pnl !== undefined ? (
                            <span className={stock.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {stock.pnl >= 0 ? '+' : ''}₹{Number(stock.pnl).toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Pending Sync</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: OBSERVER AGENT LIVE TELEMETRY */}
            {activeSectionTab === 'observer' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {!activeSurveillance?.observer_feed?.length ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <Activity className="w-7 h-7 text-emerald-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">No active Observer scan yet.</p>
                    <p className="text-[11px] text-slate-500">Click "Trigger Rebalancing" above to fetch live NSE prices, dynamic % moves, and circuit boundaries.</p>
                  </div>
                ) : (
                  <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                          Observer Agent • Live NSE Price &amp; Circuit Telemetry
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                        {activeSurveillance.market_status?.ist_timestamp || 'Live Feed'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {activeSurveillance.observer_feed.map((item, i) => {
                        const pct = Number(item.change_pct || 0);
                        const isPositive = pct >= 0;
                        return (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border ${
                              item.is_circuit_limit ? 'bg-rose-950/40 border-rose-700' : 'bg-slate-800/80 border-slate-700'
                            } space-y-1.5`}
                          >
                            <div className="flex justify-between items-center text-xs">
                              <strong className="font-mono text-white">{item.ticker}</strong>
                              <span className={`font-mono font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {isPositive ? '+' : ''}{pct.toFixed(2)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                              <span>LTP: ₹{Number(item.ltp || 0).toLocaleString('en-IN')}</span>
                              <span>Avg: ₹{Number(item.avg_price || 0).toLocaleString('en-IN')}</span>
                            </div>
                            {item.is_circuit_limit && (
                              <span className="inline-block text-[10px] bg-rose-900 text-rose-200 px-2 py-0.5 rounded font-bold font-mono">
                                CIRCUIT THRESHOLD ALERT
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: NOTIFIER AGENT & ACTIONABLE MEGABULL REBALANCE / BUY / SELL */}
            {activeSectionTab === 'notifier' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {!isBackendMarketOpen && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      <strong>Market Hours Guardrail Active:</strong> {activeSurveillance?.market_status?.reason || `NSE/BSE trading is open ${marketClock.windowText}.`} Direct MegaBull BUY/SELL/REBALANCE buttons unlock automatically during live market hours.
                    </span>
                  </div>
                )}

                {!activeSurveillance?.notifications?.length ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <Bell className="w-7 h-7 text-emerald-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">No Notifier recommendations generated yet.</p>
                    <p className="text-[11px] text-slate-500">Click "Trigger Rebalancing" to evaluate your holdings and generate BUY, SELL, or REBALANCE calls.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeSurveillance.notifications.map((note, i) => {
                      const isActionable = note.action !== 'HOLD' && (note.suggested_qty || 0) > 0;
                      const badgeColor =
                        note.action === 'BUY'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : note.action === 'SELL'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : note.action === 'REBALANCE'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200';

                      return (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap font-mono">
                              <strong className="text-sm text-slate-900">{note.ticker}</strong>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded border uppercase font-bold ${badgeColor}`}>
                                {note.action} {isActionable ? `• ${note.suggested_qty} QTY` : ''}
                              </span>
                              <span className="text-[10px] text-slate-500">LTP: ₹{Number(note.ltp || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{note.reason}</p>
                            {note.execution_message && (
                              <span className="text-[10px] font-mono text-slate-400 block">{note.execution_message}</span>
                            )}
                          </div>

                          {isActionable ? (
                            <button
                              onClick={() => handleExecuteNotifierAction(note)}
                              disabled={!isBackendMarketOpen || executingTicker === note.ticker}
                              title={!isBackendMarketOpen ? `Orders allowed only during NSE/BSE hours (${marketClock.windowText})` : `Execute ${note.action} on MegaBull`}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 flex-shrink-0 transition-all ${
                                isBackendMarketOpen
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer'
                                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {executingTicker === note.ticker ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Activity className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {!isBackendMarketOpen
                                  ? 'Market Closed'
                                  : executingTicker === note.ticker
                                  ? 'Executing...'
                                  : `Execute ${note.action} (${note.suggested_qty})`}
                              </span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex-shrink-0">
                              {note.execution_status || 'HOLD'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
                <h3 className="text-base font-extrabold text-slate-900">Agent Intelligence &amp; Alerts</h3>
                <p className="text-xs text-slate-500">Autonomous planner calls and real-time market news feeds.</p>
              </div>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setNotificationTab('calls')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${notificationTab === 'calls' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Buy / Sell Calls ({activeSurveillance?.notifications?.length || 0})</span>
              </button>
              <button
                onClick={() => setNotificationTab('news')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${notificationTab === 'news' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>News &amp; Events ({newsFeed.length})</span>
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {notificationTab === 'calls' ? (
                activeSurveillance?.notifications?.length > 0 ? (
                  activeSurveillance.notifications.map((note, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono font-bold">
                        <span className="text-slate-900">{note.ticker}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase text-[10px]">
                          {note.action} {note.suggested_qty > 0 ? `(${note.suggested_qty})` : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{note.reason}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono text-slate-400">{note.execution_status}</span>
                        {note.action !== 'HOLD' && note.suggested_qty > 0 && (
                          <button
                            onClick={() => {
                              setShowNotificationModal(false);
                              handleExecuteNotifierAction(note);
                            }}
                            disabled={!isBackendMarketOpen}
                            className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold ${
                              isBackendMarketOpen
                                ? 'bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer'
                                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {isBackendMarketOpen ? `Execute ${note.action}` : 'Market Closed'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs font-mono text-slate-400">
                    Click Trigger Rebalancing on your portfolio to generate live execution calls.
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