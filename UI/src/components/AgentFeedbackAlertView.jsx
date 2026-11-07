import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AgentFeedbackAlertView({ agentName, critiqueFeedback, iterationCount, onAutoProceed, onReset }) {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    // Countdown timer for auto-redirect / recovery after 4 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onAutoProceed) onAutoProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onAutoProceed]);

  return (
    <div className="bg-white p-8 sm:p-12 rounded-3xl border border-amber-200 shadow-2xl max-w-2xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-200">
      
      {/* Animated Glowing Icon */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 bg-amber-400/20 rounded-3xl animate-ping" />
        <div className="relative w-20 h-20 bg-amber-50 border-2 border-amber-300 text-amber-600 rounded-3xl flex items-center justify-center shadow-md">
          <AlertTriangle className="w-10 h-10 animate-bounce" />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono tracking-widest uppercase text-amber-700 font-bold bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200 inline-block shadow-2xs">
          CRO Critique Gatekeeper • Iteration #{iterationCount} of 3
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Refining {agentName || 'Agent'} Output
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          The Chief Risk Officer (CRO) inspected this stage and provided targeted feedback to ensure institutional compliance and zero cross-contamination.
        </p>
      </div>

      {/* Dynamic Critique Feedback Speech / Terminal Box */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl text-left space-y-2 border border-slate-800 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono text-amber-400">
          <span className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="w-4 h-4" /> CRO Auditor Feedback Remarks:
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
            Auto-Correcting
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          "{critiqueFeedback || 'Adjusting risk weights and asset parameters to meet rigorous SEBI institutional benchmarks.'}"
        </p>
      </div>

      {/* Auto-Recovery Countdown Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
        <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
        <span>Self-correcting and redirecting back to workflow in <strong className="text-emerald-700 font-bold">{countdown}s</strong>...</span>
      </div>

      {/* Manual Actions */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={onAutoProceed}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
        >
          <span>Proceed Immediately</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          className="px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          Reset Pipeline
        </button>
      </div>

    </div>
  );
}