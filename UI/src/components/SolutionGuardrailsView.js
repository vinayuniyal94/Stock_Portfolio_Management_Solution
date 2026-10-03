import React from 'react';
import { ShieldAlert, Lock, CheckCircle2, Cpu, FileText, Database, ShieldCheck } from 'lucide-react';

export default function SolutionGuardrailsView() {
  const guardrailLayers = [
    {
      title: 'PII Redaction & Privacy Shield',
      category: 'Data Protection',
      status: 'Active',
      description: 'Automatically scans and redacts sensitive user information before payloads reach LLM endpoints or vector stores.',
      rules: [
        'Email Address Masking (e.g. [REDACTED_EMAIL])',
        'Indian Phone Number Scrubbing (e.g. [REDACTED_PHONE])',
        'PAN Card & Aadhaar Number Redaction',
        'Credit Card & Financial Identifier Protection'
      ]
    },
    {
      title: 'Prompt Injection & Jailbreak Defense',
      category: 'Agentic Security',
      status: 'Active',
      description: 'Inspects all user prompts and API payloads against known conversational attack vectors and model override commands.',
      rules: [
        'Blocks "Ignore previous instructions" directives',
        'Prevents "Developer mode" or "DAN" jailbreak attempts',
        'Blocks system prompt extraction and internal instruction leaks',
        'Payload token length restriction (Max 5,000 characters)'
      ]
    },
    {
      title: 'SEBI Fiduciary & Compliance Guardrails',
      category: 'Regulatory Compliance',
      status: 'Active',
      description: 'Enforces strict financial advisory boundaries across all multi-agent steps (Risk Profiler, Stock Analyzer, Stock Bucket).',
      rules: [
        'Strict prohibition against direct pump-and-dump stock tips',
        'Mandatory risk calibration rationale for all asset buckets',
        'Benchmarking against Nifty 50 and Nifty Next 50 indexes',
        'Transparent fee and historical Sharpe/Sortino ratio reporting'
      ]
    },
    {
      title: 'Supabase Row Level Security (RLS)',
      category: 'Database & Session Security',
      status: 'Active',
      description: 'Secures user portfolios and authentication state using PostgreSQL Row Level Security policies.',
      rules: [
        'User-isolated portfolio persistence linked via UUID (`user_id`)',
        'Encrypted session storage and secure password hashing',
        'Strict CORS and API header validations'
      ]
    }
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Enterprise Security Architecture
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Lock className="w-6 h-6 text-emerald-600" /> Solution Guardrails & Security Suite
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Platform-wide defense mechanisms safeguarding PII, preventing agentic prompt injections, and enforcing SEBI compliance.
          </p>
        </div>
      </div>

      {/* Grid of Security Layers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guardrailLayers.map((layer, idx) => (
          <div key={idx} className="enterprise-card p-6 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {layer.category}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {layer.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{layer.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {layer.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Enforced Rules:</span>
              <ul className="space-y-1.5">
                {layer.rules.map((rule, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Security Footer Callout */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-2 shadow-xl border border-slate-800 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4" /> Zero-Trust Multi-Agent Pipeline
          </div>
          <p className="text-xs text-slate-400">
            Every query, agent state transition, and vector search is sanitized through `guardrails.py` before model execution.
          </p>
        </div>
      </div>

    </div>
  );
}