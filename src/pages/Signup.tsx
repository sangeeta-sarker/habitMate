
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { motion } from 'motion/react';
import { UserPlus, Sparkles } from 'lucide-react';

export function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/api/register', formData);
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200 -rotate-3">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter italic text-indigo-900">Get Started</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Create Your Profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Username</label>
            <input 
              type="text" 
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-bold text-xs"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email</label>
            <input 
              type="email" 
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-bold text-xs"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Phone</label>
            <input 
              type="tel" 
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-bold text-xs"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all font-bold text-xs"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider text-center mt-2">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 mt-4 active:scale-[0.98]"
          >
            {loading ? 'Joining...' : <><UserPlus size={20} /> Join the Community</>}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          Member already? <Link to="/login" className="text-indigo-600 underline underline-offset-4">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
