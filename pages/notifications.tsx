import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Bell, ShieldCheck, Wrench, Gift, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    fetchNotifications();
  }

  // Helper to get the right icon based on notification type
  function getIcon(type: string) {
    switch (type) {
      case 'quote': return Wrench;
      case 'order': return ShieldCheck;
      case 'reward': return Gift;
      default: return Bell;
    }
  }

  // Helper to format time
  function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <Head>
        <title>Notifications — TPMarket</title>
      </Head>

      {/* HEADER */}
      <div className="bg-[#1E293B] p-6 border-b border-white/10 sticky top-0 z-30">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Bell className="text-[#ccff00]" /> Notifications
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {loading ? (
          <p className="text-center text-slate-400 py-20">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          // EMPTY STATE
          <div className="text-center py-20 bg-[#1E293B] rounded-2xl border border-white/10">
            <Bell size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-white font-bold text-lg">All caught up!</p>
            <p className="text-slate-400 text-sm mt-2">You have no new notifications.</p>
          </div>
        ) : (
          // NOTIFICATIONS LIST
          <div className="space-y-3">
            {notifications.map((n) => {
              const Icon = getIcon(n.type);
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 rounded-2xl p-4 border transition-all ${
                    n.is_read 
                      ? 'bg-[#1E293B] border-white/10' 
                      : 'bg-[#ccff00]/10 border-[#ccff00]/30'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    n.is_read ? 'bg-white/10 text-slate-400' : 'bg-[#ccff00]/20 text-[#ccff00]'
                  }`}>
                    <Icon size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{n.title}</p>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                    </div>
                    <p className="text-slate-300 text-xs mt-0.5">{n.message}</p>
                    <div className="flex justify-between items-center mt-1.5">
                      <p className="text-slate-500 text-[10px]">{timeAgo(n.created_at)}</p>
                      {!n.is_read && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="flex items-center gap-1 text-[#ccff00] text-[10px] font-bold hover:underline"
                        >
                          <CheckCircle size={12} /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}