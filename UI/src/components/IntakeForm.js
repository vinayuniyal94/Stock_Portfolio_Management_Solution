import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  Briefcase, 
  Target, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  Loader2,
  ChevronDown 
} from 'lucide-react';

export default function IntakeForm({ defaultData, onSubmit, isLoading }) {
  const [formData, setFormData] = useState(
    defaultData || {
      investor_name: 'Vinay Uniyal',
      age: 32,
      initial_investment: 500000,
      employment_stability: 'High',
      income_slab: '₹15L - ₹25L',
      primary_goal: 'Wealth Creation',
      investment_horizon: '5-7 Years',
      cagr_expectation: '14-16%',
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'initial_investment' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && !isLoading) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          Step 1: Investor Intake Configuration
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Provide your financial foundation to begin the autonomous agent orchestration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Investor Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-400" />
              Full Name / Investor Identity
            </label>
            <input
              type="text"
              name="investor_name"
              value={formData.investor_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-all"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              Current Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min={18}
              max={100}
              required
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Capital */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-cyan-400" />
              Investment Capital (INR ₹)
            </label>
            <input
              type="number"
              name="initial_investment"
              value={formData.initial_investment}
              onChange={handleChange}
              step={10000}
              min={10000}
              required
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Income Slab */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-violet-400" />
              Annual Income Bracket
            </label>
            <div className="relative">
              <select
                name="income_slab"
                value={formData.income_slab}
                onChange={handleChange}
                className="w-full appearance-none pl-4 pr-10 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="< ₹10L" className="bg-slate-900 text-slate-200">&lt; ₹10L</option>
                <option value="₹10L - ₹15L" className="bg-slate-900 text-slate-200">₹10L - ₹15L</option>
                <option value="₹15L - ₹25L" className="bg-slate-900 text-slate-200">₹15L - ₹25L</option>
                <option value="₹25L+" className="bg-slate-900 text-slate-200">₹25L+</option>
              </select>
              <ChevronDown className="w-5 h-5 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Employment Stability */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Employment Stability
            </label>
            <div className="relative">
              <select
                name="employment_stability"
                value={formData.employment_stability}
                onChange={handleChange}
                className="w-full appearance-none pl-4 pr-10 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="High" className="bg-slate-900 text-slate-200">Salaried / Stable (High)</option>
                <option value="Medium" className="bg-slate-900 text-slate-200">Business / Variable (Medium)</option>
                <option value="Low" className="bg-slate-900 text-slate-200">Freelance / Gig (Low)</option>
              </select>
              <ChevronDown className="w-5 h-5 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Primary Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              Primary Investment Goal
            </label>
            <div className="relative">
              <select
                name="primary_goal"
                value={formData.primary_goal}
                onChange={handleChange}
                className="w-full appearance-none pl-4 pr-10 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="Wealth Creation" className="bg-slate-900 text-slate-200">Wealth Creation</option>
                <option value="Retirement" className="bg-slate-900 text-slate-200">Retirement Planning</option>
                <option value="Capital Preservation" className="bg-slate-900 text-slate-200">Capital Preservation</option>
                <option value="Aggressive Growth" className="bg-slate-900 text-slate-200">Aggressive Growth</option>
              </select>
              <ChevronDown className="w-5 h-5 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Investment Horizon */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Time Horizon
            </label>
            <div className="relative">
              <select
                name="investment_horizon"
                value={formData.investment_horizon}
                onChange={handleChange}
                className="w-full appearance-none pl-4 pr-10 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="1-3 Years" className="bg-slate-900 text-slate-200">1-3 Years (Short Term)</option>
                <option value="3-5 Years" className="bg-slate-900 text-slate-200">3-5 Years (Medium Term)</option>
                <option value="5-7 Years" className="bg-slate-900 text-slate-200">5-7 Years (Long Term)</option>
                <option value="7+ Years" className="bg-slate-900 text-slate-200">7+ Years (Multi-Cycle)</option>
              </select>
              <ChevronDown className="w-5 h-5 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Target CAGR */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              Target CAGR Expectation
            </label>
            <div className="relative">
              <select
                name="cagr_expectation"
                value={formData.cagr_expectation}
                onChange={handleChange}
                className="w-full appearance-none pl-4 pr-10 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-base focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="10-12%" className="bg-slate-900 text-slate-200">10-12% (Nifty 50 Index Baseline)</option>
                <option value="12-15%" className="bg-slate-900 text-slate-200">12-15% (Moderate Alpha Generation)</option>
                <option value="15-18%" className="bg-slate-900 text-slate-200">15-18% (Aggressive Bluechip + Mid-Cap)</option>
                <option value="18%+" className="bg-slate-900 text-slate-200">18%+ (High-Risk Small/Mid-Cap Growth)</option>
              </select>
              <ChevronDown className="w-5 h-5 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-slate-800/80 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-3 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running Risk Profiling Agent...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-200" />
                <span>Trigger Step 1: Risk Profiling Agent</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}