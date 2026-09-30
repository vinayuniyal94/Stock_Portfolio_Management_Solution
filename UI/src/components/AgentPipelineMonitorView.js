import React from 'react';
import { Bot, Cpu, ShieldCheck, Activity, Database, CheckCircle2 } from 'lucide-react';

export default function AgentPipelineMonitorView() {
  const agents = [
    { name: 'Risk Profiler Agent', status: 'Healthy', latency: '142ms', endpoint: '/api/agent/risk-profiler', model: 'GPT-4o' },
    { name: 'Stock Analyzer Agent', status: 'Healthy', latency: '310ms', endpoint: '/api/agent/stock-analyzer', model: 'GPT-4o-mini' },
    { name: 'Stock Bucket Agent', status: 'Healthy', latency: '480ms', endpoint: '/api/agent/stock-bucket', model: 'GPT-4o' },
    { name: 'RAG Knowledge Assistant', status: 'Healthy', latency: '95ms', endpoint: '/api/chat', model: 'Llama-3 / Pinecone' }
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          LangGraph Health Monitor
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Agent Pipeline Monitor</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent, idx) => (
          <div key={idx} className="enterprise-card p-6 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-600" /> {agent.name}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {agent.status}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 space-y-1 pt-2 border-t border-slate-100">
              <div className="flex justify-between"><span>Endpoint:</span> <span className="text-slate-800">{agent.endpoint}</span></div>
              <div className="flex justify-between"><span>Model:</span> <span className="text-slate-800">{agent.model}</span></div>
              <div className="flex justify-between"><span>Avg Latency:</span> <span className="text-emerald-700 font-bold">{agent.latency}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}