import React from 'react';
import { FileText, ShieldCheck, Compass, PieChart, CheckCircle2, ChevronRight } from 'lucide-react';

export default function AgentWorkflowView({ currentStep, setCurrentStep, riskState, analyzerState, portfolioData }) {
  const steps = [
    { num: 1, title: 'Intake Form', icon: FileText, ready: true },
    { num: 2, title: 'Risk Profiler', icon: ShieldCheck, ready: Boolean(riskState) },
    { num: 3, title: 'Stock Analyzer', icon: Compass, ready: Boolean(analyzerState) },
    { num: 4, title: 'Stock Bucket', icon: PieChart, ready: Boolean(portfolioData) },
  ];

  return (
    <div className="w-full">
      <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 px-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between gap-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isCurrent = currentStep === s.num;
          const isDone = currentStep > s.num || s.ready;

          return (
            <React.Fragment key={s.num}>
              <button
                disabled={!isDone && !isCurrent}
                onClick={() => s.ready && setCurrentStep(s.num)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                    : 'bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${
                  isCurrent ? 'bg-white/20 text-white' : isDone ? 'text-emerald-700' : 'text-slate-400'
                }`}>
                  {isDone && !isCurrent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-medium truncate">0{s.num}. {s.title}</span>
              </button>

              {idx < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}