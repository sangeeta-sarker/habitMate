import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { motion } from 'motion/react';
import { LogIn, Sparkles } from 'lucide-react';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/api/login', { username, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200 rotate-3">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter italic text-indigo-900">Welcome Back</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Resume Your Progress</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Username</label>
            <input 
              type="text" 
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider text-center">{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : <><LogIn size={20} /> Continue to App</>}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          New to HabitMate? <Link to="/signup" className="text-indigo-600 underline underline-offset-4">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
}
