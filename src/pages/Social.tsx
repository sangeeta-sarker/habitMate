
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Send, 
  Flag, 
  Trophy, 
  MessageSquare, 
  X,
  User 
} from 'lucide-react';
import { format } from 'date-fns';

interface UserSearchResult {
  id: number;
  username: string;
  total_points: number;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  text: string;
  timestamp: string;
}

export function SocialPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io();
    socketRef.current.emit('join', user?.id);

    socketRef.current.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length > 1) {
      const data = await api.get(`/api/users/search?q=${q}`);
      setSearchResults(data);
    } else {
      setSearchResults([]);
    }
  };

  const openChat = async (target: UserSearchResult) => {
    setSelectedUser(target);
    const data = await api.get(`/api/messages/${target.id}`);
    setMessages(data);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    socketRef.current?.emit('send_message', {
      senderId: user?.id,
      receiverId: selectedUser.id,
      text: newMessage
    });
    setNewMessage('');
  };

  const submitReport = async () => {
    if (!selectedUser || !reportReason) return;
    await api.post('/api/report', { reported_id: selectedUser.id, reason: reportReason });
    alert('Report submitted to admin.');
    setShowReportModal(false);
    setReportReason('');
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-8">
      {/* Sidebar: Search & Results */}
      <div className="w-80 flex flex-col gap-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search users..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm font-bold text-sm"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 bg-white rounded-[32px] border border-gray-100 p-3 overflow-y-auto shadow-sm">
          <h3 className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Search Results</h3>
          <div className="space-y-1">
            {searchResults.map((u) => (
              <button
                key={u.id}
                onClick={() => openChat(u)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group",
                  selectedUser?.id === u.id ? "bg-indigo-50 border-indigo-100" : "hover:bg-slate-50 border-transparent"
                )}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black uppercase transition-all shadow-sm group-hover:scale-110">
                  {u.username.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 text-sm truncate uppercase tracking-tight">{u.username}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                    <Trophy size={12} className="text-yellow-500" />
                    {u.total_points} PTS
                  </div>
                </div>
              </button>
            ))}
            {searchResults.length === 0 && searchQuery.length > 0 && (
              <p className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No Matches Found</p>
            )}
            {searchQuery.length === 0 && (
              <div className="p-16 flex flex-col items-center justify-center text-slate-300 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                  <User size={40} className="opacity-30" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">Search peers to <br/>sync progress</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-[40px] border border-gray-100 flex flex-col overflow-hidden shadow-sm">
        {selectedUser ? (
          <>
            <header className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-indigo-100">
                  {selectedUser.username.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">{selectedUser.username}</h4>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Live Syncing</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowReportModal(true)}
                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Flag User"
              >
                <Flag size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
              {messages.map((msgl) => {
                const isMe = msgl.sender_id === user?.id;
                return (
                  <div key={msgl.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[65%] group`}>
                      <div className={`p-5 rounded-3xl font-bold text-sm shadow-sm ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-100' 
                          : 'bg-white text-slate-800 rounded-bl-none border border-gray-100'
                      }`}>
                        <p className="leading-relaxed">{msgl.text}</p>
                      </div>
                      <p className={`text-[9px] mt-2 font-black uppercase tracking-widest px-1 ${isMe ? 'text-right text-indigo-400' : 'text-left text-slate-400'}`}>
                        {format(new Date(msgl.timestamp), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-6 bg-white border-t border-gray-50 flex gap-4">
              <input 
                type="text"
                placeholder="Message your peer..."
                className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-transparent outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-sm"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button 
                type="submit"
                className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-indigo-200 active:scale-95"
              >
                <Send size={24} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center rotate-6">
                <MessageSquare size={48} className="opacity-20" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center -rotate-12">
                💬
              </div>
            </div>
            <div className="text-center">
              <h4 className="font-black text-slate-500 text-lg uppercase tracking-tight">Silent Protocol</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1">Select a peer to initiate contact</p>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-white p-10 rounded-[48px] shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black italic text-red-600 uppercase tracking-tighter">
                  Flag Entry
                </h2>
                <button onClick={() => setShowReportModal(false)} className="text-slate-300 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Violation Details</label>
                  <textarea 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-red-500 font-bold text-sm h-32 resize-none"
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    placeholder="Provide incident report..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 px-4 py-4 rounded-2xl bg-slate-100 font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={submitReport}
                    className="flex-1 px-4 py-4 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95"
                  >
                    Flag
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
