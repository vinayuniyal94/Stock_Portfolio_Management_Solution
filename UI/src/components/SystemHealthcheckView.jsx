import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000'
  : (process.env.REACT_APP_API_BASE_URL || 'https://arthveda-ai-backend.onrender.com');

export default function SystemHealthcheckView() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const runHealthcheck = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      const data = await res.json();
      if (res.ok) {
        setHealthData(data);
      } else {
        throw new Error('Failed to retrieve system health telemetry.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Connection refused to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runHealthcheck();
  }, []);

  const hasFailures = healthData && Object.values(healthData).some(s => s.status === 'failed' || s.status === 'degraded');

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Backend Telemetry & Diagnostics
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            System Healthcheck Monitor
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive backend health inspection covering FastAPI, Supabase, MegaBull, and Pinecone RAG.
          </p>
        </div>
        <button
          onClick={runHealthcheck}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Run Diagnostics</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      {/* Global Status Banner */}
      {!loading && healthData && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          hasFailures ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          {hasFailures ? <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
          <div className="text-xs font-medium">
            {hasFailures ? 'Warning: One or more backend microservices or external APIs are degraded or failing.' : 'All backend microservices, Supabase vaults, MegaBull APIs, and RAG pipelines are fully operational.'}
          </div>
        </div>
      )}

      {/* Service Cards Grid */}
      {healthData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(healthData).map(([key, service], idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{key.replace('_', ' ')}</h4>
                  <div>
                    {service.status === 'healthy' ? (
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> {service.status}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">{service.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}