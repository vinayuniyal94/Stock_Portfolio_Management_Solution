// import React, { useState } from 'react';
// import { 
//   LayoutDashboard, 
//   Bot, 
//   Puzzle, 
//   FileText, 
//   BarChart3, 
//   UserCheck, 
//   Sparkles,
//   Briefcase,
//   Calculator,
//   MessageSquare,
//   ChevronLeft,
//   ChevronRight
// } from 'lucide-react';

// export default function Sidebar({ activeNav, setActiveNav, currentUser, onOpenAuth }) {
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   return (
//     <aside className={`bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none shadow-sm transition-all duration-300 ${
//       isCollapsed ? 'w-20' : 'w-68'
//     }`}>
//       <div className="overflow-y-auto overflow-x-hidden">
        
//         {/* Brand Header & Toggle Button */}
//         <div className="p-4 border-b border-slate-100 flex items-center justify-between">
//           {!isCollapsed && (
//             <div className="flex items-center space-x-2.5 min-w-0">
//               <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 flex-shrink-0">
//                 <Sparkles className="w-4 h-4" />
//               </div>
//               <div className="min-w-0">
//                 <span className="font-bold text-slate-900 tracking-tight text-sm block truncate">ArthVeda AI</span>
//                 <span className="text-[9px] font-mono text-slate-400 block truncate">Multiagentic Wealth</span>
//               </div>
//             </div>
//           )}
//           <button
//             onClick={() => setIsCollapsed(!isCollapsed)}
//             className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors mx-auto cursor-pointer"
//             title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
//           >
//             {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
//           </button>
//         </div>

//         {/* Navigation Group 1: Trial Mode */}
//         <div className="p-3 space-y-1">
//           {!isCollapsed && (
//             <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 block mb-1">
//               Trial Mode
//             </span>
//           )}
          
//           {[
//             { id: 'dashboard', label: 'Dashboard / Workflow', icon: LayoutDashboard },
//             { id: 'assistant', label: 'ArthVeda AI Assistant', icon: MessageSquare },
//             { id: 'calculator', label: 'Calculators', icon: Calculator },
//             { id: 'mcp', label: 'MCP Integration', icon: Puzzle }
//           ].map((item) => {
//             const Icon = item.icon;
//             const isActive = activeNav === item.id;
//             return (
//               <button
//                 key={item.id}
//                 onClick={() => setActiveNav(item.id)}
//                 title={isCollapsed ? item.label : ''}
//                 className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
//                   isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
//                 } ${isCollapsed ? 'justify-center' : ''}`}
//               >
//                 <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
//                 {!isCollapsed && <span className="truncate">{item.label}</span>}
//               </button>
//             );
//           })}
//         </div>

//         {/* Navigation Group 2: Registered Suite */}
//         <div className="p-3 space-y-1 border-t border-slate-100 mt-2">
//           {!isCollapsed && (
//             <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 block mb-1">
//               Registered Suite
//             </span>
//           )}

//           {[
//             { id: 'assistant', label: 'ArthVeda AI Assistant', icon: MessageSquare },
//             { id: 'portfolio', label: 'My Saved Portfolio', icon: Briefcase },
//             { id: 'analytics', label: 'Portfolio Analytics', icon: BarChart3 },
//             { id: 'rag', label: 'Document Grounding RAG', icon: FileText },
//             { id: 'pipeline', label: 'Agent Pipeline Monitor', icon: Bot },
//             { id: 'platform_analytics', label: 'Platform Analytics', icon: BarChart3 },
//           ].map((item) => {
//             const Icon = item.icon;
//             const isActive = activeNav === item.id;
//             const requiresAuth = item.id !== 'assistant'; 

//             return (
//               <button
//                 key={item.id}
//                 title={isCollapsed ? item.label : ''}
//                 onClick={() => {
//                   if (requiresAuth && !currentUser) {
//                     onOpenAuth();
//                   } else {
//                     setActiveNav(item.id);
//                   }
//                 }}
//                 className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
//                   isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
//                 } ${isCollapsed ? 'justify-center' : ''}`}
//               >
//                 <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
//                   <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
//                   {!isCollapsed && <span className="truncate">{item.label}</span>}
//                 </div>
//                 {requiresAuth && !currentUser && !isCollapsed && (
//                   <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Locked</span>
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Footer: Login Button */}
//       <div className="p-3 border-t border-slate-100">
//         {currentUser ? (
//           <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
//             {!isCollapsed && (
//               <div className="min-w-0">
//                 <span className="text-[9px] font-mono text-emerald-600 font-bold block uppercase">Active Investor</span>
//                 <span className="text-xs font-bold text-slate-800 truncate block">@{currentUser.username}</span>
//               </div>
//             )}
//             <button onClick={onOpenAuth} title="Account Settings" className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer">
//               <UserCheck className="w-4 h-4 text-emerald-600" />
//             </button>
//           </div>
//         ) : (
//           <button
//             onClick={onOpenAuth}
//             title={isCollapsed ? 'Login' : ''}
//             className={`w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer ${
//               isCollapsed ? 'px-0' : 'px-3'
//             }`}
//           >
//             <UserCheck className="w-4 h-4 flex-shrink-0" />
//             {!isCollapsed && <span>Login</span>}
//           </button>
//         )}
//       </div>
//     </aside>
//   );
// }
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Puzzle, 
  FileText, 
  BarChart3, 
  UserCheck, 
  Sparkles,
  Briefcase,
  Calculator,
  MessageSquare,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeNav, setActiveNav, currentUser, onOpenAuth }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none shadow-sm transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-68'
    }`}>
      <div className="overflow-y-auto overflow-x-hidden">
        
        {/* Brand Header & Toggle Button */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 tracking-tight text-sm block truncate">ArthVeda AI</span>
                <span className="text-[9px] font-mono text-slate-400 block truncate">Multiagentic Wealth</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors mx-auto cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Group 1: Trial Mode */}
        <div className="p-3 space-y-1">
          {!isCollapsed && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 block mb-1">
              Trial Mode
            </span>
          )}
          
          {[
            { id: 'dashboard', label: 'Dashboard / Workflow', icon: LayoutDashboard },
            { id: 'assistant', label: 'ArthVeda AI Assistant', icon: MessageSquare },
            { id: 'calculator', label: 'Calculators', icon: Calculator },
            { id: 'mcp', label: 'MCP Integration', icon: Puzzle }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Navigation Group 2: Registered Suite */}
        <div className="p-3 space-y-1 border-t border-slate-100 mt-2">
          {!isCollapsed && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 block mb-1">
              Registered Suite
            </span>
          )}

          {[
            { id: 'assistant', label: 'ArthVeda AI Assistant', icon: MessageSquare, authRequired: false },
            { id: 'portfolio', label: 'My Saved Portfolio', icon: Briefcase, authRequired: true },
            { id: 'analytics', label: 'Portfolio Analytics', icon: BarChart3, authRequired: true },
            { id: 'rag', label: 'Document Grounding RAG', icon: FileText, authRequired: true },
            { id: 'pipeline', label: 'Agent Pipeline Monitor', icon: Activity, authRequired: true },
            { id: 'platform_analytics', label: 'Platform Analytics', icon: BarChart3, authRequired: true },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                title={isCollapsed ? item.label : ''}
                onClick={() => {
                  if (item.authRequired && !currentUser) {
                    onOpenAuth();
                  } else {
                    setActiveNav(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {item.authRequired && !currentUser && !isCollapsed && (
                  <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Locked</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer: User Authentication / Profile Button */}
      <div className="p-3 border-t border-slate-100">
        {currentUser ? (
          <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-[9px] font-mono text-emerald-600 font-bold block uppercase">Active Investor</span>
                <span className="text-xs font-bold text-slate-800 truncate block">@{currentUser.username || currentUser.email}</span>
              </div>
            )}
            <button onClick={onOpenAuth} title="Account Settings" className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer">
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            title={isCollapsed ? 'Login / Register' : ''}
            className={`w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
          >
            <UserCheck className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Login / Register</span>}
          </button>
        )}
      </div>
    </aside>
  );
}