import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  X, 
  Bot, 
  User, 
  Sparkles, 
  RotateCcw, 
  HelpCircle,
  ExternalLink,
  ChevronDown
} from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Namaste! I am NiveshGuru, your RAG-powered Indian Equity Education assistant. How can I assist your investment journey today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Curated quick educational prompts for Indian retail investors
  const quickPrompts = [
    "What is P/E Ratio?",
    "Why 5-year Horizon?",
    "How does Beta measure risk?",
    "Large vs Mid Cap"
  ];

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || query;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend })
      });
      const data = await res.json();
      
      const botReply = {
        id: Date.now() + 1,
        sender: "bot",
        text: data.response || "I couldn't retrieve a response at this time.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botReply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "Education API is currently offline. Please ensure server.py is running on port 8000.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 1,
        sender: "bot",
        text: "Namaste! I am NiveshGuru, your RAG-powered Indian Equity Education assistant. How can I assist your investment journey today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-5 rounded-full shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
        >
          <div className="relative">
            <Bot size={20} className="text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080B11] animate-pulse"></span>
          </div>
          <span className="text-xs font-semibold tracking-wide">Ask NiveshGuru</span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">RAG AI</span>
        </button>
      )}

      {/* Expanded Modern Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[580px] bg-[#0d131f]/95 backdrop-blur-xl border border-white/[0.12] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header Bar */}
          <div className="px-4 py-3.5 bg-[#080B11]/90 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-[1px] shadow-md shadow-blue-500/20">
                <div className="w-full h-full bg-[#0d131f] rounded-[11px] flex items-center justify-center">
                  <Sparkles size={16} className="text-blue-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white tracking-tight">NiveshGuru RAG</h4>
                  <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded font-mono">
                    NSE / BSE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span>
                  Pinecone Vector Knowledge Base
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button 
                onClick={handleResetChat} 
                title="Reset Conversation"
                className="p-1.5 hover:text-white hover:bg-white/[0.06] rounded-lg transition"
              >
                <RotateCcw size={14} />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                title="Close Assistant"
                className="p-1.5 hover:text-white hover:bg-white/[0.06] rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Prompt Pill Strip */}
          <div className="px-3 py-2 bg-[#090e17] border-b border-white/[0.04] overflow-x-auto no-scrollbar flex gap-1.5">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap bg-white/[0.04] hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/[0.06] text-slate-300 text-[10px] px-2.5 py-1 rounded-full transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Thread Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                      <Bot size={13} />
                    </div>
                  )}

                  <div className={`max-w-[82%] space-y-1`}>
                    <div
                      className={`p-3 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                        isUser
                          ? "bg-blue-600 text-white rounded-br-xs font-normal"
                          : "bg-[#141b2b] text-slate-200 border border-white/[0.06] rounded-bl-xs"
                      }`}
                    >
                      {m.text}
                    </div>
                    <div className={`text-[9px] text-slate-500 px-1 font-mono ${isUser ? "text-right" : "text-left"}`}>
                      {m.time}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-lg bg-slate-800 border border-white/[0.1] flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                      <User size={13} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pulsing AI Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] bg-[#141b2b]/50 border border-white/[0.04] p-2.5 rounded-xl w-fit">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                </div>
                <span>Retrieving investor insights from Pinecone...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Footer Disclaimer & Input Box */}
          <div className="p-3 bg-[#080B11]/90 border-t border-white/[0.06] space-y-2">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about valuations, PE, risk horizons..."
                disabled={loading}
                className="flex-1 bg-[#141b2b] border border-white/[0.08] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-3.5 py-2 rounded-xl transition flex items-center justify-center shadow-md shadow-blue-500/20"
              >
                <Send size={14} />
              </button>
            </form>

            <div className="flex items-center justify-between text-[9px] text-slate-500 px-1">
              <span>Educational guidance only. Not direct financial advice.</span>
              <span className="text-slate-400 font-mono">SEBI Aware</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}