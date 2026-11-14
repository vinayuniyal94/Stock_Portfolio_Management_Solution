import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  BarChart, Bar
} from 'recharts';
import {
  PieChart as PieIcon, TrendingUp, Loader2, RefreshCw, AlertCircle,
  X, Activity, BarChart3, ArrowUpRight, ArrowDownRight, Compass,
  ChevronRight, Wallet, Calendar, ShieldCheck, Layers, Receipt
} from 'lucide-react';

const COLORS = [
  '#059669', '#10b981', '#0284c7', '#38bdf8',
  '#047857', '#34d399', '#818cf8', '#065f46', '#6ee7b7'
];

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000'
  : (process.env.REACT_APP_API_BASE_URL || 'https://arthveda-ai-backend.onrender.com');

export default function PortfolioAnalyticsView({ currentUser, onOpenAuth, setActiveNav }) {
  const [portfolios, setPortfolios] = useState([]);
  const [megabullHoldings, setMegabullHoldings] = useState([]);
  const [accountOverview, setAccountOverview] = useState({ virtual_cash: 0, orders: [] });
  const [marketOutlook, setMarketOutlook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Clean Sub-Navigation Tabs ('overview' | 'holdings' | 'orders')
  const [activeTab, setActiveTab] = useState('overview');

  // Selected Stock Deep-Dive Modal State
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockDetailData, setStockDetailData] = useState(null);
  const [stockDetailLoading, setStockDetailLoading] = useState(false);
  const [historyPeriod, setHistoryPeriod] = useState('1yr');

  const loadAnalyticsData = async (isManualRefresh = false) => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [portRes, mbRes, outlookRes, accountRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/portfolio/${currentUser.id}`).catch(() => null),
        fetch(`${API_BASE_URL}/api/megabull/holdings`).catch(() => null),
        fetch(`${API_BASE_URL}/api/analytics/market-outlook`).catch(() => null),
        fetch(`${API_BASE_URL}/api/megabull/account-overview`).catch(() => null)
      ]);

      if (portRes && portRes.ok) {
        const portData = await portRes.json();
        setPortfolios(portData.portfolios || portData || []);
      }

      if (mbRes && mbRes.ok) {
        const mbData = await mbRes.json();
        const rawItems = Array.isArray(mbData)
          ? mbData
          : (mbData.holdings || mbData.data || mbData.positions || []);

        const normalized = rawItems
          .map((item, index) => {
            const rawSym = String(
              item.instrumentName || item.instrument || item.symbol || item.tradingsymbol || item.ticker || ''
            ).toUpperCase();
            const cleanSym = rawSym.replace('.NS', '').replace('.BO', '').trim();
            const qty = Number(item.qty || item.quantity || item.units || 0);
            const avgPrice = Number(item.avgBuyPrice || item.priceAvg || item.avg_price || item.average_price || item.avg || 0);
            const ltp = Number(item.ltp || item.last_price || item.current_price || item.lastPrice || avgPrice);
            const pnl = (ltp > 0 && avgPrice > 0)
              ? (ltp - avgPrice) * qty
              : Number(item.pl ?? item.pnl ?? 0);
            const pnlPct = avgPrice > 0 && ltp > 0
              ? ((ltp - avgPrice) / avgPrice) * 100
              : 0;

            return {
              id: index + 1,
              name: cleanSym,
              ticker: `${cleanSym}.NS`,
              sector: item.sector || 'NSE Equity',
              avg_price: Number(avgPrice.toFixed(2)),
              current_price: Number(ltp.toFixed(2)),
              units: qty,
              invested_amount: Number((avgPrice * qty).toFixed(2)),
              allocated_amount: Number((ltp * qty).toFixed(2)),
              pnl: Number(pnl.toFixed(2)),
              pnl_pct: Number(pnlPct.toFixed(2)),
              beta: Number(item.beta || 1.0)
            };
          })
          .filter((h) => h.name && h.units > 0);

        setMegabullHoldings(normalized);
      }

      if (outlookRes && outlookRes.ok) {
        const outlookData = await outlookRes.json();
        setMarketOutlook(outlookData);
      }

      if (accountRes && accountRes.ok) {
        const accData = await accountRes.json();
        setAccountOverview(accData);
      }
    } catch (err) {
      console.error('Failed to load portfolio analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData(false);
  }, [currentUser]);

  const handleInspectStock = async (stock, periodOverride = historyPeriod) => {
    setSelectedStock(stock);
    setStockDetailLoading(true);
    try {
      const sym = String(stock.name || stock.ticker || '').replace('.NS', '').trim();
      const res = await fetch(`${API_BASE_URL}/api/analytics/stock-detail/${encodeURIComponent(sym)}?period=${periodOverride}`);
      if (res.ok) {
        const data = await res.json();
        setStockDetailData(data);
      } else {
        setStockDetailData(null);
      }
    } catch (err) {
      console.error('Failed to fetch deep stock details:', err);
      setStockDetailData(null);
    } finally {
      setStockDetailLoading(false);
    }
  };

  const handlePeriodSwitch = (newPeriod) => {
    setHistoryPeriod(newPeriod);
    if (selectedStock) {
      handleInspectStock(selectedStock, newPeriod);
    }
  };

  if (!currentUser) {
    return (
      <div className="enterprise-card bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 max-w-4xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Authentication Required</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please sign in to view your live portfolio analytics synced with Supabase and MegaBull.
        </p>
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-12 text-center flex items-center justify-center space-x-3 bg-white rounded-3xl border border-slate-200 max-w-6xl mx-auto">
        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
        <span className="text-xs font-mono text-slate-600">Syncing live MegaBull &amp; Equity Deep Research analytics...</span>
      </div>
    );
  }

  if (portfolios.length === 0 && megabullHoldings.length === 0) {
    return (
      <div className="enterprise-card bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 max-w-4xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <PieIcon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Portfolio Analytics Awaiting Data</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No active portfolio allocation was found. Complete the workflow wizard to store your custom stock bucket and unlock real-time analytics.
        </p>
        <button
          onClick={() => setActiveNav && setActiveNav('dashboard')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          Go to Workflow Dashboard
        </button>
      </div>
    );
  }

  const latestPortfolio = portfolios[0] || {};
  const savedStocks = latestPortfolio.portfolio_json?.portfolio || latestPortfolio.portfolio_json?.allocations || [];

  // Map sector & beta metadata from saved Supabase portfolio so live MegaBull holdings retain rich metadata
  const metadataLookup = {};
  savedStocks.forEach((s) => {
    const sym = String(s.ticker || s.Symbol || s.name || '').toUpperCase().replace('.NS', '').trim();
    if (sym) {
      metadataLookup[sym] = {
        sector: s.sector || s.Sector || 'NSE Equity',
        beta: Number(s.beta || s.Beta || 1.0)
      };
    }
  });

  const activeHoldings = megabullHoldings.length > 0
    ? megabullHoldings.map((mb) => ({
        ...mb,
        sector: metadataLookup[mb.name]?.sector || mb.sector,
        beta: metadataLookup[mb.name]?.beta || mb.beta || 1.0
      }))
    : savedStocks.map((s, idx) => {
        const sym = String(s.ticker || s.Symbol || s.name || '').toUpperCase().replace('.NS', '').trim();
        const price = Number(s.current_price || s.Price || 0);
        const units = Number(s.units || s.Quantity || 0);
        const allocated = Number(s.allocated_amount || price * units);
        return {
          id: idx + 1,
          name: s.name || s.StockName || sym,
          ticker: s.ticker || s.Symbol || `${sym}.NS`,
          sector: s.sector || s.Sector || 'NSE Equity',
          avg_price: price,
          current_price: price,
          units,
          invested_amount: allocated,
          allocated_amount: allocated,
          pnl: 0,
          pnl_pct: 0,
          beta: Number(s.beta || s.Beta || 1.0)
        };
      });

  const totalCurrentValue = activeHoldings.reduce((acc, h) => acc + Number(h.allocated_amount || 0), 0);
  const totalInvestedValue = activeHoldings.reduce((acc, h) => acc + Number(h.invested_amount || 0), 0);
  const totalUnrealizedPnl = activeHoldings.reduce((acc, h) => acc + Number(h.pnl || 0), 0);
  const totalReturnPct = totalInvestedValue > 0 ? ((totalUnrealizedPnl / totalInvestedValue) * 100) : 0;
  const initialCapital = Number(latestPortfolio.initial_investment || totalInvestedValue || 1000000);

  const holdingsWithWeights = activeHoldings.map((h) => ({
    ...h,
    weight_pct: totalCurrentValue > 0
      ? Number(((h.allocated_amount / totalCurrentValue) * 100).toFixed(2))
      : 0
  }));

  // Weighted Portfolio Beta
  const weightedBeta = holdingsWithWeights.reduce(
    (acc, h) => acc + ((h.weight_pct / 100) * Number(h.beta || 1.0)),
    0
  );

  // Top Gainer & Top Laggard
  const sortedByPnl = [...holdingsWithWeights].sort((a, b) => b.pnl - a.pnl);
  const topPerformer = sortedByPnl[0] || null;
  const bottomPerformer = sortedByPnl[sortedByPnl.length - 1] || null;

  // Sector Aggregation for Donut Pie Chart
  const sectorMap = {};
  holdingsWithWeights.forEach((h) => {
    const sec = h.sector || 'NSE Equity';
    sectorMap[sec] = (sectorMap[sec] || 0) + h.allocated_amount;
  });

  const pieData = Object.keys(sectorMap).map((sec) => ({
    name: sec,
    value: Number(sectorMap[sec].toFixed(2))
  }));

  // 5-Year Portfolio Growth vs Nifty 50 Index Comparison Series
  const targetCagrStr = latestPortfolio.portfolio_json?.target_cagr || '16.5%';
  const targetCagrRate = (parseFloat(targetCagrStr) || 16.5) / 100;
  const niftyCagrRate = 0.12;
  const baseChartCapital = totalCurrentValue > 0 ? totalCurrentValue : initialCapital;

  const indexComparisonData = [];
  let pVal = baseChartCapital;
  let nVal = baseChartCapital;
  for (let yr = 0; yr <= 5; yr++) {
    indexComparisonData.push({
      year: yr === 0 ? 'Current' : `Year ${yr}`,
      Portfolio: Math.round(pVal),
      Nifty50: Math.round(nVal)
    });
    pVal *= (1 + targetCagrRate);
    nVal *= (1 + niftyCagrRate);
  }

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200 relative">
      
      {/* Top Executive Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Registered Suite • Deep Telemetry &amp; Index Benchmarking
            </span>
            {megabullHoldings.length > 0 && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-700 font-bold bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                MegaBull + Equity Deep Research Live ({megabullHoldings.length} Assets)
              </span>
            )}
            {accountOverview.virtual_cash > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-slate-700 font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <Wallet className="w-3 h-3 text-emerald-600" />
                Available Cash: ₹{Number(accountOverview.virtual_cash).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {latestPortfolio.portfolio_name || 'Aggressive Alpha Growth'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Archetype: <strong className="text-slate-700">{latestPortfolio.bucket_archetype || 'Aggressive Alpha Growth'}</strong> • Risk Profile: <strong className="text-emerald-700">{latestPortfolio.risk_category || 'Aggressive'} ({latestPortfolio.risk_score || 75}/100)</strong>
          </p>
        </div>

        <button
          onClick={() => loadAnalyticsData(true)}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Refresh Analytics'}</span>
        </button>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Live Market Value</span>
          <div className="text-xl font-extrabold font-mono text-slate-900">
            ₹{totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] font-mono text-slate-500 block">
            Invested: ₹{totalInvestedValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Total Unrealized P&amp;L</span>
          <div className={`text-xl font-extrabold font-mono flex items-center gap-1 ${totalUnrealizedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {totalUnrealizedPnl >= 0 ? '+' : ''}₹{totalUnrealizedPnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            <span className="text-xs font-semibold">({totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}%)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block">
            Target CAGR: {targetCagrStr} vs Nifty 12.0%
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Portfolio Beta &amp; Sectors</span>
          <div className="text-xl font-extrabold font-mono text-slate-900">
            {weightedBeta.toFixed(2)} β
          </div>
          <span className="text-[11px] font-mono text-emerald-700 block">
            Diversified across {pieData.length} Sectors
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Top Leader / Laggard</span>
          {topPerformer ? (
            <div className="space-y-0.5 text-xs font-mono pt-0.5">
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>▲ {topPerformer.name}</span>
                <span>{topPerformer.pnl >= 0 ? '+' : ''}₹{topPerformer.pnl.toLocaleString('en-IN')}</span>
              </div>
              {bottomPerformer && bottomPerformer.name !== topPerformer.name && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>▼ {bottomPerformer.name}</span>
                  <span>{bottomPerformer.pnl >= 0 ? '+' : ''}₹{bottomPerformer.pnl.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm font-bold text-slate-500">Awaiting Holdings</div>
          )}
        </div>
      </div>

      {/* Clean 3-Tab Sub-Navigation Bar */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PieIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sector Pie, Index Growth &amp; Market Outlook</span>
        </button>

        <button
          onClick={() => setActiveTab('holdings')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'holdings'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Stock Deep-Dive &amp; Risk Exposure ({holdingsWithWeights.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
          <span>MegaBull Order Book ({accountOverview.orders?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: SECTOR PIE CHART, INDEX GROWTH COMPARISON & MARKET OUTLOOK */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Row 1: Sector Pie Chart + Portfolio vs Nifty 50 Index Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sector Allocation Pie Chart Card */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                    <PieIcon className="w-4 h-4 text-emerald-600" /> Sector Allocation View
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Live weight distribution across industries</p>
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded border border-emerald-200 font-bold">
                  {pieData.length} Sectors
                </span>
              </div>

              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={82}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                      contentStyle={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                {pieData.map((sec, idx) => {
                  const pct = totalCurrentValue > 0 ? ((sec.value / totalCurrentValue) * 100).toFixed(1) : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-2 text-slate-700 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        {sec.name}
                      </span>
                      <span className="font-bold text-slate-900">
                        ₹{sec.value.toLocaleString('en-IN')} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Portfolio Growth Comparison vs Nifty 50 Index Card */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> Portfolio Growth vs. Nifty 50 Index
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    5-year projected compounding ({targetCagrStr} Target CAGR vs. 12.0% Nifty 50 Benchmark)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Your Portfolio
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Nifty 50 Index
                  </span>
                </div>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={indexComparisonData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                    />
                    <RechartsTooltip
                      formatter={(val, name) => [`₹${Number(val).toLocaleString('en-IN')}`, name === 'Portfolio' ? 'Your Portfolio' : 'Nifty 50 Index']}
                      contentStyle={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Portfolio"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fill="url(#portGrad)"
                    />
                    <Line
                      type="monotone"
                      dataKey="Nifty50"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Current Base</span>
                  <strong className="text-slate-900">₹{Math.round(baseChartCapital).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Yr 5 Portfolio</span>
                  <strong className="text-emerald-700">₹{indexComparisonData[5]?.Portfolio.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Yr 5 Nifty 50</span>
                  <strong className="text-slate-600">₹{indexComparisonData[5]?.Nifty50.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Live Market Conditions & Breadth Outlook */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 space-y-2.5">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Market Conditions &amp; Regime Outlook
                </span>
              </div>
              <div className="inline-block text-xs font-mono font-bold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                {marketOutlook?.regime || 'Selective Sector Rotation'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {marketOutlook?.stance || 'Evaluating live NSE/BSE breadth across trending and most-active equities.'}
              </p>
              <div className="flex items-center gap-4 text-[11px] font-mono pt-1 text-slate-500">
                <span>Advancing: <strong className="text-emerald-600">{marketOutlook?.breadth?.gainers ?? 0}</strong></span>
                <span>Declining: <strong className="text-rose-600">{marketOutlook?.breadth?.losers ?? 0}</strong></span>
                <span>Bullish Breadth: <strong className="text-slate-900">{marketOutlook?.breadth?.bullish_ratio ?? 50}%</strong></span>
              </div>
            </div>

            <div className="lg:col-span-7 h-44">
              {marketOutlook?.top_movers?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketOutlook.top_movers} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                    <RechartsTooltip
                      formatter={(val) => [`${val}%`, 'Intraday Move']}
                      contentStyle={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '10px' }}
                    />
                    <Bar dataKey="change_pct" radius={[6, 6, 0, 0]}>
                      {marketOutlook.top_movers.map((entry, index) => (
                        <Cell key={index} fill={entry.change_pct >= 0 ? '#059669' : '#e11d48'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  Live NSE/BSE market movers ready
                </div>
              )}
            </div>
          </div>

          {/* Quick Preview Table with Click-to-Inspect */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Holdings Performance Breakdown ({holdingsWithWeights.length} Equities)
              </h4>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-semibold">
                Click any row for Deep Research Dossier
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
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
                    <th className="p-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {holdingsWithWeights.map((stock, i) => (
                    <tr
                      key={i}
                      onClick={() => handleInspectStock(stock)}
                      className="cursor-pointer hover:bg-emerald-50/40 transition-colors"
                    >
                      <td className="p-3.5 font-mono text-slate-400">{i + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {stock.name}
                        <span className="text-[10px] font-mono text-slate-400 block">{stock.ticker}</span>
                      </td>
                      <td className="p-3.5 text-slate-600">{stock.sector}</td>
                      <td className="p-3.5 text-right font-mono text-slate-500">
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
                        <span className="text-[10px] text-slate-400 block">{stock.weight_pct}%</span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold">
                        <span className={stock.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {stock.pnl >= 0 ? '+' : ''}₹{Number(stock.pnl || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right text-slate-400">
                        <ChevronRight className="w-4 h-4 inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INDIVIDUAL STOCK DEEP-DIVE CARDS & RISK CONTRIBUTION */}
      {activeTab === 'holdings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
          {holdingsWithWeights.map((stock, idx) => (
            <div
              key={idx}
              onClick={() => handleInspectStock(stock)}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {stock.sector}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    {stock.name} <span className="text-xs font-mono text-slate-400">({stock.ticker})</span>
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                  Weight: {stock.weight_pct}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Avg → LTP</span>
                  <strong className="text-slate-900">₹{stock.avg_price} → ₹{stock.current_price}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Position Value</span>
                  <strong className="text-slate-900">₹{stock.allocated_amount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Unrealized P&amp;L</span>
                  <strong className={stock.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {stock.pnl >= 0 ? '+' : ''}₹{stock.pnl.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-700 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Beta: {stock.beta}
                </span>
                <span className="font-bold flex items-center gap-1">
                  Open Deep Research Chart <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: MEGABULL ORDER BOOK AUDIT TRAIL */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-500">
              MegaBull Executed &amp; Open Orders (/api/order/my)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              {accountOverview.orders?.length || 0} Recent Orders
            </span>
          </div>

          {!accountOverview.orders || accountOverview.orders.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-500">
              All holdings are settled in delivery (`/api/holding/my`). No pending intraday orders in queue.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3.5">Instrument</th>
                    <th className="p-3.5">Side</th>
                    <th className="p-3.5 text-right">Qty</th>
                    <th className="p-3.5 text-right">Price</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {accountOverview.orders.map((ord, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{ord.instrumentName || ord.symbol || 'NSE'}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          String(ord.action || ord.transactionType).toUpperCase() === 'BUY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {ord.action || ord.transactionType || 'BUY'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">{ord.qty || ord.quantity || 0}</td>
                      <td className="p-3.5 text-right">₹{Number(ord.price || ord.avgPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-right text-emerald-700 font-bold">{ord.status || 'EXECUTED'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* INDIVIDUAL STOCK DEEP-DIVE MODAL (MegaBull + Equity Deep Research Tool) */}
      {selectedStock && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
            
            <button
              onClick={() => setSelectedStock(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedStock.sector}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  MegaBull + Equity Deep Research Dossier
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {stockDetailData?.company_name || selectedStock.name} ({selectedStock.ticker})
              </h2>
              {stockDetailData?.industry && (
                <p className="text-xs text-slate-500">{stockDetailData.industry}</p>
              )}
            </div>

            {stockDetailLoading ? (
              <div className="p-12 text-center flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                <span className="text-xs font-mono text-slate-600">
                  Fetching live fundamentals, historical chart &amp; MegaBull position for {selectedStock.name}...
                </span>
              </div>
            ) : (
              <>
                {/* MegaBull Position Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">MegaBull Qty</span>
                    <strong className="text-base font-extrabold font-mono text-slate-900">
                      {stockDetailData?.megabull_holding?.qty ?? selectedStock.units} Units
                    </strong>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Avg Buy vs LTP</span>
                    <strong className="text-sm font-extrabold font-mono text-slate-900 block">
                      ₹{stockDetailData?.megabull_holding?.avg_buy_price ?? selectedStock.avg_price} → ₹{stockDetailData?.fundamentals?.ltp ?? selectedStock.current_price}
                    </strong>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Position Value</span>
                    <strong className="text-base font-extrabold font-mono text-slate-900">
                      ₹{Number(stockDetailData?.megabull_holding?.current_value ?? selectedStock.allocated_amount).toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Unrealized P&amp;L</span>
                    <strong className={`text-base font-extrabold font-mono flex items-center gap-0.5 ${
                      (stockDetailData?.megabull_holding?.unrealized_pnl ?? selectedStock.pnl) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {(stockDetailData?.megabull_holding?.unrealized_pnl ?? selectedStock.pnl) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      ₹{Number(stockDetailData?.megabull_holding?.unrealized_pnl ?? selectedStock.pnl).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                {/* Indian Stock API Fundamental Ratios */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-600">Trailing P/E</span>
                    <strong className="text-sm font-mono font-extrabold text-slate-900">
                      {stockDetailData?.fundamentals?.pe_ratio ?? '—'}
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-600">Stock Beta</span>
                    <strong className="text-sm font-mono font-extrabold text-slate-900">
                      {stockDetailData?.fundamentals?.beta ?? selectedStock.beta}
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-600">Div. Yield</span>
                    <strong className="text-sm font-mono font-extrabold text-emerald-700">
                      {stockDetailData?.fundamentals?.dividend_yield ?? 0}%
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-600">52W Range</span>
                    <strong className="text-[11px] font-mono font-extrabold text-slate-900">
                      {stockDetailData?.fundamentals?.week_52_low && stockDetailData?.fundamentals?.week_52_high
                        ? `₹${stockDetailData.fundamentals.week_52_low}–₹${stockDetailData.fundamentals.week_52_high}`
                        : 'NSE Live'}
                    </strong>
                  </div>
                </div>

                {/* Historical Price Trajectory Chart */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-slate-600 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-600" /> Historical Price Trajectory
                    </span>
                    <div className="flex gap-1.5">
                      {['6m', '1yr', '3yr'].map((p) => (
                        <button
                          key={p}
                          onClick={() => handlePeriodSwitch(p)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase cursor-pointer ${
                            historyPeriod === p
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-48">
                    {stockDetailData?.price_history?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stockDetailData.price_history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} />
                          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#64748b' }} />
                          <RechartsTooltip
                            formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Price']}
                            contentStyle={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '10px' }}
                          />
                          <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">
                        Historical series ready on live NSE trading window
                      </div>
                    )}
                  </div>
                </div>

                {/* Corporate Actions */}
                {stockDetailData?.corporate_actions?.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Recent Corporate Actions
                    </span>
                    <div className="space-y-1.5">
                      {stockDetailData.corporate_actions.map((ca, idx) => (
                        <div key={idx} className="text-xs text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 flex justify-between">
                          <span className="font-semibold">{ca.purpose || ca.subject || ca.title || 'Corporate Event'}</span>
                          <span className="font-mono text-[10px] text-slate-400">{ca.exDate || ca.date || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}