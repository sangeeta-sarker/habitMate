import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { Heatmap } from '../components/Heatmap';
import { useTime } from '../lib/timeContext';
import { motion } from 'motion/react';
import { 
  Flame, 
  Trophy, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Quote,
  Clock,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  date: string;
}

interface Label {
  id: number;
  title: string;
  tasks: Task[];
}

export function DashboardPage() {
  const { user } = useAuth();
  const { now } = useTime();
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [heatmapData, setHeatmapData] = useState([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabelTitle, setNewLabelTitle] = useState('');
  const [newTaskText, setNewTaskText] = useState<{ [key: number]: string }>({});

  const todayStr = format(now, 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
  }, [todayStr]);

  const fetchData = async () => {
    const [quoteData, heatmapRes, labelsRes] = await Promise.all([
      api.get('/api/motivation'),
      api.get('/api/heatmap'),
      api.get(`/api/labels?date=${todayStr}`),
    ]);
    setQuote(quoteData);
    setHeatmapData(heatmapRes);
    setLabels(labelsRes);
  };

  const addLabel = async () => {
    if (!newLabelTitle.trim()) return;
    const newLabel = await api.post('/api/labels', { title: newLabelTitle, date: todayStr });
    setLabels([...labels, newLabel]);
    setNewLabelTitle('');
  };

  const addTask = async (labelId: number) => {
    const text = newTaskText[labelId];
    if (!text?.trim()) return;
    const newTask = await api.post('/api/tasks', { label_id: labelId, text, date: todayStr });
    
    setLabels(labels.map(l => 
      l.id === labelId ? { ...l, tasks: [...l.tasks, newTask] } : l
    ));
    setNewTaskText({ ...newTaskText, [labelId]: '' });
  };

  const toggleTask = async (taskId: number, completed: boolean) => {
    try {
      await api.patch(`/api/tasks/${taskId}`, { completed: !completed });
      setLabels(labels.map(l => ({
        ...l,
        tasks: l.tasks.map(t => t.id === taskId ? { ...t, completed: !completed } : t)
      })));
      
      const heatmapRes = await api.get('/api/heatmap');
      setHeatmapData(heatmapRes);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const calculateProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header handled by Layout */}

      {/* Motivation */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden text-center group"
      >
       
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Daily Inspiration</h2>
          <p className="text-3xl font-serif italic py-2 leading-tight">"{quote.text}"</p>
          <p className="mt-4 text-white/70 font-bold uppercase tracking-widest text-xs">— {quote.author}</p>
        </div>
      </motion.div>

      {/* Heatmap Section */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl font-black italic text-indigo-900">Consistency Heatmap</h2>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Live Tracking</span>
        </div>
        <Heatmap data={heatmapData} />
      </section>

      {/* Tasks Section */}
      <div className="grid grid-cols-12 gap-8">
        <section className="col-span-12 lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black italic text-indigo-900 flex items-center gap-2">
              Today's Tasks
            </h2>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
            <div className="flex justify-between items-center bg-indigo-50 px-4 py-3 rounded-2xl border border-indigo-100">
               <span className="text-indigo-600 font-black text-xs uppercase tracking-wider">Overall Progress</span>
               <span className="text-indigo-700 font-black text-lg">{labels.length > 0 ? labels.reduce((acc, l) => acc + calculateProgress(l.tasks), 0) / labels.length : 0}%</span>
            </div>

            <div className="relative flex items-center gap-2">
               <input 
                type="text" 
                placeholder="Add new list title..."
                className="w-full text-xs px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={newLabelTitle}
                onChange={e => setNewLabelTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addLabel()}
               />
               <button onClick={addLabel} className="p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                 <Plus size={18} />
               </button>
            </div>

            <div className="space-y-4">
              {labels.map((label) => (
                <div key={label.id} className="group">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">{label.title}</p>
                  <div className="space-y-1">
                    {label.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id, task.completed)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-all group/item text-left border border-transparent hover:border-indigo-100"
                      >
                        <input 
                          type="checkbox" 
                          checked={task.completed}
                          readOnly
                          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className={cn(
                          "text-sm font-bold transition-all",
                          task.completed ? "text-gray-400 line-through" : "text-gray-700"
                        )}>
                          {task.text}
                        </span>
                      </button>
                    ))}

                    <div className="mt-2 pl-10 pr-2 flex items-center gap-2">
                      <input 
                        type="text"
                        placeholder="Add task..."
                        className="flex-1 text-xs bg-transparent border-none outline-none text-gray-500 font-bold"
                        value={newTaskText[label.id] || ''}
                        onChange={e => setNewTaskText({ ...newTaskText, [label.id]: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && addTask(label.id)}
                      />
                      {newTaskText[label.id] && (
                        <button onClick={() => addTask(label.id)} className="text-indigo-500 hover:text-indigo-600">
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {labels.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No Active Habits</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Section / Info Items */}
        <section className="col-span-12 lg:col-span-8 space-y-6">
           <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black italic text-indigo-900">Performance Summary</h2>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="bg-indigo-50 rounded-3xl p-6 flex flex-col justify-between border border-indigo-100 shadow-sm min-h-[160px]">
                <div className="w-12 h-12 bg-indigo-200 rounded-2xl flex items-center justify-center text-2xl mb-4">📅</div>
                <div>
                  <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mb-1">Upcoming Milestone</p>
                  <p className="text-base font-black text-indigo-900">30 Day Streak Achievement</p>
                </div>
              </div>
              <div className="bg-emerald-50 rounded-3xl p-6 flex flex-col justify-between border border-emerald-100 shadow-sm min-h-[160px]">
                <div className="w-12 h-12 bg-emerald-200 rounded-2xl flex items-center justify-center text-2xl mb-4">⭐</div>
                <div>
                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-1">Points Reward</p>
                  <p className="text-base font-black text-emerald-900">+10 Points pending wrap-up</p>
                </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Efficiency Rating</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">
                    {heatmapData.find(d => d.date === todayStr)?.percentage || 0}%
                  </span>
                  <span className="text-emerald-500 font-black text-sm uppercase">Optimized</span>
                </div>
              </div>
              <div className="h-16 w-[1px] bg-gray-100 mx-8" />
              <div className="flex-1 flex justify-around">
                <div className="text-center">
                  <p className="text-2xl font-black text-indigo-600">{user?.total_points}</p>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Total Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-orange-500">{user?.streak}</p>
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Best Streak</p>
                </div>
              </div>
           </div>
        </section>
      </div>

        {/* Floating Action Button mimic from theme */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:bg-indigo-700 transition">
          💬
        </button>
      </div>
    </div>
  );
}