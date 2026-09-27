import React, { useState } from 'react';
import Navbar from './components/Navbar';
import IntakeForm from './components/IntakeForm';
import RiskAssessmentView from './components/RiskAssessmentView';
import SectorAnalysisView from './components/SectorAnalysisView';
import PortfolioBucketView from './components/PortfolioBucketView';
import Chatbot from './components/Chatbot';
import Calculators from './components/Calculators';
import AgentBusyModal from './components/AgentBusyModal'; // <--- Rendered modal
import { 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  FileText, 
  ChevronRight, 
  Loader2, 
  Sparkles,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Investor Profile', sub: 'Input Parameters', icon: FileText },
  { id: 2, label: 'Risk Profiler Agent', sub: 'Tolerance & Scoring', icon: ShieldCheck },
  { id: 3, label: 'Stock Analyzer Agent', sub: 'NSE & yfinance Screen', icon: TrendingUp },
  { id: 4, label: 'Stock Bucket Agent', sub: 'Allocation & Weights', icon: PieChart },
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [activeModalInfo, setActiveModalInfo] = useState({
    agentName: '',
    taskDesc: '',
    stepIndex: 1
  });
  const [currentTab, setCurrentTab] = useState('portfolio');

  const [agentState, setAgentState] = useState({
    user_profile: {
      investor_name: 'Vinay Uniyal',
      age: 32,
      initial_investment: 500000,
      employment_stability: 'High',
      income_slab: '₹15L - ₹25L',
      primary_goal: 'Wealth Creation',
      investment_horizon: '5-7 Years',
      cagr_expectation: '14-16%',
    },
    risk_score: 0,
    risk_category: '',
    risk_analysis: '',
    selected_sectors: [],
    market_data: {},
    final_portfolio: {},
  });

  // Action 1: Run Risk Profiler Agent
  const handleIntakeSubmit = async (formData) => {
    setActiveModalInfo({
      agentName: 'Risk Profiler Agent',
      taskDesc: 'Evaluating investor risk profile & querying Hugging Face LLM...',
      stepIndex: 2
    });
    setLoadingAgent(true);

    const updatedState = { ...agentState, user_profile: formData };
    try {
      const res = await fetch('http://localhost:8000/api/agent/risk-profiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedState),
      });
      if (!res.ok) throw new Error(`Risk Profiler failed: ${res.status}`);
      const data = await res.json();
      setAgentState(data);
      setCurrentStep(2);
    } catch (err) {
      console.error('Risk Profiler Error:', err);
    } finally {
      setTimeout(() => setLoadingAgent(false), 500);
    }
  };

  // Action 2: Run Stock Analyzer Agent (yfinance)
  const handleRunStockAnalyzer = async () => {
    setActiveModalInfo({
      agentName: 'Stock Analyzer Agent',
      taskDesc: 'Fetching live NSE metrics, P/E, and Beta valuations via yfinance...',
      stepIndex: 3
    });
    setLoadingAgent(true);

    try {
      const res = await fetch('http://localhost:8000/api/agent/stock-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentState),
      });
      if (!res.ok) throw new Error(`Stock Analyzer failed: ${res.status}`);
      const data = await res.json();
      setAgentState(data);
      setCurrentStep(3);
    } catch (err) {
      console.error('Stock Analyzer Error:', err);
    } finally {
      setTimeout(() => setLoadingAgent(false), 500);
    }
  };

  // Action 3: Run Stock Bucket Agent
  const handleRunStockBucket = async () => {
    setActiveModalInfo({
      agentName: 'Stock Bucket Agent',
      taskDesc: 'Calculating lot allocations, target capital weights, and horizon strategy...',
      stepIndex: 4
    });
    setLoadingAgent(true);

    try {
      const res = await fetch('http://localhost:8000/api/agent/stock-bucket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentState),
      });
      if (!res.ok) throw new Error(`Stock Bucket failed: ${res.status}`);
      const data = await res.json();
      setAgentState(data);
      setCurrentStep(4);
    } catch (err) {
      console.error('Stock Bucket Error:', err);
    } finally {
      setTimeout(() => setLoadingAgent(false), 500);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setAgentState((prev) => ({
      ...prev,
      risk_score: 0,
      risk_category: '',
      risk_analysis: '',
      selected_sectors: [],
      market_data: {},
      final_portfolio: {},
    }));
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500/30 relative">
      
      {/* 1. Active Agent Busy Modal */}
      <AgentBusyModal 
        isOpen={loadingAgent}
        currentStepIndex={activeModalInfo.stepIndex}
        activeAgentName={activeModalInfo.agentName}
        activeTaskDescription={activeModalInfo.taskDesc}
      />

      {/* 2. Top Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-8 flex flex-col">
        {currentTab === 'portfolio' ? (
          <div className="flex-1 flex flex-col space-y-8">
            
            {/* Step Progress Header */}
            <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isCompleted = currentStep > step.id;
                  const isActive = currentStep === step.id;
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3.5 p-3.5 rounded-xl border transition-all duration-300 ${
                        isActive
                          ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5'
                          : isCompleted
                          ? 'bg-slate-900/40 border-slate-800/60 text-slate-300'
                          : 'bg-slate-950/20 border-slate-800/30 opacity-40'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : isCompleted
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                            Step 0{step.id}
                          </span>
                          {isActive && (
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                              Active
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-medium truncate ${isActive ? 'text-slate-100 font-semibold' : 'text-slate-300'}`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content Container */}
            <div className="flex-1 w-full bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative flex flex-col justify-between">
              
              {/* STEP 1: Intake Form */}
              {currentStep === 1 && (
                <div className="w-full max-w-4xl mx-auto py-4">
                  <IntakeForm
                    defaultData={agentState.user_profile}
                    onSubmit={handleIntakeSubmit}
                    isLoading={loadingAgent}
                  />
                </div>
              )}

              {/* STEP 2: Risk Profiler View */}
              {currentStep === 2 && (
                <div className="w-full space-y-8 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-emerald-400" />
                        Risk Profiler Agent Output
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Quantitative analysis synthesized with Meta-Llama-3.1-8B-Instruct
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-2 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reconfigure
                    </button>
                  </div>

                  <RiskAssessmentView
                    riskScore={agentState.risk_score}
                    riskCategory={agentState.risk_category}
                    riskAnalysis={agentState.risk_analysis}
                  />

                  <div className="pt-6 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={handleRunStockAnalyzer}
                      disabled={loadingAgent}
                      className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-xl shadow-indigo-600/30 flex items-center space-x-3 transition-all active:scale-[0.99] disabled:opacity-50"
                    >
                      <Sparkles className="w-5 h-5 text-indigo-200" />
                      <span>Trigger Stock Analyzer Agent</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Stock Analyzer View */}
              {currentStep === 3 && (
                <div className="w-full space-y-8 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                        <TrendingUp className="w-7 h-7 text-cyan-400" />
                        Stock Analyzer Agent Output
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Real-time NSE fundamentals retrieved via yfinance
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
                    >
                      Back to Risk
                    </button>
                  </div>

                  <SectorAnalysisView
                    sectors={agentState.selected_sectors}
                    marketData={agentState.market_data}
                  />

                  <div className="pt-6 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={handleRunStockBucket}
                      disabled={loadingAgent}
                      className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-xl shadow-indigo-600/30 flex items-center space-x-3 transition-all active:scale-[0.99] disabled:opacity-50"
                    >
                      <Sparkles className="w-5 h-5 text-indigo-200" />
                      <span>Trigger Stock Bucket Agent</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Portfolio Bucket View */}
              {currentStep === 4 && (
                <div className="w-full space-y-8 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                        <PieChart className="w-7 h-7 text-violet-400" />
                        Personalized Portfolio Bucket
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Optimal capital allocation based on quantitative risk constraints
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="px-5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs flex items-center gap-2 transition-colors font-medium"
                    >
                      <RotateCcw className="w-4 h-4" /> Start New Portfolio
                    </button>
                  </div>

                  <PortfolioBucketView portfolioData={agentState.final_portfolio} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <Calculators />
        )}
      </main>

      <Chatbot />
    </div>
  );
}

export default App;