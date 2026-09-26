import React, { useState } from "react";
import { ArrowRight, User, Wallet, Target, Sparkles } from "lucide-react";

export default function IntakeForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    investor_name: "Rahul Verma",
    age: 32,
    initial_investment: 500000,
    employment_stability: "Salaried - High Stability (MNC/Govt)",
    income_slab: "₹15L - ₹25L",
    primary_goal: "Long Term Wealth Creation",
    investment_horizon: "5-7 Years",
    cagr_expectation: "14-16%"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      age: Number(formData.age),
      initial_investment: Number(formData.initial_investment)
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Investment Mandate Intake</h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Provide your capital profile. Our Supervisor Agent will evaluate risk appetite and orchestrate the sector screening engine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="premium-card p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-blue-400">
            <User size={14} /> Demographics & Initial Capital
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Investor Name</label>
              <input type="text" name="investor_name" value={formData.investor_name} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Lump Sum Capital (₹)</label>
              <input type="number" name="initial_investment" value={formData.initial_investment} onChange={handleChange} required className="input-field font-mono" />
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-5">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Wallet size={14} /> Employment & Income Stability
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Employment Profile</label>
              <select name="employment_stability" value={formData.employment_stability} onChange={handleChange} className="input-field">
                <option>Salaried - High Stability (MNC/Govt)</option>
                <option>Salaried - Medium Stability (Private)</option>
                <option>Self-Employed / Business Owner</option>
                <option>Freelancer / Contractual</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Annual Income Slab</label>
              <select name="income_slab" value={formData.income_slab} onChange={handleChange} className="input-field">
                <option>Below ₹5L</option>
                <option>₹5L - ₹15L</option>
                <option>₹15L - ₹25L</option>
                <option>Above ₹25L</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-5">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Target size={14} /> Investment Horizon & CAGR Goal
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Primary Objective</label>
              <select name="primary_goal" value={formData.primary_goal} onChange={handleChange} className="input-field">
                <option>Long Term Wealth Creation</option>
                <option>Retirement Corpus Building</option>
                <option>Child Higher Education</option>
                <option>Aggressive Capital Growth</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Horizon</label>
              <select name="investment_horizon" value={formData.investment_horizon} onChange={handleChange} className="input-field">
                <option>1-3 Years (Short Term)</option>
                <option>3-5 Years (Medium Term)</option>
                <option>5-7 Years (Long Term)</option>
                <option>10+ Years (Ultra Long)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">CAGR Expectation</label>
              <select name="cagr_expectation" value={formData.cagr_expectation} onChange={handleChange} className="input-field">
                <option>8-10% (Conservative)</option>
                <option>11-13% (Nifty Index Base)</option>
                <option>14-16% (Quality Growth)</option>
                <option>18%+ (High Alpha Equity)</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary-gradient flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
          {loading ? (
            <span>Orchestrating Multi-Agent Workflow...</span>
          ) : (
            <>
              <Sparkles size={15} /> Execute Risk Profiling Agent <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}