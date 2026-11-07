import React, { useState } from 'react';
import { UserPlus, Lock, Mail, User } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Safe initialization with environment variables and reliable fallbacks to prevent crashes
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ivlrzhllmdhrffbaekfl.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || 'sb_publishable_nbxw94AF7wQCz8uigXQaSQ_PlfKwvDn';

const supabase = createClient(supabaseUrl, supabaseKey);

export default function UserProfileModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Sign up user via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (error) throw error;

      const userSession = {
        id: data?.user?.id || Date.now().toString(),
        email: email,
        username: username || email.split('@')[0]
      };

      // 2. Save active user session locally
      localStorage.setItem('arthveda_user', JSON.stringify(userSession));

      // 3. Bind any pending multi-agent portfolio to this registered account vault
      const pendingPortfolio = localStorage.getItem('arthveda_pending_portfolio');
      if (pendingPortfolio) {
        localStorage.setItem('arthveda_saved_portfolio', pendingPortfolio);
      }

      if (onSuccess) onSuccess(userSession);
      onClose();
      window.location.reload(); // Refresh to load registered state
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6 border border-slate-200 relative">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
            <UserPlus className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Register Portfolio Vault</h3>
          <p className="text-xs text-slate-500">Create your credentials to permanently save this portfolio.</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-slate-500 font-bold">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="vinayuniyal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-slate-500 font-bold">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="vinay@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-slate-500 font-bold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'Registering & Saving...' : 'Complete Registration & Save Portfolio'}
          </button>
        </form>

        <button
          onClick={onClose}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer pt-2"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}