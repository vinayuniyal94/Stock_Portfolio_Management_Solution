import React from 'react';
import { 
  Bot, 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

const AGENT_STAGES = [
  {
    id: 1,
    name: 'Investor Intake & Validation',
    description: 'Validating investor parameters and investment horizon constraints...',
    icon: Bot,
  },
  {
    id: 2,
    name: 'Risk Profiler Agent',
    description: 'Scoring risk tolerance, age brackets, and synthesizing reasoning via LLM...',
    icon: ShieldCheck,
  },
  {
    id: 3,
    name: 'Stock Analyzer Agent',
    description: 'Connecting via MCP to yfinance: screening NSE valuations, P/E ratios, and Beta...',
    icon: TrendingUp,
  },
  {
    id: 4,
    name: 'Stock Bucket Agent',
    description: 'Calculating lot quantities, asset weights, and 3-tier horizon compounding...',
    icon: PieChart,
  }
];

export default function AgentBusyModal({ 
  isOpen, 
  currentStepIndex = 1,
  activeAgentName = "Autonomous Agent",
  activeTaskDescription = "Processing background operations..."
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl p-7 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 mb-6 pb-4 border-b border-slate-800/80">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              {activeAgentName} Active
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTaskDescription}
            </p>
          </div>
        </div>

        {/* Multi-Agent Sequential Checklist */}
        <div className="space-y-3 mb-6">
          {AGENT_STAGES.map((stage) => {
            const Icon = stage.icon;
            const isCompleted = currentStepIndex > stage.id;
            const isActive = currentStepIndex === stage.id;

            return (
              <div
                key={stage.id}
                className={`flex items-start space-x-3.5 p-3 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-500/5'
                    : isCompleted
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
                    : 'bg-slate-900/10 border-slate-800/30 opacity-40'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                      {stage.id}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${isActive ? 'text-slate-100 font-semibold' : 'text-slate-300'}`}>
                      {stage.name}
                    </p>
                    {isActive && (
                      <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Running
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Observability Ticker */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block mr-1" />
            Live Pipes: yfinance • Pinecone • HuggingFace
          </span>
          <span>NSE / BSE Real-Time</span>
        </div>
      </div>
    </div>
  );
}