import React from 'react';
import { ArrowRight, UserCheck, Calendar, Target, IndianRupee, Sparkles, Briefcase, ShieldAlert, TrendingUp, Clock } from 'lucide-react';

const HORIZONS = [
  { id: '1-3 Years', label: '1-3 Yrs' },
  { id: '3-5 Years', label: '3-5 Yrs' },
  { id: '5-7 Years', label: '5-7 Yrs' },
  { id: '7+ Years', label: '7+ Yrs' }
];

const CAGR_PRESETS = [
  { id: '10-12%', label: '10–12% (Low-Beta Safe)' },
  { id: '14-16%', label: '14–16% (Nifty Alpha)' },
  { id: '18%+', label: '18%+ (High Growth Alpha)' }
];

const STABILITY_OPTIONS = [
  { id: 'High', label: 'High (Salaried / MNC / Govt)' },
  { id: 'Moderate', label: 'Moderate (Self-Employed / Business)' },
  { id: 'Variable', label: 'Variable (Freelance / Startup)' }
];

const GOAL_OPTIONS = [
  'Wealth Creation & Compounding',
  'Retirement Corpus Building',
  'Capital Preservation & Dividends',
  'Aggressive Alpha Generation',
  'Tax-Optimized Growth'
];

const EXPERIENCE_OPTIONS = [
  'Beginner (< 1 Year)',
  'Intermediate (1-3 Years)',
  'Experienced (3-5 Years)',
  'Seasoned Investor (5+ Years)'
];

const RISK_APPETITE_OPTIONS = [
  { id: 'Conservative', label: 'Conservative (Low Drawdown Tolerance)' },
  { id: 'Moderate', label: 'Moderate (Balanced Core-Satellite)' },
  { id: 'Aggressive', label: 'Aggressive (High Conviction Growth)' }
];

export default function IntakeForm({ userProfile, setUserProfile, onProceed }) {
  return (
    <div className="w-full enterprise-card rounded-3xl p-6 sm:p-8 space-y-5 relative overflow-hidden bg-white shadow-sm">
      {/* Top Accent Gradient */}
      <div className="absolute top-0 right-0 w-96 h-32 bg-emerald-500/5 blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Step 01 of 04 • Investor Profile & Capital Setup
            </span>
          </div>
          <h2 className="text-base font-bold tracking-tight text-slate-900 mt-0.5">
            Comprehensive Fiduciary Onboarding & Goal Setup
          </h2>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        {/* Full Investor Name */}
        <div>
          <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Full Investor Name
          </label>
          <input
            type="text"
            value={userProfile.investor_name || 'Vinay Uniyal'}
            onChange={(e) => setUserProfile({ ...userProfile, investor_name: e.target.value })}
            className="enterprise-input w-full rounded-xl px-4 py-2.5 text-slate-900 text-xs font-medium"
            placeholder="e.g. Vinay Uniyal"
          />
        </div>

        {/* Age */}
        <div>
          <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" /> Age (Years)
          </label>
          <input
            type="number"
            value={userProfile.age || 28}
            onChange={(e) => setUserProfile({ ...userProfile, age: Number(e.target.value) })}
            className="enterprise-input w-full rounded-xl px-4 py-2.5 text-slate-900 font-mono text-xs font-medium"
          />
        </div>

        {/* Primary Goal */}
        <div>
          <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-600" /> Primary Investment Goal
          </label>
          <select
            value={userProfile.primary_goal || 'Wealth Creation & Compounding'}
            onChange={(e) => setUserProfile({ ...userProfile, primary_goal: e.target.value })}
            className="enterprise-input w-full rounded-xl px-4 py-2.5 text-slate-900 text-xs font-medium bg-white"
          >
            {GOAL_OPTIONS.map((goal) => (
              <option key={goal} value={goal}>{goal}</option>
            ))}
          </select>
        </div>

        {/* Risk Appetite Preference */}
        <div>
          <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" /> Stated Risk Appetite
          </label>
          <select
            value={userProfile.stated_risk_appetite || 'Moderate'}
            onChange={(e) => setUserProfile({ ...userProfile, stated_risk_appetite: e.target.value })}
            className="enterprise-input w-full rounded-xl px-4 py-2.5 text-slate-900 text-xs font-medium bg-white"
          >
            {RISK_APPETITE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Employment Stability */}
        <div>
          <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> Employment Stability
          </label>
          <select
            value={userProfile.employment_stability || 'High'}
            onChange={(e) => setUserProfile({ ...userProfile, employment_stability: e.target.value })}
            className="enterprise-input w-full rounded-xl px-4 py-2.5 text-slate-900 text-xs font-medium bg-white"
          >
            {STABILITY_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Market Experience */}
        <div>
          <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Indian Equity Market Experience
          </label>
          <select
            value={userProfile.market_experience || 'Intermediate (1-3 Years)'}
            onChange={(e) => setUserProfile({ ...userProfile, market_experience: e.target.value })}
            className="enterprise-input w-full rounded-xl px-4 py-2.5 text-slate-900 text-xs font-medium bg-white"
          >
            {EXPERIENCE_OPTIONS.map((exp) => (
              <option key={exp} value={exp}>{exp}</option>
            ))}
          </select>
        </div>

        {/* Investment Horizon */}
        <div className="md:col-span-2">
          <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Investment Horizon
          </label>
          <div className="grid grid-cols-4 gap-2">
            {HORIZONS.map((h) => {
              const active = userProfile.investment_horizon === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setUserProfile({ ...userProfile, investment_horizon: h.id })}
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${
                    active
                      ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-800 ring-1 ring-emerald-500/30'
                      : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[11px] block">{h.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target CAGR */}
        <div>
          <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-600" /> Target Return (CAGR)
          </label>
          <select
            value={userProfile.cagr_expectation || '14-16%'}
            onChange={(e) => setUserProfile({ ...userProfile, cagr_expectation: e.target.value })}
            className="enterprise-input w-full rounded-xl px-4 py-2.5 text-slate-900 text-xs font-mono font-medium bg-white"
          >
            {CAGR_PRESETS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Initial Capital & Presets */}
        <div>
          <label className="text-slate-700 font-semibold block mb-1.5 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Initial Capital (INR)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm font-bold">₹</span>
            <input
              type="number"
              step="50000"
              value={userProfile.initial_investment || 500000}
              onChange={(e) => setUserProfile({ ...userProfile, initial_investment: Number(e.target.value) })}
              className="enterprise-input w-full rounded-xl pl-8 pr-4 py-2 text-emerald-700 font-mono font-bold text-xs"
            />
          </div>
          <div className="flex gap-1.5 mt-1.5">
            {[200000, 500000, 1000000, 2500000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setUserProfile({ ...userProfile, initial_investment: amt })}
                className="flex-1 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
              >
                ₹{(amt / 100000).toFixed(amt % 100000 === 0 ? 0 : 1)}L
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-mono">
          Ready to compute granular institutional risk score & goal parameters
        </span>
        <button
          onClick={onProceed}
          className="px-7 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all cursor-pointer"
        >
          Initialize Risk Profiler Agent <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}