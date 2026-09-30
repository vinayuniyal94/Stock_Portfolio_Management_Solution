import React, { useState } from 'react';
import { 
  Sliders, 
  Cpu, 
  FolderTree, 
  Puzzle, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';

export default function AgentSettingsPanel() {
  const [isActive, setIsActive] = useState(true);
  const [expandedSection, setExpandedSection] = useState('llm');

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto p-5 space-y-6 text-xs">
      
      {/* Top Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <span className="font-bold text-slate-900 text-sm">Agent Settings</span>
        <button 
          onClick={() => setIsActive(!isActive)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <span className="text-slate-500 font-medium">{isActive ? 'Active' : 'Paused'}</span>
          {isActive ? (
            <ToggleRight className="w-8 h-8 text-emerald-600" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-slate-300" />
          )}
        </button>
      </div>

      {/* LLM Settings Section */}
      <div className="space-y-3">
        <button 
          onClick={() => toggleSection('llm')}
          className="w-full flex items-center justify-between font-semibold text-slate-800"
        >
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>LLM Settings</span>
          </div>
          {expandedSection === 'llm' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>

        {expandedSection === 'llm' && (
          <div className="space-y-3 pl-6 pt-1">
            <div>
              <label className="text-slate-500 block mb-1">LLM Model</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg border border-emerald-500 bg-emerald-50/50 font-medium text-emerald-800 flex items-center justify-between">
                  <span>OpenAI GPT-4o</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="p-2 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-between">
                  <span>Claude 3.5</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-500 block mb-1">Tokens Limit</label>
              <div className="grid grid-cols-2 gap-2">
                <select className="enterprise-input rounded-lg p-2 text-xs">
                  <option>Monthly</option>
                  <option>Daily</option>
                </select>
                <input type="text" value="$120" readOnly className="enterprise-input rounded-lg p-2 text-xs font-mono" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions Section */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 font-semibold text-slate-800">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <span>Instructions</span>
        </div>
        <button className="p-1 rounded hover:bg-slate-100 text-slate-500"><Plus className="w-4 h-4" /></button>
      </div>

      {/* Context Section */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <button 
          onClick={() => toggleSection('context')}
          className="w-full flex items-center justify-between font-semibold text-slate-800"
        >
          <div className="flex items-center space-x-2">
            <FolderTree className="w-4 h-4 text-emerald-600" />
            <span>Context & Memory</span>
          </div>
          {expandedSection === 'context' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>

        {expandedSection === 'context' && (
          <div className="space-y-2 pl-6 text-slate-600">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span>Pinecone Vector Index</span>
              <span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Connected</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span>Live NSE/BSE Feeds</span>
              <span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
            </div>
          </div>
        )}
      </div>

      {/* Integrations Section */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-800">
          <div className="flex items-center space-x-2">
            <Puzzle className="w-4 h-4 text-emerald-600" />
            <span>Integrations</span>
          </div>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-500"><Plus className="w-4 h-4" /></button>
        </div>
        <div className="space-y-2 pl-6 text-slate-600">
          <div className="flex items-center justify-between text-xs">
            <span>Yahoo Finance API</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Direct NSE India Feed</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

    </aside>
  );
}