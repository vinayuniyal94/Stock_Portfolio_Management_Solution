import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AgentWorkflowView from './components/AgentWorkflowView';
import ChatbotView from './components/ChatbotView';
import SolutionGuardrailsView from './components/SolutionGuardrailsView';
import Calculators from './components/Calculators';
import MySavedPortfolioView from './components/MySavedPortfolioView';
import PortfolioAnalyticsView from './components/PortfolioAnalyticsView';
import DocumentGroundingRagView from './components/DocumentGroundingRagView';
import AgentPipelineMonitorView from './components/AgentPipelineMonitorView';
import PlatformAnalyticsView from './components/PlatformAnalyticsView';
import McpIntegrationView from './components/McpIntegrationView';
import UserProfileModal from './components/UserProfileModal';

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // Controls sidebar expand/collapse state

  // Check for active session / stored user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('arthveda_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse stored user session", e);
      }
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('arthveda_user', JSON.stringify(user));
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('arthveda_user');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Enterprise Locked Sidebar with Dynamic Toggle */}
      <Sidebar 
        activeNav={activeNav} 
        setActiveNav={setActiveNav} 
        currentUser={currentUser} 
        onOpenAuth={() => setIsAuthOpen(true)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area - Dynamically adjusts margin based on sidebar open/closed state */}
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-80'} min-h-screen p-6 sm:p-10 overflow-x-hidden`}>
        
        {/* Render Active View Based on Sidebar Navigation State */}
        {activeNav === 'dashboard' && <AgentWorkflowView currentUser={currentUser} setActiveNav={setActiveNav} />}
        {activeNav === 'assistant' && <ChatbotView currentUser={currentUser} />}
        {activeNav === 'solution_guardrails' && <SolutionGuardrailsView />}
        {activeNav === 'calculator' && <Calculators />}
        {activeNav === 'portfolio' && <MySavedPortfolioView currentUser={currentUser} />}
        {activeNav === 'analytics' && <PortfolioAnalyticsView currentUser={currentUser} />}
        {activeNav === 'rag' && <DocumentGroundingRagView currentUser={currentUser} />}
        {activeNav === 'pipeline' && <AgentPipelineMonitorView />}
        {activeNav === 'platform_analytics' && <PlatformAnalyticsView currentUser={currentUser} />}
        {activeNav === 'mcp' && <McpIntegrationView />}

      </main>

      {/* Authentication / Login Modal */}
      {isAuthOpen && (
        <UserProfileModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onSuccess={handleLoginSuccess} 
        />
      )}

    </div>
  );
}