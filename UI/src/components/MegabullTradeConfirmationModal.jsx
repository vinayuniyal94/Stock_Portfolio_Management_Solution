import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, X, TrendingUp, Terminal } from 'lucide-react';

export default function MegabullTradeConfirmationModal({ isOpen, onClose, tradeResult }) {
  if (!isOpen) return null;

  const orders = tradeResult?.executed_orders || [];
  const isSuccess = tradeResult?.status === 'success' || orders.some(o => o.status === 'PLACED');

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                MegaBull Paper Trading Gateway
              </span>
              <h2 className="text-base font-extrabold tracking-tight mt-0.5">
                Paper Trade Execution Summary
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto bg-slate-50/50">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            {isSuccess ? <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" /> : <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />}
            <div>
              <h4 className="font-bold text-xs font-mono uppercase tracking-wider">
                {isSuccess ? 'Orders Successfully Placed on MegaBull' : 'Execution Notice'}
              </h4>
              <p className="text-xs mt-0.5 opacity-90">
                {tradeResult?.message || `Successfully transmitted ${orders.length} equity orders to MegaBull virtual sandbox environment.`}
              </p>
            </div>
          </div>

          {/* Detailed Orders List Table */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              Executed Order Breakdown ({orders.length} Equities)
            </span>

            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Ticker</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Order ID / Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {orders.map((ord, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{ord.ticker}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'PLACED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-700 font-bold">{ord.qty}</td>
                      <td className="p-3 text-right text-slate-500 text-[11px]">{ord.orderId || ord.reason || 'SIM-ID-' + Math.floor(Math.random() * 90000 + 10000)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] font-mono text-slate-400">
            Virtual Sandbox Balance: ₹5,00,000 INR
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer shadow-md"
          >
            Close & View Portfolio
          </button>
        </div>

      </div>
    </div>
  );
}