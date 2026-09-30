import React, { useState } from 'react';
import { Puzzle, Terminal, Copy, Check, ShieldCheck, Cpu, Database } from 'lucide-react';

export default function McpIntegrationView() {
  const [copied, setCopied] = useState(false);

  const mcpConfigCode = `{
  "mcpServers": {
    "arthveda-wealth": {
      "command": "python",
      "args": ["-m", "server"],
      "env": {
        "SUPABASE_URL": "https://ivlrzhllmdhrffbaekfl.supabase.co",
        "SUPABASE_KEY": "sb_publishable_nbxw94AF..."
      }
    }
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mcpConfigCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto enterprise-card rounded-3xl p-6 sm:p-8 space-y-6 bg-white shadow-sm border border-slate-200 animate-in fade-in duration-200">
      
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Model Context Protocol (MCP)
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-emerald-600" />
            MCP Integration & Agent Tools
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            Expose ArthVeda stock analysis and risk profiling agents directly to Claude Desktop or MCP clients.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <Cpu className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-xs">Multi-Agent Protocol</h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Exposes LangGraph orchestration tools for risk assessment and stock bucketing.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <Database className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-xs">Supabase RLS Synced</h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Securely persist and query user portfolios directly via authenticated MCP endpoints.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-xs">SEBI Guardrails</h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Fiduciary compliance checks embedded into every MCP tool invocation.
          </p>
        </div>
      </div>

      {/* Integration Code Snippet */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" /> Claude Desktop `claude_desktop_config.json` Setup
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-medium transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Config!' : 'Copy Config'}</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
          <pre>{mcpConfigCode}</pre>
        </div>
      </div>

    </div>
  );
}