import React from 'react';
import { BarChart3, Zap, Cpu, Database, Hash } from 'lucide-react';

export default function PlatformAnalyticsView() {
  const telemetryLogs = [
    { timestamp: '15:24:12', user: 'vinay_uniyal', action: 'Stock Bucket Generation', llm: 'gpt-4o', inputTok: 420, outTok: 310, latency: '480ms' },
    { timestamp: '15:22:05', user: 'guest_user', action: 'RAG Knowledge Query', llm: 'gpt-4o-mini', inputTok: 112, outTok: 85, latency: '190ms' },
    { timestamp: '15:18:40', user: 'vinay_uniyal', action: 'Risk Profiler Evaluation', llm: 'gpt-4o', inputTok: 250, outTok: 140, latency: '320ms' },
    { timestamp: '15:10:15', user: 'guest_user', action: 'Stock Analyzer Scan', llm: 'gpt-4o-mini', inputTok: 310, outTok: 215, latency: '290ms' }
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          Telemetry & Token Accounting
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Platform Analytics & Logs</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="enterprise-card p-5 bg-white rounded-3xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Tokens Consumed</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700">18,420</div>
          <span className="text-[10px] text-slate-500">Across all active LLM calls</span>
        </div>
        <div className="enterprise-card p-5 bg-white rounded-3xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Avg Execution Latency</span>
          <div className="text-2xl font-extrabold font-mono text-slate-900">320ms</div>
          <span className="text-[10px] text-slate-500">Optimized via prompt caching</span>
        </div>
        <div className="enterprise-card p-5 bg-white rounded-3xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">Database Sync Status</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700">100%</div>
          <span className="text-[10px] text-slate-500">Supabase PostgreSQL connected</span>
        </div>
      </div>

      <div className="enterprise-card p-6 bg-white rounded-3xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Recent Request Telemetry Logs</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Action / Endpoint</th>
                <th className="p-3.5">LLM Model</th>
                <th className="p-3.5 text-right">Tokens (In/Out)</th>
                <th className="p-3.5 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {telemetryLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3.5 text-slate-400">{log.timestamp}</td>
                  <td className="p-3.5 font-bold text-slate-800">@{log.user}</td>
                  <td className="p-3.5 text-slate-700">{log.action}</td>
                  <td className="p-3.5 text-emerald-700">{log.llm}</td>
                  <td className="p-3.5 text-right text-slate-600">{log.inputTok} / {log.outTok}</td>
                  <td className="p-3.5 text-right font-bold text-slate-900">{log.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}