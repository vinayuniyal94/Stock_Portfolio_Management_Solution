import React, { useState, useEffect } from 'react';
import { 
  Cpu, Sparkles, ShieldCheck, Database, CheckCircle2, 
  TrendingUp, RefreshCw, AlertCircle 
} from 'lucide-react';

const FULLSCREEN_AGENT_STEPS = [
  { 
    title: 'ReAct Agent Reasoning & Execution', 
    desc: 'Executing Think -> Plan -> Act lifecycle for the current step.', 
    icon: Cpu, 
    accent: 'bg-emerald-50 text-emerald-600 border-emerald-200' 
  },
  { 
    title: 'Live Data & Constraints Gathering', 
    desc: 'Validating sector mappings, risk metrics, and guardrails.', 
    icon: Database, 
    accent: 'bg-blue-50 text-blue-600 border-blue-200' 
  },
  { 
    title: 'CRO Critique & Quality Audit Gate', 
    desc: 'Chief Risk Officer consulting and evaluating agent output quality.', 
    icon: ShieldCheck, 
    accent: 'bg-indigo-50 text-indigo-600 border-indigo-200' 
  },
  { 
    title: 'Finalizing & Locking Output', 
    desc: 'Preparing verified portfolio and metrics for display.', 
    icon: TrendingUp, 
    accent: 'bg-teal-50 text-teal-700 border-teal-200' 
  }
];

export default function AgentBusyModal({ message }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isRetriggered, setIsRetriggered] = useState(false);
  const [critiqueNotice, setCritiqueNotice] = useState('');

  useEffect(() => {
    if (message) {
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('reject') || lowerMsg.includes('re-running') || lowerMsg.includes('correction') || lowerMsg.includes('audit')) {
        setIsRetriggered(true);
        setCritiqueNotice(message);
        setActiveStepIndex(2); // Jump to CRO audit step indicator
      } else {
        setCritiqueNotice(message);
      }
    }
  }, [message]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < FULLSCREEN_AGENT_STEPS.length - 1 ? prev + 1 : prev));
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const ActiveIcon = FULLSCREEN_AGENT_STEPS[activeStepIndex].icon;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200 select-none">
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] max-h-[750px] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ArthVeda LangGraph Engine + CRO Gatekeeper
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
                Multi-Agent ReAct & Critique Audit Command Center
              </h2>
            </div>
          </div>
          
          {/* Re-trigger / Critique Feedback Badge */}
          {isRetriggered ? (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold animate-pulse shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>CRO Feedback: Agent Re-Triggered</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Active CRO Consultation</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto relative z-10 py-2 overflow-hidden">
          
          {/* Left Column */}
          <div className="md:col-span-5 flex flex-col items-center text-center space-y-4 p-6 bg-slate-50/90 border border-slate-200/80 rounded-3xl shadow-xs">
            <div className="relative my-2">
              <div className="absolute -inset-4 rounded-full border-2 border-dashed border-emerald-400/60 animate-spin" style={{ animationDuration: '10s' }} />
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center relative shadow-lg border transition-all duration-500 ${FULLSCREEN_AGENT_STEPS[activeStepIndex].accent}`}>
                <ActiveIcon className="w-12 h-12 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 w-full">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 font-bold block">
                {isRetriggered ? 'Re-running Agent with CRO Feedback' : 'Executing ReAct Pipeline'}
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                {FULLSCREEN_AGENT_STEPS[activeStepIndex].title}
              </h3>
              
              {/* Dynamic Critique Feedback Box */}
              <div className="text-left bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500 uppercase">
                  <AlertCircle className="w-3 h-3 text-emerald-600" /> Live Agent Status:
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {critiqueNotice || FULLSCREEN_AGENT_STEPS[activeStepIndex].desc}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Steps */}
          <div className="md:col-span-7 space-y-2.5 overflow-hidden">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
              Step-by-Step CRO Audit & Verification Sequence
            </span>

            {FULLSCREEN_AGENT_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isDone = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;

              return (
                <div 
                  key={idx}
                  className={`flex items-center justify-between gap-2 p-3 rounded-2xl transition-all ${
                    isCurrent 
                      ? 'bg-white border-2 border-emerald-500 shadow-sm ring-2 ring-emerald-50' 
                      : isDone 
                      ? 'bg-emerald-50/40 border border-emerald-200 opacity-80' 
                      : 'bg-white/50 border border-slate-200 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDone ? 'bg-emerald-100 text-emerald-700' : isCurrent ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs truncate ${isCurrent ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2 text-right">
                    {isCurrent && (
                      <span className="text-[9px] font-mono text-blue-700 font-bold uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 animate-pulse whitespace-nowrap inline-block shadow-xs">
                        Auditing...
                      </span>
                    )}
                    {isDone && (
                      <span className="text-[9px] font-mono text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 whitespace-nowrap inline-block shadow-xs">
                        CRO Approved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="space-y-3 relative z-10 border-t border-slate-100 pt-4 flex-shrink-0">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div 
              className="bg-emerald-600 h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${((activeStepIndex + 1) / FULLSCREEN_AGENT_STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>ArthVeda Multi-Agent LangGraph Framework</span>
            <span>Chief Risk Officer (CRO) Gatekeeper Channel</span>
          </div>
        </div>

      </div>
    </div>
  );
}