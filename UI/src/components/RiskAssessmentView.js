import React from 'react';
import { ArrowRight, ArrowLeft, ShieldCheck, Activity, BarChart3, CheckCircle2 } from 'lucide-react';

export default function RiskAssessmentView({ riskState, userProfile, onBack, onProceed }) {
  const riskScore = riskState?.risk_score || 65;
  const riskCategory = riskState?.risk_category || 'Moderate-Aggressive';
  const riskAnalysis = riskState?.risk_analysis || 'Balanced profile with high risk capacity and stable income stability.';

  return (
    <div className="w-full enterprise-card rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden bg-white shadow-sm animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Step 02 of 04 • Risk Profiler Agent
          </span>
          <h2 className="text-base font-bold tracking-tight text-slate-900 mt-0.5">
            Behavioral Risk Tolerance & Capacity Analysis
          </h2>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>

      {/* Main Score & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        
        {/* Risk Score Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Computed Risk Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold font-mono text-emerald-700">{riskScore}</span>
              <span className="text-slate-400 text-xs font-mono">/ 100</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-800 block">Archetype: {riskCategory}</span>
          </div>
        </div>

        {/* Risk Analysis Rationale */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider block">Agent Synthesis</span>
            <p className="text-xs text-slate-700 leading-relaxed mt-1">
              {riskAnalysis}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600 pt-2 border-t border-emerald-200/60">
            <span>Horizon: <strong className="text-slate-900">{userProfile.investment_horizon}</strong></span>
            <span>•</span>
            <span>Target CAGR: <strong className="text-emerald-700">{userProfile.cagr_expectation}</strong></span>
          </div>
        </div>

      </div>

      {/* Footer Nav */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Intake Form
        </button>
        <button
          onClick={onProceed}
          className="px-7 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
        >
          Initialize Stock Analyzer Agent <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}