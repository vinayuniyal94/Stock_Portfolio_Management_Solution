import React, { useState } from 'react';
import { UserPlus, LogIn, Lock, Mail, User, CheckCircle2, Loader2, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ivlrzhllmdhrffbaekfl.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || 'sb_publishable_nbxw94AF7wQCz8uigXQaSQ_PlfKwvDn';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function UserProfileModal({ isOpen, onClose, onSuccess, defaultMode = 'register' }) {
  const [isLoginMode, setIsLoginMode] = useState(defaultMode === 'login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLoginMode) {
        // --- LOGIN FLOW ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        const userSession = {
          id: data?.user?.id || 'usr_session',
          email: email,
          username: data?.user?.user_metadata?.username || email.split('@')[0]
        };

        localStorage.setItem('arthveda_user', JSON.stringify(userSession));
        setSuccessMsg('Login successful! Redirecting...');
        
        setTimeout(() => {
          if (onSuccess) onSuccess(userSession);
          onClose();
          window.location.reload();
        }, 800);

      } else {
        // --- REGISTRATION FLOW ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split('@')[0] }
          }
        });

        if (error) throw error;

        const userId = data?.user?.id;
        const userSession = {
          id: userId || Date.now().toString(),
          email: email,
          username: username || email.split('@')[0]
        };

        localStorage.setItem('arthveda_user', JSON.stringify(userSession));

        // Save user record to public.users table if client is configured
        if (userId) {
          await supabase.from('users').upsert([
            {
              id: userId,
              username: userSession.username,
              email: email,
              password_hash: 'managed_by_supabase_auth'
            }
          ], { onConflict: 'id' });
        }

        setSuccessMsg('Account created successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess(userSession);
          onClose();
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6 border border-slate-200 relative">
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            {isLoginMode ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h3 className="text-xl font-extrabold text-slate-950">
            {isLoginMode ? 'Welcome Back to ArthVeda' : 'Register Investor Profile'}
          </h3>
          <p className="text-xs text-slate-500">
            {isLoginMode ? 'Access your risk profile and paper-trading analytics.' : 'Save your risk profile and preferences securely.'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500 text-slate-900"
                />
              </div>
            </div>
          )}

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
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500 text-slate-900"
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
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Processing...' : (isLoginMode ? 'Sign In to Account' : 'Complete Registration')}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            {isLoginMode ? "Don't have an account? Register" : "Already registered? Sign In"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}