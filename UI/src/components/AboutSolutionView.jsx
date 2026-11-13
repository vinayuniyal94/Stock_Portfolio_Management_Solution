import React from 'react';
import { ShieldCheck, Cpu, Database, Network, Bot, Layers, CheckCircle2 } from 'lucide-react';

export default function AboutSolutionView() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          ArthVeda AI Platform Architecture
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Multiagentic Indian Wealth Management Solution
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          ArthVeda AI is an institutional-grade, multi-agent stock portfolio management platform engineered specifically for the Indian equity markets (NSE/BSE). It combines autonomous LangGraph agents, real-time market discovery, Pinecone-grounded RAG, and live paper-trading execution.
        </p>
      </div>

      {/* Core Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Agentic Pipeline */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Multi-Agent LangGraph Workflow</h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
              <span><strong>Risk Profiler Agent:</strong> Evaluates investor profile, income stability, and time horizon to compute behavioral risk capacity (0-100).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
              <span><strong>Stock Analyzer Agent:</strong> Dynamically discovers macro sectors and filters candidate equities with zero cross-contamination.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
              <span><strong>Stock Bucket Agent:</strong> Evaluates P/E ratios, betas, and dividend yields to formulate risk-adjusted portfolio sizing.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
              <span><strong>CRO Critique Agent:</strong> Acts as Master Auditor enforcing 3-iteration feedback loops and SEBI compliance guardrails.</span>
            </li>
          </ul>
        </div>

        {/* Integrations & Tech Stack */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <Network className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Enterprise Integrations & Security</h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
              <span><strong>MegaBull Integration:</strong> Full paper-trading gateway executing live orders, holdings telemetry, and positions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
              <span><strong>Supabase Auth & DB:</strong> Secure user registration, session persistence, and investor profile telemetry.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
              <span><strong>Pinecone RAG Grounding:</strong> Vector database retrieval for institutional stock market mentoring and FAQ assistance.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
              <span><strong>FastAPI & React:</strong> High-performance async backend coupled with a responsive Tailwind CSS and Recharts UI.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}