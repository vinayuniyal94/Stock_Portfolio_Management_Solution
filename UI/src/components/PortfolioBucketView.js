import React, { useState, useRef, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid 
} from 'recharts';
import { PieChart as PieIcon, IndianRupee, Sparkles, TrendingUp, Info, X, ArrowLeft, RotateCcw } from 'lucide-react';

const COLORS = [
  '#059669', '#10b981', '#34d399', '#6ee7b7', 
  '#047857', '#065f46', '#a7f3d0', '#0284c7', '#38bdf8', '#818cf8', '#c084fc'
];

export default function PortfolioBucketView({ portfolioData, currentUser, onOpenRegister, onBack, onReset }) {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef(null);

  // Debug backend response payload
  console.log('PortfolioBucketView received portfolioData:', portfolioData);

  // Comprehensive extraction across all possible backend keys and nested responses
  const rawPortfolio = 
    portfolioData?.portfolio || 
    portfolioData?.allocations || 
    portfolioData?.stocks || 
    portfolioData?.result?.portfolio || 
    portfolioData?.result?.allocations || 
    portfolioData?.data?.portfolio || 
    portfolioData?.portfolio_json?.portfolio || 
    portfolioData?.portfolio_json?.allocations || 
    (Array.isArray(portfolioData) ? portfolioData : []);

  const portfolio = rawPortfolio.map((stock, idx) => ({
    id: stock.id || stock.StockID || idx + 1,
    name: stock.name || stock.StockName || stock.company_name || stock.equity_name || stock.title || 'Equity Asset',
    ticker: stock.ticker || stock.Symbol || stock.nse_code || stock.ric || 'EQ.NS',
    sector: stock.sector || stock.Sector || stock.macro_sector || stock.industry || 'General Equity',
    current_price: Number(stock.current_price || stock.Price || stock.ltp || stock.price || 1000),
    units: Number(stock.units || stock.Quantity || stock.shares || stock.qty || 10),
    allocated_amount: Number(stock.allocated_amount || stock.AllocationAmount || stock.amount || stock.investment || 50000),
    allocation_percentage: Number(stock.allocation_percentage || stock.AllocationPercentage || stock.weight || stock.percentage || 10),
    beta: Number(stock.beta || stock.Beta || 0.5)
  }));

  const initialCapital = Number(portfolioData?.initial_investment || portfolioData?.initial_capital || 500000);
  const targetCagr = portfolioData?.target_cagr || portfolioData?.cagr || '16.5%';
  const archetype = portfolioData?.bucket_archetype || portfolioData?.archetype || 'Aggressive Alpha Growth';

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Properly aggregate allocation data by sector for all sectors
  const sectorMap = {};
  portfolio.forEach((stock) => {
    const secName = stock.sector;
    sectorMap[secName] = (sectorMap[secName] || 0) + stock.allocated_amount;
  });

  const pieData = Object.keys(sectorMap).map((sector) => ({
    name: sector,
    value: sectorMap[sector]
  }));

  // 2. Generate 5-Year Projected Growth vs Nifty 50 Benchmark Data
  const cagrValue = parseFloat(targetCagr) / 100 || 0.165;
  const growthData = [];
  let portVal = initialCapital;
  let niftyVal = initialCapital;

  for (let year = 0; year <= 5; year++) {
    growthData.push({
      year: `Year 0${year}`,
      Portfolio: Math.round(portVal),
      Nifty50: Math.round(niftyVal)
    });
    portVal *= (1 + cagrValue);
    niftyVal *= (1 + 0.12);
  }

  // 3. Format raw thesis text into clean bullet points
  const rawThesis = portfolioData?.portfolio_thesis || portfolioData?.thesis || portfolioData?.summary ||
    "This curated portfolio optimizes risk-adjusted returns by balancing high-beta structural growth engines with defensive cash-flow generators.";
  
  const rationalePoints = rawThesis
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.trim().length > 0);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-3xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sector Analysis</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {!currentUser && (
            <button
              onClick={onOpenRegister}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Register to Buy / Save Portfolio</span>
            </button>
          )}
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Start New Portfolio Scenario</span>
          </button>
        </div>
      </div>

      {/* Top 3 Card Chart & Metric View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        
        {/* Card 1: Sector Allocation Pie Chart */}
        <div className="enterprise-card rounded-3xl p-5 flex flex-col justify-between bg-white shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-emerald-600" /> Sector Allocation Breakdown
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {pieData.length} Sectors ({portfolio.length} Equities)
            </span>
          </div>
          <div className="w-full h-40">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                Awaiting sector breakdown...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-mono text-center truncate">
            Fully linked across all macroeconomic pillars
          </div>
        </div>

        {/* Card 2: Combined Capital Deployed & Target Compounding Metric */}
        <div className="enterprise-card rounded-3xl p-6 flex flex-col justify-between bg-white shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Capital & Compounding
            </span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              SEBI Fiduciary
            </span>
          </div>
          <div className="my-2 space-y-2">
            <div>
              <span className="text-2xl font-extrabold font-mono text-slate-900">₹{Number(initialCapital).toLocaleString('en-IN')}</span>
              <span className="text-[11px] text-slate-500 block">{archetype}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">Target CAGR:</span>
              <span className="text-lg font-extrabold font-mono text-emerald-700">{targetCagr}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">Horizon:</span>
            <strong className="text-slate-800">5-7 Years Core</strong>
          </div>
        </div>

        {/* Card 3: 5-Year Growth Line Chart */}
        <div className="enterprise-card rounded-3xl p-5 flex flex-col justify-between bg-white shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> 5-Yr Growth vs Nifty 50
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} />
                <RechartsTooltip 
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '10px' }}
                />
                <Line type="monotone" dataKey="Portfolio" stroke="#059669" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Nifty50" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-500 mt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600" /> Portfolio</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> Nifty 50 Benchmark</span>
          </div>
        </div>

      </div>

      {/* Recommended Stocks Table Section */}
      <div className="enterprise-card rounded-3xl p-6 sm:p-8 space-y-5 bg-white shadow-sm border border-slate-200 w-full relative">
        
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Holdings Breakdown
            </span>
            <h3 className="text-base font-bold tracking-tight text-slate-900 mt-1">
              Stock Bucket Agent Output ({portfolio.length} Equities)
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={popoverRef}>
              <button
                onClick={() => setShowPopover(!showPopover)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Portfolio Rationale</span>
              </button>

              {showPopover && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider">Strategy Thesis</span>
                    </div>
                    <button 
                      onClick={() => setShowPopover(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {rationalePoints.map((point, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                        <span className="leading-relaxed font-medium">{point.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">#</th>
                <th className="p-3.5">Holding Name</th>
                <th className="p-3.5">Sector</th>
                <th className="p-3.5 text-right">Price (INR)</th>
                <th className="p-3.5 text-right">Units</th>
                <th className="p-3.5 text-right">Allocation</th>
                <th className="p-3.5 text-right">Beta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {portfolio.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400 font-mono">
                    {portfolioData?.error || "Awaiting live agent output from Stock Bucket Agent..."}
                  </td>
                </tr>
              ) : (
                portfolio.map((stock, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400">{stock.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {stock.name} <span className="text-[10px] font-mono text-slate-400 block">{stock.ticker}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{stock.sector}</td>
                    <td className="p-3.5 text-right font-mono">₹{stock.current_price?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-700">{stock.units}</td>
                    <td className="p-3.5 text-right font-mono">₹{stock.allocated_amount?.toLocaleString('en-IN')} ({stock.allocation_percentage}%)</td>
                    <td className="p-3.5 text-right font-mono text-slate-600">{stock.beta}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}