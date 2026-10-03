import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Bot, Calculator, Network, Briefcase, 
  BarChart2, FileText, Cpu, PieChart, User, LogOut, ChevronUp, TrendingUp, CheckCircle2, ShieldAlert, ChevronDown, PanelLeftClose, PanelLeftOpen 
} from 'lucide-react';

export default function Sidebar({ activeNav, setActiveNav, currentUser, onOpenAuth, isCollapsed, setIsCollapsed }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);

  // Accordion state: expand trial or registered depending on login state
  const [trialOpen, setTrialOpen] = useState(!currentUser);
  const [registeredOpen, setRegisteredOpen] = useState(Boolean(currentUser));

  // Sync accordion open state automatically when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setTrialOpen(false);
      setRegisteredOpen(true);
    } else {
      setTrialOpen(true);
      setRegisteredOpen(false);
    }
  }, [currentUser]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setLoggingOut(true);
    setShowProfileMenu(false);
    setTimeout(() => {
      window.location.reload(); 
    }, 900);
  };

  const navItems = [
    // Trial Mode Items
    { id: 'dashboard', label: 'Dashboard / Workflow', icon: LayoutDashboard, section: 'Trial Mode' },
    { id: 'assistant', label: 'ArthVeda AI Assistant', icon: Bot, section: 'Trial Mode' },
    { id: 'solution_guardrails', label: 'Solution Guardrails', icon: ShieldAlert, section: 'Trial Mode' },
    { id: 'calculator', label: 'Calculators', icon: Calculator, section: 'Trial Mode' },
    { id: 'mcp', label: 'MCP Integration', icon: Network, section: 'Trial Mode' },

    // Registered Suite Items
    { id: 'portfolio', label: 'My Saved Portfolio', icon: Briefcase, section: 'Registered Suite' },
    { id: 'analytics', label: 'Portfolio Analytics', icon: BarChart2, section: 'Registered Suite' },
    { id: 'assistant', label: 'ArthVeda AI Assistant', icon: Bot, section: 'Registered Suite' },
    { id: 'solution_guardrails', label: 'Solution Guardrails', icon: ShieldAlert, section: 'Registered Suite' },
    { id: 'rag', label: 'Document Grounding RAG', icon: FileText, section: 'Registered Suite' },
    { id: 'pipeline', label: 'Agent Pipeline Monitor', icon: Cpu, section: 'Registered Suite' },
    { id: 'platform_analytics', label: 'Platform Analytics', icon: PieChart, section: 'Registered Suite' }
  ];

  return (
    <aside className={`bg-white border-r border-slate-200 flex flex-col h-screen fixed inset-y-0 left-0 select-none z-40 overflow-hidden transition-all duration-300 shadow-sm ${
      isCollapsed ? 'w-20' : 'w-80'
    }`}>
      
      {/* Logout Notification Overlay */}
      {loggingOut && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center space-y-3 animate-in fade-in duration-200">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Successfully Logged Out</h4>
          <p className="text-[10px] text-slate-500 font-mono">Clearing session state securely...</p>
        </div>
      )}

      {/* Top Logo & Toggle: Clicking logo or toggle button expands/collapses sidebar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white z-10">
        {!isCollapsed ? (
          <div 
            className="flex items-center gap-3 min-w-0 cursor-pointer group" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="Click to collapse sidebar"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 flex-shrink-0 group-hover:bg-emerald-500 transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-slate-900 text-sm tracking-tight truncate group-hover:text-emerald-600 transition-colors">ArthVeda AI</h1>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider leading-tight mt-0.5 truncate">
                Multiagentic Wealth
              </p>
            </div>
          </div>
        ) : (
          <div 
            className="mx-auto w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 flex-shrink-0 cursor-pointer hover:bg-emerald-500 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="Click to expand sidebar"
          >
            <TrendingUp className="w-5 h-5" />
          </div>
        )}

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="Collapse Sidebar"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0 flex items-center justify-center bg-slate-50 border border-slate-200/60"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable Navigation Area (Sidebar itself is locked, only middle content flows) */}
      <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* Trial Mode Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <button 
              onClick={() => setTrialOpen(!trialOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold hover:text-slate-600 cursor-pointer"
            >
              <span>Trial Mode</span>
              {trialOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {(trialOpen || isCollapsed) && (
            <div className="space-y-1 pt-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-1">
              {navItems.filter(i => i.section === 'Trial Mode').map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={`${item.id}_trial`}
                    onClick={() => setActiveNav(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'} rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Registered Suite Section */}
        <div className="space-y-1 pt-2">
          {!isCollapsed && (
            <button 
              onClick={() => setRegisteredOpen(!registeredOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold hover:text-slate-600 cursor-pointer"
            >
              <span>Registered Suite</span>
              {registeredOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {(registeredOpen || isCollapsed) && (
            <div className="space-y-1 pt-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-1">
              {navItems.filter(i => i.section === 'Registered Suite').map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={`${item.id}_reg`}
                    onClick={() => setActiveNav(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!currentUser && !isCollapsed && (
                      <span className="text-[9px] font-mono bg-slate-100 text-slate-400 px-2 py-0.5 rounded border border-slate-200 flex-shrink-0">
                        Locked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Footer Profile / Login Button Section (Fixed at bottom) */}
      <div className="p-4 border-t border-slate-100 relative flex-shrink-0 bg-white z-10" ref={menuRef}>
        {currentUser ? (
          <div>
            {showProfileMenu && (
              <div className="absolute bottom-16 left-4 right-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">Signed in as</span>
                  <span className="text-xs font-bold text-slate-900 truncate block">{currentUser.email || currentUser.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Logout Account</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title={isCollapsed ? `@${currentUser.username || 'Investor'}` : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between p-2.5'} rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                {!isCollapsed && (
                  <div className="text-left truncate">
                    <span className="text-xs font-bold text-slate-900 block truncate">@{currentUser.username || 'Investor'}</span>
                    <span className="text-[9px] text-emerald-600 font-mono block">Supabase Synced</span>
                  </div>
                )}
              </div>
              {!isCollapsed && <ChevronUp className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />}
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            title={isCollapsed ? "Login" : undefined}
            className={`w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isCollapsed ? 'px-2' : 'px-4'
            }`}
          >
            <User className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Login</span>}
          </button>
        )}
      </div>

    </aside>
  );
}