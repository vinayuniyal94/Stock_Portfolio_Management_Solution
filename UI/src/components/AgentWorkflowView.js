import React, { useState } from 'react';
import IntakeForm from './IntakeForm';
import RiskAssessmentView from './RiskAssessmentView';
import SectorAnalysisView from './SectorAnalysisView';
import PortfolioBucketView from './PortfolioBucketView';
import AgentBusyModal from './AgentBusyModal';
import { Sparkles, CheckCircle2, UserCheck, ShieldCheck, Compass, TrendingUp } from 'lucide-react';

export default function AgentWorkflowView({ currentUser, setActiveNav }) {
  const [currentStep, setWorkflowStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');

  // 1. User Profile State (Step 1)
  const [userProfile, setUserProfile] = useState({
    investor_name: currentUser?.username || currentUser?.email?.split('@')[0] || 'Vinay Uniyal',
    age: 28,
    income_slab: '₹15L - ₹25L',
    employment_stability: 'High (Salaried / MNC / Govt)',
    primary_goal: 'Wealth Creation & Compounding',
    investment_horizon: '5-7 Years',
    cagr_expectation: '14-16% (Nifty Alpha)',
    initial_investment: 500000,
    stated_risk_appetite: 'Moderate (Balanced Core-Satellite)',
    market_experience: 'Intermediate (1-3 Years)'
  });

  // 2. Risk Profiler Agent State (Step 2)
  const [riskState, setRiskState] = useState({
    risk_score: 65,
    risk_category: 'Moderate-Aggressive',
    risk_analysis: 'Balanced equity growth capacity backed by steady salaried stability and 5-7 year horizon.'
  });

  // 3. Stock Analyzer Agent State (Step 3)
  const [analyzerState, setAnalyzerState] = useState({
    selected_sectors: ['Private Sector Banking', 'IT Services & Software', 'Infrastructure & Capital Goods'],
    sector_rationales: {
      'Private Sector Banking': 'Strong credit growth and robust CASA ratios driving structural compounding.',
      'IT Services & Software': 'Global digital transformation demand and high free cash flow generation.',
      'Infrastructure & Capital Goods': 'Government capital expenditure push and domestic manufacturing tailwinds.'
    },
    market_data: {
      'Private Sector Banking': [
        { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', current_price: 1650, pe_ratio: 18.5, dividend_yield: 1.2, beta: 0.95 },
        { ticker: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', current_price: 1080, pe_ratio: 17.2, dividend_yield: 0.9, beta: 1.05 }
      ],
      'IT Services & Software': [
        { ticker: 'TCS.NS', name: 'Tata Consultancy Services', current_price: 3900, pe_ratio: 28.4, dividend_yield: 1.5, beta: 0.75 },
        { ticker: 'INFY.NS', name: 'Infosys Ltd', current_price: 1550, pe_ratio: 23.1, dividend_yield: 2.1, beta: 0.88 }
      ],
      'Infrastructure & Capital Goods': [
        { ticker: 'LT.NS', name: 'Larsen & Toubro Ltd', current_price: 3500, pe_ratio: 32.0, dividend_yield: 1.0, beta: 1.12 }
      ]
    }
  });

  // 4. Portfolio Bucket Agent State (Step 4)
  const [portfolioData, setPortfolioData] = useState(null);

  // Trigger Backend API for Step 1 -> Step 2 (Risk Profiler)
  const handleProceedToRisk = async () => {
    setIsProcessing(true);
    setLoadingStepText('Risk Profiler Agent computing behavioral risk capacity & score...');
    
    try {
      const response = await fetch('http://localhost:8000/api/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'risk_profiler', user_profile: userProfile })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.risk_score) {
          setRiskState({
            risk_score: data.risk_score,
            risk_category: data.risk_category || 'Moderate',
            risk_analysis: data.risk_analysis || data.summary
          });
        }
      }
    } catch (err) {
      console.log('Backend offline, using fallback risk profile simulation.', err);
    } finally {
      setIsProcessing(false);
      setWorkflowStep(2);
    }
  };

  // Trigger Backend API for Step 2 -> Step 3 (Stock Analyzer)
  const handleProceedToAnalyzer = async () => {
    setIsProcessing(true);
    setLoadingStepText('Stock Analyzer Agent scanning live macroeconomic sectors & equities...');

    try {
      const response = await fetch('http://localhost:8000/api/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          step: 'stock_analyzer', 
          user_profile: userProfile, 
          risk_score: riskState.risk_score 
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.selected_sectors) {
          setAnalyzerState({
            selected_sectors: data.selected_sectors,
            sector_rationales: data.sector_rationales || {},
            market_data: data.market_data || {}
          });
        }
      }
    } catch (err) {
      console.log('Backend offline, using fallback sector analysis.', err);
    } finally {
      setIsProcessing(false);
      setWorkflowStep(3);
    }
  };

  // Trigger Backend API for Step 3 -> Step 4 (Stock Bucket & CRO Audit)
  const handleProceedToBucket = async () => {
    setIsProcessing(true);
    setLoadingStepText('Stock Bucket & Chief Risk Officer (CRO) Agent auditing portfolio guardrails...');

    try {
      const response = await fetch('http://localhost:8000/api/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          step: 'stock_bucket', 
          user_profile: userProfile, 
          risk_score: riskState.risk_score,
          selected_sectors: analyzerState.selected_sectors,
          market_data: analyzerState.market_data
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPortfolioData(data);
      }
    } catch (err) {
      console.log('Backend offline, generating simulated portfolio bucket.', err);
      setPortfolioData({
        initial_investment: userProfile.initial_investment,
        target_cagr: userProfile.cagr_expectation,
        bucket_archetype: userProfile.primary_goal,
        portfolio: [
          { id: 1, name: 'HDFC Bank Ltd', ticker: 'HDFCBANK.NS', sector: 'Private Sector Banking', current_price: 1650, units: 60, allocated_amount: 99000, allocation_percentage: 20, beta: 0.95 },
          { id: 2, name: 'ICICI Bank Ltd', ticker: 'ICICIBANK.NS', sector: 'Private Sector Banking', current_price: 1080, units: 80, allocated_amount: 86400, allocation_percentage: 17, beta: 1.05 },
          { id: 3, name: 'Tata Consultancy Services', ticker: 'TCS.NS', sector: 'IT Services & Software', current_price: 3900, units: 25, allocated_amount: 97500, allocation_percentage: 19, beta: 0.75 },
          { id: 4, name: 'Infosys Ltd', ticker: 'INFY.NS', sector: 'IT Services & Software', current_price: 1550, units: 50, allocated_amount: 77500, allocation_percentage: 15, beta: 0.88 },
          { id: 5, name: 'Larsen & Toubro Ltd', ticker: 'LT.NS', sector: 'Infrastructure & Capital Goods', current_price: 3500, units: 40, allocated_amount: 140000, allocation_percentage: 29, beta: 1.12 }
        ],
        portfolio_thesis: "The portfolio is structured around high-conviction compounding pillars. Private banking giants provide steady credit growth, IT leaders ensure high free cash flow resilience, and infrastructure capital expenditure captures domestic industrial tailwinds."
      });
    } finally {
      setIsProcessing(false);
      setWorkflowStep(4);
    }
  };

  const stepsList = [
    { num: 1, label: 'Profile Setup', icon: UserCheck },
    { num: 2, label: 'Risk Analysis', icon: ShieldCheck },
    { num: 3, label: 'Sector Discovery', icon: Compass },
    { num: 4, label: 'Portfolio Bucket', icon: TrendingUp }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Interactive Agent Activity Modal */}
      {isProcessing && <AgentBusyModal message={loadingStepText} />}

      {/* 1. Separated Top Header Section */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Wealth Management Workflow</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {currentStep === 1 && 'Investor Profile & Capital Setup'}
            {currentStep === 2 && 'Behavioral Risk Tolerance & Capacity Analysis'}
            {currentStep === 3 && 'Macroeconomic Sector Identification & Drill-Down'}
            {currentStep === 4 && 'Optimized Stock Bucket & Compliance Audit'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentStep === 1 && 'Define your investment goals, time horizon, and capital parameters.'}
            {currentStep === 2 && 'Multi-agent analysis calculating your personalized risk score and allocation limits.'}
            {currentStep === 3 && 'Scanning top-performing market sectors and equity fundamentals.'}
            {currentStep === 4 && 'Final portfolio basket audited by Chief Risk Officer (CRO) agents.'}
          </p>
        </div>

        <div className="text-right hidden md:block font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Progress Status</span>
          <span className="text-sm font-bold text-emerald-700">Step 0{currentStep} / 04</span>
        </div>
      </div>

      {/* 2. Separate Minimal & Interactive Step Indicator Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stepsList.map((s) => {
          const StepIcon = s.icon;
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;

          return (
            <div
              key={s.num}
              onClick={() => isDone && setWorkflowStep(s.num)}
              className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-4 ring-emerald-50'
                  : isDone
                  ? 'bg-emerald-50/70 text-emerald-800 border-emerald-200 cursor-pointer hover:bg-emerald-100/70'
                  : 'bg-white text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isActive ? 'bg-white/20 text-white' : isDone ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-400'
              }`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider block opacity-80">
                  Step 0{s.num}
                </span>
                <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : isDone ? 'text-slate-900' : 'text-slate-500'}`}>
                  {s.label}
                </h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Step View Render Switch */}
      <div className="transition-all duration-200 pt-2">
        {currentStep === 1 && (
          <IntakeForm 
            userProfile={userProfile} 
            setUserProfile={setUserProfile} 
            onProceed={handleProceedToRisk} 
          />
        )}
        {currentStep === 2 && (
          <RiskAssessmentView 
            riskState={riskState} 
            userProfile={userProfile} 
            onBack={() => setWorkflowStep(1)} 
            onProceed={handleProceedToAnalyzer} 
          />
        )}
        {currentStep === 3 && (
          <SectorAnalysisView 
            analyzerState={analyzerState} 
            onBack={() => setWorkflowStep(2)} 
            onProceed={handleProceedToBucket} 
          />
        )}
        {currentStep === 4 && (
          <PortfolioBucketView 
            portfolioData={portfolioData} 
            currentUser={currentUser}
            onOpenRegister={() => setActiveNav('portfolio')}
            onBack={() => setWorkflowStep(3)} 
            onReset={() => setWorkflowStep(1)} 
          />
        )}
      </div>

    </div>
  );
}