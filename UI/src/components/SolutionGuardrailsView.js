import React from 'react';
import { ShieldAlert, CheckCircle2, Lock, ShieldCheck, Cpu } from 'lucide-react';

export default function SolutionGuardrailsView() {
  const guardrailsList = [
    {
      title: "PII Redaction & Masking",
      description: "Automatically detects and redacts sensitive personal data (PAN, Aadhaar, phone numbers, emails, and credit cards) before text reaches agent context or LLM payloads.",
      status: "Active",
      icon: ShieldCheck
    },
    {
      title: "Prompt Injection & Jailbreak Defense",
      description: "Scans incoming queries and multi-agent string inputs for malicious override commands, system prompt leaks, or unauthorized role changes.",
      status: "Active",
      icon: Lock
    },
    {
      title: "Deterministic Sector-to-Stock Mapping",
      description: "Enforces strict structural isolation preventing cross-contamination (e.g. ensuring heavy engineering or IT tickers do not slip into Consumer Staples).",
      status: "Active",
      icon: ShieldAlert
    },
    {
      title: "CRO 3-Iteration Audit Gatekeeper",
      description: "Independent Chief Risk Officer agent audits upstream outputs across rigorous confidence scoring thresholds, automatically re-running failed iterations.",
      status: "Active",
      icon: Cpu
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto pb-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Enterprise Security & Compliance
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Solution Guardrails & Security Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active defense mechanisms protecting ArthVeda AI multi-agent workflows, data integrity, and privacy compliance.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All Systems Guardrailed</span>
        </div>
      </div>

      {/* Guardrails Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guardrailsList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                    {item.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>GuardrailsManager v2.4</span>
                <span className="text-emerald-600 font-bold">Enforced</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}