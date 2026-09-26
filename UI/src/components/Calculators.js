import React, { useState } from "react";
import { Calculator } from "lucide-react";

export default function Calculators() {
  const [activeCalc, setActiveCalc] = useState("sip");

  // Stock SIP state
  const [monthlySip, setMonthlySip] = useState(15000);
  const [sipRate, setSipRate] = useState(14);
  const [sipYears, setSipYears] = useState(5);

  // Stock Average state
  const [b1Qty, setB1Qty] = useState(50);
  const [b1Price, setB1Price] = useState(1200);
  const [b2Qty, setB2Qty] = useState(30);
  const [b2Price, setB2Price] = useState(1050);

  // Math calculations
  const months = sipYears * 12;
  const monthlyRate = sipRate / 12 / 100;
  const sipTotalInvested = monthlySip * months;
  const sipFutureVal = Math.round(monthlySip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));

  const totalQty = Number(b1Qty) + Number(b2Qty);
  const totalCost = (b1Qty * b1Price) + (b2Qty * b2Price);
  const avgPrice = totalQty > 0 ? (totalCost / totalQty).toFixed(2) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b border-white/[0.06] pb-3">
        <button
          onClick={() => setActiveCalc("sip")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeCalc === "sip" ? "bg-blue-600 text-white" : "bg-[#101622] text-slate-400 hover:text-white"
          }`}
        >
          Stock SIP Calculator
        </button>
        <button
          onClick={() => setActiveCalc("average")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeCalc === "average" ? "bg-blue-600 text-white" : "bg-[#101622] text-slate-400 hover:text-white"
          }`}
        >
          Stock Average Price Calculator
        </button>
      </div>

      {activeCalc === "sip" && (
        <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Calculator size={18} className="text-blue-400" /> Monthly Stock SIP Inputs
            </h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Monthly Investment (₹)</label>
              <input type="number" value={monthlySip} onChange={(e) => setMonthlySip(Number(e.target.value))} className="w-full bg-[#0A0E17] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Expected Return CAGR (% per annum)</label>
              <input type="number" value={sipRate} onChange={(e) => setSipRate(Number(e.target.value))} className="w-full bg-[#0A0E17] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Time Period (Years)</label>
              <input type="number" value={sipYears} onChange={(e) => setSipYears(Number(e.target.value))} className="w-full bg-[#0A0E17] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="bg-[#0A0E17] border border-white/[0.08] p-6 rounded-xl flex flex-col justify-center space-y-4">
            <span className="text-xs text-slate-400 uppercase font-semibold">SIP Projection Summary</span>
            <div>
              <div className="text-xs text-slate-400">Total Invested Capital</div>
              <div className="text-xl font-bold text-white">₹{sipTotalInvested.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Estimated Returns</div>
              <div className="text-xl font-bold text-emerald-400">₹{(sipFutureVal - sipTotalInvested).toLocaleString("en-IN")}</div>
            </div>
            <div className="border-t border-white/[0.06] pt-3">
              <div className="text-xs text-slate-400">Expected Total Portfolio Value</div>
              <div className="text-2xl font-black text-blue-400">₹{sipFutureVal.toLocaleString("en-IN")}</div>
            </div>
          </div>
        </div>
      )}

      {activeCalc === "average" && (
        <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Calculator size={18} className="text-purple-400" /> Stock Average Price Inputs
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Buy 1 Quantity</label>
                <input type="number" value={b1Qty} onChange={(e) => setB1Qty(Number(e.target.value))} className="w-full bg-[#0A0E17] border border-white/[0.08] rounded-lg p-2 text-xs text-white outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Buy 1 Price (₹)</label>
                <input type="number" value={b1Price} onChange={(e) => setB1Price(Number(e.target.value))} className="w-full bg-[#0A0E17] border border-white/[0.08] rounded-lg p-2 text-xs text-white outline-none focus:border-purple-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Buy 2 (Dip) Quantity</label>
                <input type="number" value={b2Qty} onChange={(e) => setB2Qty(Number(e.target.value))} className="w-full bg-[#0A0E17] border border-white/[0.08] rounded-lg p-2 text-xs text-white outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Buy 2 Price (₹)</label>
                <input type="number" value={b2Price} onChange={(e) => setB2Price(Number(e.target.value))} className="w-full bg-[#0A0E17] border border-white/[0.08] rounded-lg p-2 text-xs text-white outline-none focus:border-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#0A0E17] border border-white/[0.08] p-6 rounded-xl flex flex-col justify-center space-y-4">
            <span className="text-xs text-slate-400 uppercase font-semibold">Averaging Result</span>
            <div>
              <div className="text-xs text-slate-400">Total Shares Held</div>
              <div className="text-xl font-bold text-white">{totalQty} Units</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Capital Deployed</div>
              <div className="text-xl font-bold text-white">₹{totalCost.toLocaleString("en-IN")}</div>
            </div>
            <div className="border-t border-white/[0.06] pt-3">
              <div className="text-xs text-slate-400">Blended Average Price</div>
              <div className="text-2xl font-black text-purple-400">₹{avgPrice}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}