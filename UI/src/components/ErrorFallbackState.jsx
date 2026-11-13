import React from 'react';
import { 
  AlertTriangle, RefreshCw, ArrowRight, Briefcase, BarChart2, 
  Bot, ShieldAlert, FileText, Cpu, PieChart, ShieldCheck, Sparkles 
} from 'lucide-react';

export default function ErrorFallbackState({ type = 'general', title, message, onRetry, setActiveNav }) {
  
  // Configure context-specific content and icons
  const getFallbackConfig = () => {
    switch (type) {
      case 'analytics':
        return {
          icon: BarChart2,
          badge: 'Telemetry Unavailable',
          defaultTitle: 'No Analytics Data Computed',
          defaultMsg: 'We could not calculate statistical breakdowns from MegaBull holdings. Ensure positions are active or sync telemetry again.',
          ctaText: 'Refresh Analytics',
          targetNav: 'analytics'
        };
      case 'assistant':
        return {
          icon: Bot,
          badge: 'Agent Offline',
          defaultTitle: 'ArthVeda Assistant Resting',
          defaultMsg: 'The multi-agent LangGraph supervisor failed to respond. Check your backend server connection or retry the query.',
          ctaText: 'Open Dashboard',
          targetNav: 'dashboard'
        };
      case 'rag':
        return {
          icon: FileText,
          badge: 'Vector Index Empty',
          defaultTitle: 'No Grounding Documents Found',
          defaultMsg: 'Pinecone RAG index returned zero matching source chunks for this query. Try rephrasing or check document uploads.',
          ctaText: 'View Guardrails',
          targetNav: 'solution_guardrails'
        };
      case 'pipeline':
        return {
          icon: Cpu,
          badge: 'Pipeline Suspended',
          defaultTitle: 'Agent Pipeline Inactive',
          defaultMsg: 'The multi-agent evaluation loop has not been triggered yet. Run a risk intake workflow to initialize agent telemetry.',
          ctaText: 'Start Workflow',
          targetNav: 'dashboard'
        };
      case 'healthcheck':
        return {
          icon: ShieldAlert,
          badge: 'System Degraded',
          defaultTitle: 'Microservice Connection Failure',
          defaultMsg: 'One or more external APIs (Supabase, MegaBull, or FastAPI) are unreachable or returning server errors.',
          ctaText: 'Run Diagnostics',
          targetNav: 'system_healthcheck'
        };
      default:
        return {
          icon: AlertTriangle,
          badge: 'Operational Notice',
          defaultTitle: title || 'Page Content Unavailable',
          defaultMsg: message || 'We encountered an unexpected state loading this view. Please retry or navigate back to the main dashboard.',
          ctaText: 'Return to Dashboard',
          targetNav: 'dashboard'
        };
    }
  };

  const config = getFallbackConfig();
  const Icon = config.icon;

  return (
    <div className="w-full py-16 px-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200">
      
      {/* Icon Badge */}
      <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      {/* Title & Description */}
      <div className="space-y-2 max-w-md mx-auto">
        <span className="text-[10px] font-mono tracking-widest uppercase text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          {config.badge}
        </span>
        <h2 className="text-xl font-extrabold text-slate-900">{config.defaultTitle}</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {config.defaultMsg}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
        <button
          onClick={() => setActiveNav && setActiveNav(config.targetNav)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <span>{config.ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>ArthVeda AI Institutional Wealth Management Suite</span>
      </div>

    </div>
  );
}