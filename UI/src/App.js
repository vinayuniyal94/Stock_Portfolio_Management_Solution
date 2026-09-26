import React, { useState } from "react";
import Navbar from "./components/Navbar";
import IntakeForm from "./components/IntakeForm";
import RiskAssessmentView from "./components/RiskAssessmentView";
import SectorAnalysisView from "./components/SectorAnalysisView";
import PortfolioBucketView from "./components/PortfolioBucketView";
import Calculators from "./components/Calculators";
import Chatbot from "./components/Chatbot";
import { Check } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("onboarding");
  const [agentStep, setAgentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agentData, setAgentData] = useState({
    user_profile: null,
    risk_score: null,
    risk_category: null,
    risk_analysis: null,
    selected_sectors: [],
    portfolio: null
  });

  const steps = [
    { id: 1, label: "Intake Profile" },
    { id: 2, label: "Risk Engine" },
    { id: 3, label: "Sector Screen" },
    { id: 4, label: "Stock Bucket" }
  ];

  const handleIntakeSubmit = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/run-portfolio-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setAgentData({
        user_profile: formData,
        risk_score: data.risk_score,
        risk_category: data.risk_category,
        risk_analysis: data.risk_analysis,
        selected_sectors: data.selected_sectors,
        portfolio: data.portfolio
      });
      setAgentStep(2);
    } catch {
      // Demo fallback mock
      setAgentData({
        user_profile: formData,
        risk_score: 72,
        risk_category: "Moderate-Aggressive",
        risk_analysis: "High surplus income combined with a 5-7 year horizon allows an aggressive equity allocation targeting 14-16% CAGR without triggering liquidation risk.",
        selected_sectors: ["Banking & Financials", "Information Technology", "Automotive & EV", "Pharma"],
        portfolio: {
          expected_cagr: "14.8% Projected",
          portfolio: [
            { name: "HDFC Bank Ltd.", ticker: "HDFCBANK.NS", sector: "Banking", allocation_percentage: 30, allocated_amount: formData.initial_investment * 0.3, rationale: "Dominant private bank with low NPA and compounding credit book." },
            { name: "Tata Consultancy Services", ticker: "TCS.NS", sector: "IT", allocation_percentage: 25, allocated_amount: formData.initial_investment * 0.25, rationale: "High return on equity and substantial free cash flows." },
            { name: "Tata Motors Ltd.", ticker: "TATAMOTORS.NS", sector: "Auto", allocation_percentage: 25, allocated_amount: formData.initial_investment * 0.25, rationale: "Leader in passenger EV transition and commercial vehicle upcycle." },
            { name: "Sun Pharma Ltd.", ticker: "SUNPHARMA.NS", sector: "Pharma", allocation_percentage: 20, allocated_amount: formData.initial_investment * 0.2, rationale: "Global specialty pipeline offering steady non-cyclical alpha." }
          ],
          horizon_strategy: {
            short_term: "Bluechip base absorbs initial market volatility with solid downside protection.",
            mid_term: "Earnings expansion in banking and tech drives 1-3 year capital growth.",
            long_term: "Compounding returns beat benchmark Nifty 50 over the target horizon."
          }
        }
      });
      setAgentStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "onboarding" && (
          <main className="space-y-8">
            {/* Minimalist Institutional Step Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-4 gap-2 bg-[#0d121d]/80 p-1.5 rounded-2xl border border-white/[0.06] backdrop-blur-md">
                {steps.map((s) => {
                  const isCompleted = agentStep > s.id;
                  const isActive = agentStep === s.id;
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20"
                          : isCompleted
                          ? "text-blue-400 bg-blue-500/10"
                          : "text-slate-500"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        isActive ? "bg-white text-blue-600 font-bold" : isCompleted ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        {isCompleted ? <Check size={12} strokeWidth={3} /> : s.id}
                      </span>
                      <span className="text-xs tracking-tight hidden sm:inline">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {agentStep === 1 && <IntakeForm onSubmit={handleIntakeSubmit} loading={loading} />}
            {agentStep === 2 && (
              <RiskAssessmentView
                riskData={agentData}
                onProceed={() => setAgentStep(3)}
                loading={loading}
              />
            )}
            {agentStep === 3 && (
              <SectorAnalysisView
                sectors={agentData.selected_sectors}
                onProceed={() => setAgentStep(4)}
                loading={loading}
              />
            )}
            {agentStep === 4 && (
              <PortfolioBucketView
                portfolioData={agentData.portfolio}
                onReset={() => setAgentStep(1)}
              />
            )}
          </main>
        )}

        {activeTab === "calculators" && <Calculators />}
      </div>

      <Chatbot />
    </div>
  );
}