import React from 'react';
import { Cpu, ShieldCheck, CheckCircle2, Layers, Activity, Zap } from 'lucide-react';

export default function AgentPipelineMonitorView() {
  const pipelineStages = [
    {
      step: "01",
      name: "Supervisor Agent",
      role: "Workflow Orchestrator",
      status: "Active & Routing",
      description: "Controls execution graph routing, step boundaries, and overall multi-agent lifecycle.",
      icon: Layers,
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200"
    },
    {
      step: "02",
      name: "Risk Profiler Agent",
      role: "Behavioral Risk Assessment",
      status: "Verified",
      description: "Analyzes user profile parameters to compute psychological risk capacity and score (0-100).",
      icon: Cpu,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      step: "03",
      name: "Critique Agent (CRO)",
      role: "Chief Risk Officer Gatekeeper",
      status: "Active Guardrails",
      description: "Audits outputs across a 3-iteration feedback loop, verifying sector constraints and PII privacy compliance.",
      icon: ShieldCheck,
      // Subtle, sophisticated color for CRO critique agent
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200"
    },
    {
      step: "04",
      name: "Stock Analyzer Agent",
      role: "Macro Sector Discovery",
      status: "Active Live APIs",
      description: "Dynamically discovers macro sectors using live trending/active feeds and queries verified NSE equities.",
      icon: Activity,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      step: "05",
      name: "Stock Bucket Agent",
      role: "Portfolio Construction",
      status: "Strict Sub-Selection",
      description: "Curates high-conviction portfolios strictly from the sector pool provided by the Stock Analyzer with dynamic sizing.",
      icon: CheckCircle2,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200"
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200 max-w-7xl mx-auto pb-4">
      
      {/* Header Banner - Compact & Proportional */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Registered Suite • Governance & Telemetry
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Agent Pipeline Monitor Grid
          </h2>
          <p className="text-[11px] text-slate-500">
            Real-time overview of active ArthVeda AI multi-agent nodes and CRO verification gates.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[11px] font-mono shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>OpenAI gpt-4o-mini Active</span>
        </div>
      </div>

      {/* Grid View: All 6 Cards Proportioned to Fit Without Scrolling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {pipelineStages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div 
              key={idx} 
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group"
            >
              {/* Background Step Watermark */}
              <div className="absolute top-2 right-3 text-3xl font-black text-slate-100 select-none font-mono pointer-events-none group-hover:text-emerald-50/60 transition-colors">
                {stage.step}
              </div>

              {/* Card Top */}
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${stage.badgeColor}`}>
                    {stage.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{stage.name}</h3>
                  <p className="text-[10px] font-semibold text-emerald-600 font-mono mt-0.5">{stage.role}</p>
                </div>
              </div>

              {/* Card Body */}
              <p className="text-[11px] text-slate-600 leading-relaxed relative z-10 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                {stage.description}
              </p>

              {/* Card Footer Status */}
              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400 relative z-10">
                <span>Provider: OpenAI</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Operational
                </span>
              </div>
            </div>
          );
        })}

        {/* 6th Card Slot: Summary / System Health Status */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-block">
              Governance Health
            </span>
            <h3 className="text-sm font-bold text-white">CRO 3-Iteration Safeguard</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              All agent transitions pass through strict programmatic sector mapping checks and PII redaction filters before UI rendering.
            </p>
          </div>
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Security Status</span>
            <span className="text-emerald-400 font-bold">100% Guardrailed</span>
          </div>
        </div>
      </div>

    </div>
  );
}