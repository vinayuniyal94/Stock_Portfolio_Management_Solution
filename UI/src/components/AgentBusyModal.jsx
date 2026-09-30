import React from 'react';
import { Bot, Loader2, Sparkles, Cpu, ShieldCheck } from 'lucide-react';

export default function AgentBusyModal({ isOpen, currentStepIndex, activeAgentName, activeTaskDescription }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md enterprise-card rounded-3xl p-8 space-y-6 relative bg-white shadow-2xl animate-in zoom-in-95 duration-200 text-center">
          
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20 relative">
            <Bot className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Autonomous Agent Stage 0{currentStepIndex}
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{activeAgentName}</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {activeTaskDescription}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center space-x-3">
            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
            <span className="text-xs font-mono font-medium text-slate-700">Querying live NSE feeds & computing metrics...</span>
          </div>

          <div className="pt-2 flex items-center justify-center gap-4 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-emerald-600" /> LangGraph Engine</span>
            <span>•</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-600" /> SEBI Guardrails</span>
          </div>

        </div>
      </div>
    </>
  );
}