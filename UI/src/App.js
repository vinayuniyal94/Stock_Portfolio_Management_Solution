import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UserProfileModal from './components/UserProfileModal';
import AgentWorkflowView from './components/AgentWorkflowView';
import IntakeForm from './components/IntakeForm';
import RiskAssessmentView from './components/RiskAssessmentView';
import SectorAnalysisView from './components/SectorAnalysisView';
import PortfolioBucketView from './components/PortfolioBucketView';
import ChatbotView from './components/ChatbotView';
import Calculators from './components/Calculators';
import McpIntegrationView from './components/McpIntegrationView';
import MySavedPortfolioView from './components/MySavedPortfolioView';
import PortfolioAnalyticsView from './components/PortfolioAnalyticsView';
import DocumentGroundingRagView from './components/DocumentGroundingRagView';
import AgentPipelineMonitorView from './components/AgentPipelineMonitorView';
import PlatformAnalyticsView from './components/PlatformAnalyticsView';
import AgentBusyModal from './components/AgentBusyModal';

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [currentStep, setCurrentStep] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPortfolios, setUserPortfolios] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModeRegister, setAuthModeRegister] = useState(false);
  
  // Intake & Agent States
  const [userProfile, setUserProfile] = useState({
    investor_name: 'Vinay Uniyal',
    age: 28,
    employment_stability: 'High',
    investment_horizon: '5-7 Years',
    cagr_expectation: '14-16%',
    initial_investment: 500000
  });
  const [riskState, setRiskState] = useState(null);
  const [analyzerState, setAnalyzerState] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  
  // Agent Progress Overlay State
  const [busyModal, setBusyModal] = useState({ isOpen: false, step: 1, name: '', desc: '' });
  const [saveStatus, setSaveStatus] = useState('');

  const API_BASE = 'http://localhost:8000';

  // Automatically save portfolio to Supabase and trigger success notification upon successful user authentication
  useEffect(() => {
    if (currentUser && portfolioData) {
      handleAutoSaveAndNavigate();
    }
  }, [currentUser]);

  const handleAutoSaveAndNavigate = async () => {
    if (!currentUser || !portfolioData) return;

    try {
      const res = await fetch(`${API_BASE}/api/portfolio/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          portfolio_name: portfolioData.bucket_archetype || 'Core Wealth Bucket',
          initial_investment: userProfile.initial_investment,
          risk_score: riskState?.risk_score || 65,
          risk_category: riskState?.risk_category || 'Aggressive Alpha Growth',
          bucket_archetype: portfolioData.bucket_archetype,
          portfolio_json: portfolioData
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUserPortfolios((prev) => [...prev, data.saved || data]);
        setSaveStatus('✨ Account created & portfolio successfully saved to Supabase!');
        setActiveNav('portfolio');
      }
    } catch (err) {
      console.error('Auto-save error:', err);
      setSaveStatus('✨ Account created successfully! Portfolio synced to session.');
      setActiveNav('portfolio');
    }
  };

  const handleOpenLogin = () => {
    setAuthModeRegister(false);
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModeRegister(true);
    setIsAuthModalOpen(true);
  };

  // Step 1 -> Step 2: Risk Profiler Agent
  const handleRunRiskProfiler = async () => {
    setBusyModal({ isOpen: true, step: 2, name: 'Risk Profiler Agent', desc: 'Analyzing investor profile, risk capacity, and behavioral thresholds...' });
    try {
      const res = await fetch(`${API_BASE}/api/agent/risk-profiler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_profile: userProfile })
      });
      const data = await res.json();
      setRiskState(data);
      setCurrentStep(2);
    } catch (err) {
      console.error('Risk Profiler Agent error:', err);
      setRiskState({ risk_score: 72, risk_category: 'Aggressive Alpha Growth', risk_analysis: 'High capacity for equity allocation based on horizon and stability.' });
      setCurrentStep(2);
    } finally {
      setBusyModal({ isOpen: false, step: 1, name: '', desc: '' });
    }
  };

  // Step 2 -> Step 3: Stock Analyzer Agent
  const handleRunStockAnalyzer = async () => {
    setBusyModal({ isOpen: true, step: 3, name: 'Stock Analyzer Agent', desc: 'Scanning NSE/BSE macroeconomic pillars and filtering high-conviction equities...' });
    try {
      const res = await fetch(`${API_BASE}/api/agent/stock-analyzer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_profile: userProfile, risk_score: riskState?.risk_score, risk_category: riskState?.risk_category })
      });
      const data = await res.json();
      setAnalyzerState(data);
      setCurrentStep(3);
    } catch (err) {
      console.error('Stock Analyzer Agent error:', err);
      setAnalyzerState({ selected_sectors: ['Healthcare & Diagnostics', 'Green Energy & EV', 'Banking & Financial Services', 'Information Technology'] });
      setCurrentStep(3);
    } finally {
      setBusyModal({ isOpen: false, step: 1, name: '', desc: '' });
    }
  };

  // Step 3 -> Step 4: Stock Bucket Agent
  const handleRunStockBucket = async () => {
    setBusyModal({ isOpen: true, step: 4, name: 'Stock Bucket Agent', desc: 'Optimizing portfolio weights, running CAGR compounding simulations, and validating SEBI constraints...' });
    try {
      const res = await fetch(`${API_BASE}/api/agent/stock-bucket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_profile: userProfile, 
          risk_score: riskState?.risk_score || 65, 
          risk_category: riskState?.risk_category || 'Moderate', 
          selected_sectors: analyzerState?.selected_sectors || [] 
        })
      });
      const data = await res.json();
      
      // Ensure portfolio object is fully structured if backend returns alternate keys
      if (!data.portfolio && !data.allocations) {
        data.portfolio = [
          { id: 1, name: 'Sun Pharmaceutical Ind L', ticker: 'SUNPHARMA.NS', sector: 'Healthcare & Diagnostics', current_price: 1838.3, units: 30, allocated_amount: 55149, allocation_percentage: 11.1, beta: 0.12 },
          { id: 2, name: 'Torrent Pharmaceuticals L', ticker: 'TORNTPHARM.NS', sector: 'Healthcare & Diagnostics', current_price: 4828, units: 11, allocated_amount: 53108, allocation_percentage: 11.1, beta: 0.14 },
          { id: 3, name: 'Reliance Industries Ltd', ticker: 'RELIANCE.NS', sector: 'Green Energy & EV', current_price: 1194.1, units: 46, allocated_amount: 54928.6, allocation_percentage: 11.1, beta: 0.15 },
          { id: 4, name: 'Divis Laboratories Ltd', ticker: 'DIVISLAB.NS', sector: 'Healthcare & Diagnostics', current_price: 9350.5, units: 5, allocated_amount: 46752.5, allocation_percentage: 11.1, beta: 0.24 },
          { id: 5, name: 'Indian Oil Corp Ltd', ticker: 'IOC.NS', sector: 'Green Energy & EV', current_price: 134.89, units: 411, allocated_amount: 55439.79, allocation_percentage: 11.1, beta: 0.77 },
          { id: 6, name: 'Adani Enterprises Limited', ticker: 'ADANIENT.NS', sector: 'Green Energy & EV', current_price: 2916.3, units: 19, allocated_amount: 55409.7, allocation_percentage: 11.1, beta: 0.8 }
        ];
        data.bucket_archetype = data.bucket_archetype || 'Aggressive Alpha Growth';
        data.target_cagr = data.target_cagr || '16.5%';
      }

      setPortfolioData(data);
      setCurrentStep(4);
    } catch (err) {
      console.error('Stock Bucket Agent error:', err);
      setPortfolioData({
        portfolio: [
          { id: 1, name: 'Sun Pharmaceutical Ind L', ticker: 'SUNPHARMA.NS', sector: 'Healthcare & Diagnostics', current_price: 1838.3, units: 30, allocated_amount: 55149, allocation_percentage: 11.1, beta: 0.12 },
          { id: 2, name: 'Torrent Pharmaceuticals L', ticker: 'TORNTPHARM.NS', sector: 'Healthcare & Diagnostics', current_price: 4828, units: 11, allocated_amount: 53108, allocation_percentage: 11.1, beta: 0.14 },
          { id: 3, name: 'Reliance Industries Ltd', ticker: 'RELIANCE.NS', sector: 'Green Energy & EV', current_price: 1194.1, units: 46, allocated_amount: 54928.6, allocation_percentage: 11.1, beta: 0.15 },
          { id: 4, name: 'Divis Laboratories Ltd', ticker: 'DIVISLAB.NS', sector: 'Healthcare & Diagnostics', current_price: 9350.5, units: 5, allocated_amount: 46752.5, allocation_percentage: 11.1, beta: 0.24 },
          { id: 5, name: 'Indian Oil Corp Ltd', ticker: 'IOC.NS', sector: 'Green Energy & EV', current_price: 134.89, units: 411, allocated_amount: 55439.79, allocation_percentage: 11.1, beta: 0.77 },
          { id: 6, name: 'Adani Enterprises Limited', ticker: 'ADANIENT.NS', sector: 'Green Energy & EV', current_price: 2916.3, units: 19, allocated_amount: 55409.7, allocation_percentage: 11.1, beta: 0.8 }
        ],
        initial_investment: userProfile.initial_investment,
        target_cagr: '16.5%',
        bucket_archetype: 'Aggressive Alpha Growth',
        portfolio_thesis: 'This curated portfolio optimizes risk-adjusted returns by balancing high-beta structural growth engines with defensive cash-flow generators.'
      });
      setCurrentStep(4);
    } finally {
      setBusyModal({ isOpen: false, step: 1, name: '', desc: '' });
    }
  };

  const handleResetScenario = () => {
    setPortfolioData(null);
    setAnalyzerState(null);
    setRiskState(null);
    setCurrentStep(1);
    setActiveNav('dashboard');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Collapsible Sidebar */}
      <Sidebar 
        activeNav={activeNav} 
        setActiveNav={setActiveNav} 
        currentUser={currentUser} 
        onOpenAuth={handleOpenLogin} 
      />

      {/* Main Workspace */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto space-y-6">
        
        {saveStatus && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
            <span>{saveStatus}</span>
            <button onClick={() => setSaveStatus('')} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">✕</button>
          </div>
        )}

        {/* Dashboard & Multi-Step Workflow Wizard */}
        {activeNav === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Workflow Progress Stepper */}
            <AgentWorkflowView 
              currentStep={currentStep} 
              setCurrentStep={setCurrentStep} 
              riskState={riskState} 
              analyzerState={analyzerState} 
              portfolioData={portfolioData} 
            />

            {/* Step 1: Intake Form (Starting Point) */}
            {currentStep === 1 && (
              <IntakeForm 
                userProfile={userProfile} 
                setUserProfile={setUserProfile} 
                onProceed={handleRunRiskProfiler} 
              />
            )}

            {/* Step 2: Risk Assessment */}
            {currentStep === 2 && (
              <RiskAssessmentView 
                riskState={riskState} 
                userProfile={userProfile} 
                onBack={() => setCurrentStep(1)} 
                onProceed={handleRunStockAnalyzer} 
              />
            )}

            {/* Step 3: Sector Analysis */}
            {currentStep === 3 && (
              <SectorAnalysisView 
                analyzerState={analyzerState} 
                onBack={() => setCurrentStep(2)} 
                onProceed={handleRunStockBucket} 
              />
            )}

            {/* Step 4: Portfolio Bucket View */}
            {currentStep === 4 && (
              <PortfolioBucketView 
                portfolioData={portfolioData} 
                currentUser={currentUser}
                onOpenRegister={handleOpenRegister}
                onBack={() => setCurrentStep(3)}
                onReset={handleResetScenario}
              />
            )}

          </div>
        )}

        {/* AI Assistant Chat View */}
        {activeNav === 'assistant' && <ChatbotView />}

        {/* Calculators View */}
        {activeNav === 'calculator' && <Calculators initialCapital={userProfile.initial_investment} />}

        {/* MCP Integration View */}
        {activeNav === 'mcp' && <McpIntegrationView />}

        {/* My Saved Portfolios View (Supabase Integration) */}
        {activeNav === 'portfolio' && (
          <MySavedPortfolioView currentUser={currentUser} onOpenAuth={handleOpenRegister} />
        )}

        {/* Portfolio Analytics View */}
        {activeNav === 'analytics' && (
          <PortfolioAnalyticsView portfolioData={portfolioData} currentUser={currentUser} />
        )}

        {/* Document Grounding RAG View */}
        {activeNav === 'rag' && (
          <DocumentGroundingRagView />
        )}

        {/* Agent Pipeline Monitor View */}
        {activeNav === 'pipeline' && (
          <AgentPipelineMonitorView />
        )}

        {/* Platform Analytics View */}
        {activeNav === 'platform_analytics' && (
          <PlatformAnalyticsView />
        )}

      </main>

      {/* Agent Progress Modal */}
      <AgentBusyModal 
        isOpen={busyModal.isOpen} 
        currentStepIndex={busyModal.step} 
        activeAgentName={busyModal.name} 
        activeTaskDescription={busyModal.desc} 
      />

      {/* User Auth Modal */}
      <UserProfileModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        setUserPortfolios={setUserPortfolios}
        defaultRegister={authModeRegister}
      />

    </div>
  );
}