import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, CheckCircle, ListChecks } from 'lucide-react';

interface Progress {
  date: string;
  percentage: number;
  total_tasks: number;
  completed_tasks: number;
}

export function HistoryPage() {
  const [history, setHistory] = useState<Progress[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const data = await api.get('/api/heatmap'); // Reusing heatmap endpoint for basic stats
    // Sorting by date descending
    const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
    setHistory(sorted);
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-black tracking-tighter italic text-indigo-900 leading-tight">Your History</h1>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Review Consistency & Growth</p>
      </header>

      <div className="grid gap-6">
        {history.map((record, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={record.date}
            className="bg-white p-8 rounded-[40px] border border-gray-100 flex items-center justify-between group hover:border-indigo-200 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-50"
          >
             <div className="flex items-center gap-8">
                <div className="flex flex-col items-center justify-center w-20 h-20 bg-indigo-50 rounded-[28px] border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-60">{format(new Date(record.date), 'MMM')}</span>
                  <span className="text-2xl font-black">{format(new Date(record.date), 'dd')}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight italic mb-2">
                    {format(new Date(record.date), 'EEEE')}
                  </h3>
                  <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-2">
                      <ListChecks size={14} className="text-indigo-400" />
                      {record.total_tasks || 0} TOTAL
                    </span>
                    <span className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-500" />
                      {record.completed_tasks || 0} DONE
                    </span>
                  </div>
                </div>
             </div>

             <div className="flex items-center gap-8">
               <div className="text-right">
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">{record.percentage}%</p>
                  <p className="text-[10px] uppercase font-black text-indigo-500 tracking-[0.2em]">Efficiency</p>
               </div>
               <div className={cn(
                 "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:rotate-12",
                 record.percentage === 100 ? "bg-emerald-100 text-emerald-600 shadow-emerald-100" : "bg-indigo-50 text-indigo-400 shadow-indigo-50"
               )}>
                 {record.percentage === 100 ? '🏆' : '🔥'}
               </div>
             </div>
          </motion.div>
        ))}

        {history.length === 0 && (
          <div className="text-center py-32 bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-200">
            <CalendarIcon size={64} className="mx-auto text-slate-200 mb-6 drop-shadow-sm" />
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Temporal Void • No History</p>
          </div>
        )}
      </div>
    </div>
  );
}
