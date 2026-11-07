import React from 'react';
import { ShieldAlert, RefreshCw, Terminal } from 'lucide-react';

export default function AgentFailureView({ errorMessage, onReset }) {
  return (
    <div className="bg-white p-8 sm:p-12 rounded-3xl border border-rose-200 shadow-xl max-w-3xl mx-auto text-center space-y-6 animate-in fade-in duration-200">
      
      <div className="w-20 h-20 bg-rose-50 border-2 border-rose-200 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert className="w-10 h-10 animate-pulse" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono tracking-widest uppercase text-rose-700 font-bold bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          CRO Gatekeeper Halt • Max Iterations (3/3) Reached
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Multi-Agent Compliance Audit Failure
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          The Chief Risk Officer (CRO) Critique Agent rejected the upstream agent output after 3 automated re-correction attempts due to strict adherence guardrails.
        </p>
      </div>

      {/* Terminal Error Log Box */}
      <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl text-left font-mono text-xs space-y-2 border border-slate-800 shadow-inner overflow-x-auto">
        <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-slate-800 pb-2">
          <Terminal className="w-4 h-4" />
          <span>CRO Auditor Fatal Exception Log</span>
        </div>
        <p className="text-slate-400">
          [CRITIQUE_GATEKEEPER]: Max feedback correction loops exhausted. Output failed institutional verification standards.
        </p>
        <p className="text-rose-300">
          {errorMessage || "Reason: Sector mapping discrepancy or confidence score below 75% threshold."}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Workflow & Restart Pipeline</span>
        </button>
      </div>

    </div>
  );
}