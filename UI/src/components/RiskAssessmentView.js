import React from "react";
import { ShieldCheck, ArrowRight, Gauge, Activity } from "lucide-react";

export default function RiskAssessmentView({ riskData, onProceed, loading }) {
  const { risk_score = 68, risk_category = "Moderate-Aggressive", risk_analysis = "" } = riskData || {};

  return (
    <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-xl max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-emerald-400" size={26} />
          <div>
            <h2 className="text-lg font-bold text-white">Agent 1: Risk Profiling Completed</h2>
            <p className="text-xs text-slate-400">Risk appetite and capital capacity calculated by sentiment & mandate analysis.</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-full">
          Assessed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0A0E17] p-5 rounded-xl border border-white/[0.08] text-center flex flex-col items-center justify-center">
          <Gauge className="text-blue-400 mb-2" size={32} />
          <span className="text-xs text-slate-400 uppercase font-semibold">Calculated Risk Score</span>
          <span className="text-3xl font-extrabold text-blue-400 mt-1">{risk_score} / 100</span>
        </div>

        <div className="bg-[#0A0E17] p-5 rounded-xl border border-white/[0.08] col-span-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase font-semibold mb-2">
            <Activity size={14} className="text-emerald-400" /> Sentiment & Risk Profile Category
          </div>
          <div className="text-xl font-bold text-white mb-2">{risk_category}</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {risk_analysis || "Stable cash flows and multi-year time horizon allow absorbing short-term cyclical drawdowns to pursue targeted market alpha."}
          </p>
        </div>
      </div>

      <div className="bg-[#0A0E17] p-4 rounded-xl border border-white/[0.08] flex justify-between items-center text-xs text-slate-400">
        <span>Proceed: <strong>Stock Analyzer Agent</strong> will scan Indian market sectors via FastMCP tools.</span>
        <button
          onClick={onProceed}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
        >
          {loading ? "Analyzing Sectors..." : "Identify Sectors & Equities"} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}