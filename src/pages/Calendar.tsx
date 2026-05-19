
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { Plus, Bell, MapPin, Clock } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
}

export function CalendarPage() {
  const { user } = useAuth();
  const [date, setDate] = useState<any>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const data = await api.get('/api/events');
    setEvents(data);
  };

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.time) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    const res = await api.post('/api/events', { 
      title: newEvent.title, 
      date: dateStr, 
      time: newEvent.time 
    });
    setEvents([...events, res]);
    setNewEvent({ title: '', time: '' });
    setShowAddModal(false);
  };

  const selectedDateStr = format(date, 'yyyy-MM-dd');
  const dayEvents = events.filter(e => e.date === selectedDateStr);
  const startDay = user?.created_at ? format(new Date(user.created_at), 'yyyy-MM-dd') : null;

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black tracking-tighter italic text-indigo-900 leading-tight">Event Calendar</h1>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Plan & Track Milestones</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 custom-calendar">
            <Calendar 
              onChange={setDate} 
              value={date} 
              className="w-full border-none font-sans"
              tileClassName={({ date, view }) => {
                if (view === 'month') {
                  const dStr = format(date, 'yyyy-MM-dd');
                  if (dStr === startDay) return 'theme-start-date';
                  if (events.find(e => e.date === dStr)) return 'theme-has-event';
                }
                return null;
              }}
            />
          </div>

          <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 text-indigo-800 text-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
              <Bell size={20} />
            </div>
            <div>
               <p className="font-black uppercase tracking-wider text-xs mb-1">Smart Reminders</p>
               <p className="font-bold text-indigo-600/80">Notifications active for goals within 30 mins.</p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black italic text-indigo-900">Agenda • {format(date, 'MMM do')}</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-indigo-200"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {dayEvents.map(event => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={event.id}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-gray-800 text-lg leading-tight uppercase tracking-tight">{event.title}</h3>
                  <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Clock size={16} />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-500">
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    Remote
                  </span>
                </div>
              </motion.div>
            ))}

            {dayEvents.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Relax • No Tasks</p>
              </div>
            )}
            
            {startDay === selectedDateStr && (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden">
                 <p className="font-black text-lg flex items-center gap-2 relative z-10">
                   🚀 Day Zero
                 </p>
                 <p className="text-indigo-100 text-xs mt-1 font-bold relative z-10">This is where your HabitMate journey began.</p>
                 <div className="absolute -right-4 -bottom-4 text-white/10 text-6xl">✨</div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white p-10 rounded-[48px] shadow-2xl border border-gray-100"
          >
            <h2 className="text-2xl font-black italic text-indigo-900 mb-6 text-center">New Event</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Event Title</label>
                <input 
                  type="text"
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="e.g. Deep Work Session"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Execution Time</label>
                <input 
                  type="time"
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                  value={newEvent.time}
                  onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-4 rounded-2xl bg-slate-100 font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={addEvent}
                  className="flex-1 px-4 py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        .custom-calendar .react-calendar {
          background: transparent;
          border: none;
          width: 100%;
        }
        .custom-calendar .react-calendar__navigation button {
          font-weight: 900;
          font-style: italic;
          color: #312e81;
          font-size: 1.25rem;
          text-transform: uppercase;
        }
        .custom-calendar .react-calendar__month-view__weekdays__weekday {
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          color: #94a3b8;
          padding-bottom: 1rem;
        }
        .custom-calendar .react-calendar__tile {
          padding: 1.5rem 0.5rem;
          font-weight: 700;
          font-size: 0.875rem;
          color: #475569;
          transition: all 0.2s;
          border-radius: 1.5rem;
        }
        .custom-calendar .react-calendar__tile:enabled:hover {
          background: #eef2ff;
          color: #4f46e5;
        }
        .custom-calendar .react-calendar__tile--now {
          background: #e0e7ff !important;
          color: #4f46e5 !important;
        }
        .custom-calendar .react-calendar__tile--active {
          background: #4f46e5 !important;
          color: white !important;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
        }
        .theme-start-date {
          border: 3px solid #10b981 !important;
          font-weight: 900 !important;
        }
        .theme-has-event {
          color: #4f46e5 !important;
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-thickness: 3px;
        }
      `}</style>
    </div>
  );
}
