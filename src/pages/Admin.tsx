import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { motion } from 'motion/react';
import { 
  Users, 
  ShieldAlert, 
  Quote, 
  Ban, 
  CheckCircle, 
  Plus, 
  Search,
  Flag
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  streak: number;
  total_points: number;
}

interface Report {
  id: number;
  reporter: string;
  reported: string;
  reason: string;
  timestamp: string;
}

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [newQuote, setNewQuote] = useState({ text: '', author: '' });
  const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    const [usersRes, reportsRes] = await Promise.all([
      api.get('/api/admin/users'),
      api.get('/api/admin/reports')
    ]);
    setUsers(usersRes);
    setReports(reportsRes);
  };

  const toggleUserStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'restricted' : 'active';
    await api.patch(`/api/admin/users/${userId}/status`, { status: newStatus });
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
  };

  const addQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.text) return;
    await api.post('/api/admin/quotes', newQuote);
    setNewQuote({ text: '', author: '' });
    alert('Motivational text added!');
  };

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()));

  return (
    <div className="space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
          <p className="text-zinc-500">Monitor users, reports, and community content</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Management Section */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Quote className="text-emerald-500" size={20} />
              Add Motivation
            </h2>
            <form onSubmit={addQuote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quote Text</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500 text-sm h-24"
                  value={newQuote.text}
                  onChange={e => setNewQuote({ ...newQuote, text: e.target.value })}
                  placeholder="Inspiration for the day..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Author</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  value={newQuote.author}
                  onChange={e => setNewQuote({ ...newQuote, author: e.target.value })}
                  placeholder="Anonymous"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add Quote
              </button>
            </form>
          </section>

          <section className="bg-red-50 dark:bg-red-500/5 p-6 rounded-2xl border border-red-100 dark:border-red-500/10">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2 text-red-700 dark:text-red-400">
              <Flag size={20} /> System Reports
            </h2>
            <p className="text-xs text-red-600/70 dark:text-red-400/50 mb-4 uppercase tracking-widest font-bold">
              {reports.length} Pending
            </p>
            <div className="space-y-3">
               {reports.map(report => (
                 <div key={report.id} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-red-100 dark:border-red-500/10 text-sm">
                   <p className="font-bold flex items-center justify-between">
                     <span>{report.reported}</span>
                     <span className="text-[10px] text-zinc-400">via {report.reporter}</span>
                   </p>
                   <p className="text-zinc-500 mt-1 italic">"{report.reason}"</p>
                 </div>
               ))}
               {reports.length === 0 && <p className="text-center text-xs text-zinc-400 py-4 italic">No reports found.</p>}
            </div>
          </section>
        </div>

        {/* User Management List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <header className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <h2 className="text-lg font-bold">User Management</h2>
                 <div className="relative">
                   <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                   <input 
                    type="text" 
                    placeholder="Search username..."
                    className="pl-8 pr-4 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:ring-1 focus:ring-emerald-500 outline-none w-48"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                   />
                 </div>
               </div>
               <span className="text-xs font-bold text-zinc-400">{filteredUsers.length} total users</span>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-900/10">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Streak</th>
                    <th className="px-6 py-4 text-center">Points</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-xs uppercase">
                            {u.username.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold">{u.username}</p>
                            <p className="text-xs text-zinc-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                           u.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10' 
                            : 'bg-red-100 text-red-700 dark:bg-red-500/10'
                         }`}>
                           {u.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{u.streak}</td>
                      <td className="px-6 py-4 text-center font-medium">{u.total_points}</td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => toggleUserStatus(u.id, u.status)}
                           className={`p-2 rounded-lg transition-all ${
                             u.status === 'active' 
                               ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' 
                               : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                           }`}
                           title={u.status === 'active' ? 'Restrict User' : 'Allow User'}
                         >
                           {u.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
