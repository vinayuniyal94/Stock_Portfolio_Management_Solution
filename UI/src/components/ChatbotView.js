import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Loader2, Database, Copy, Check, RotateCcw, Cpu, Zap, Hash } from 'lucide-react';

const COMPACT_PROMPTS = [
  "How does Beta protect portfolios?",
  "Trailing PE vs Forward PE",
  "Why a 5-7 year horizon?",
  "SEBI fiduciary rules"
];

export default function ChatbotView() {
  const [messages, setMessages] = useState([
    {
      id: 'init_1',
      sender: 'guru',
      text: "Namaste! I am **ArthVeda AI Assistant**, your institutional Indian stock market research mentor.\n\nAsk me about valuation multiples (P/E, Beta, Dividend Yields), macroeconomic sector cycles, or SEBI investment frameworks.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metadata: {
        llm: 'gpt-4o-mini',
        chunks: 3,
        inputTokens: 142,
        outputTokens: 88,
        latencyMs: 380
      }
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const startTime = performance.now();
    const userMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend })
      });
      const data = await response.json();
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);

      // Extract telemetry from response or fallback to estimated metrics
      const meta = data.metadata || {
        llm: data.llm || 'gpt-4o',
        chunks: data.chunks_retrieved || 4,
        inputTokens: data.input_tokens || Math.round(textToSend.length * 1.3),
        outputTokens: data.output_tokens || Math.round((data.response || '').length * 1.2),
        latencyMs: elapsed
      };

      setMessages((prev) => [
        ...prev,
        {
          id: `g_${Date.now()}`,
          sender: 'guru',
          text: data.response || "No response received from RAG engine.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          metadata: meta
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'guru',
          text: "Encountered difficulty connecting to `server.py` on port 8000. Please verify the backend is active.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          metadata: { llm: 'offline', chunks: 0, inputTokens: 0, outputTokens: 0, latencyMs: 0 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormatted = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2.5" />;

      if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
        return (
          <h4 key={idx} className="text-xs font-bold text-emerald-700 mt-3 mb-1.5 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
            {trimmed.replace(/#/g, '').trim()}
          </h4>
        );
      }

      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        return (
          <div key={idx} className="flex items-start space-x-2.5 my-1.5 text-slate-700 pl-1">
            <span className="text-emerald-600 text-xs mt-0.5">•</span>
            <span className="text-xs leading-relaxed">{renderBold(trimmed.substring(1).trim())}</span>
          </div>
        );
      }

      if (/^\d+\./.test(trimmed)) {
        return (
          <div key={idx} className="flex items-start space-x-2.5 my-1.5 text-slate-700 pl-1">
            <span className="font-mono text-emerald-700 text-xs font-bold">{trimmed.slice(0, trimmed.indexOf('.') + 1)}</span>
            <span className="text-xs leading-relaxed">{renderBold(trimmed.slice(trimmed.indexOf('.') + 1).trim())}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs leading-relaxed text-slate-700 my-1.5">
          {renderBold(trimmed)}
        </p>
      );
    });
  };

  const renderBold = (txt) => {
    const parts = txt.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-emerald-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="w-full h-[calc(100vh-5.5rem)] enterprise-card rounded-3xl overflow-hidden flex flex-col shadow-sm animate-in fade-in duration-200 bg-white">
      
      {/* Top Header */}
      <div className="px-8 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">ArthVeda AI Research Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono mt-0.5">
              <span className="flex items-center gap-1"><Database className="w-3 h-3 text-emerald-600" /> Pinecone Vector RAG</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-emerald-600" /> Llama-3 / GPT-4o</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setMessages([{ id: 'init_reset', sender: 'guru', text: 'Chat reset. How can I assist you with your Indian portfolio strategy?', timestamp: '' }])}
          title="Reset Chat"
          className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors flex items-center gap-1.5 text-xs font-medium border border-slate-200 bg-white shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear Chat
        </button>
      </div>

      {/* Message Canvas */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-6 space-y-6 bg-slate-50/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex items-start gap-4 w-full max-w-5xl mx-auto ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-sm ${
                isUser ? 'bg-emerald-600 text-white font-bold' : 'bg-white text-emerald-700 border border-slate-200'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] rounded-2xl p-5 text-xs shadow-sm group relative ${
                isUser
                  ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
              }`}>
                {isUser ? <p className="leading-relaxed text-xs">{msg.text}</p> : renderFormatted(msg.text)}
                
                {/* Telemetry & Metadata Footer for Assistant Messages */}
                {!isUser && msg.metadata && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                    <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <Cpu className="w-3 h-3 text-emerald-600" />
                      <span>LLM: {msg.metadata.llm}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Database className="w-3 h-3 text-blue-600" />
                      <span>Chunks: {msg.metadata.chunks} retrieved</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-amber-600" />
                      <span>In Tokens: <strong className="text-slate-700">{msg.metadata.inputTokens}</strong></span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600" />
                      <span>Out Tokens: <strong className="text-slate-700">{msg.metadata.outputTokens}</strong></span>
                    </div>
                    <span>•</span>
                    <span className="text-slate-400">({msg.metadata.latencyMs}ms)</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/60">
                  <span className={`text-[10px] font-mono ${isUser ? 'text-white/80' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                  
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2.5 text-slate-600 text-xs font-mono p-4 rounded-2xl bg-white border border-slate-200 shadow-sm w-full max-w-5xl mx-auto">
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>Consulting Pinecone vector store & synthesizing answer...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compact Quick Prompts */}
      <div className="px-8 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-slate-400 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Quick Prompts:
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {COMPACT_PROMPTS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-emerald-300 hover:bg-emerald-50 transition-all font-medium cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <div className="p-5 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-5xl mx-auto flex items-center space-x-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Beta, P/E multiples, SEBI guidelines, or Nifty compounding..."
            className="flex-1 enterprise-input rounded-2xl px-5 py-3.5 text-xs placeholder-slate-400 shadow-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 disabled:opacity-30 transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
          >
            <span>Send Query</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}