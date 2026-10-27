import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';
import { Briefcase, ShoppingBag, LogOut, Settings, Wallet } from 'lucide-react';

export default function AccountHub() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('customer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setRole(user.user_metadata?.role || 'customer');
      } else {
        router.push('/signin');
      }
      setLoading(false);
    }
    checkUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/signin');
  }

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <Head><title>My Account — TPMarket</title></Head>

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-6 border-b border-white/10">
        <h1 className="text-2xl font-black text-white">My Account</h1>
        <p className="text-slate-400 text-sm">{user?.email}</p>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* DUAL ROLE DASHBOARD SELECTOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* CUSTOMER VIEW CARD */}
          <button 
            onClick={() => router.push('/customer/dashboard')}
            className="bg-[#1E293B] p-6 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#ccff00]/10 text-[#ccff00] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-lg font-black text-white mb-1">Customer View</h3>
            <p className="text-sm text-slate-400">View your requests, accepted quotations, active jobs, and 90-day guarantees.</p>
          </button>

          {/* PROVIDER VIEW CARD (Only shows if user is a provider) */}
          {role === 'provider' && (
            <button 
              onClick={() => router.push('/provider/dashboard')}
              className="bg-[#1E293B] p-6 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase size={24} />
              </div>
              <h3 className="text-lg font-black text-white mb-1">Provider Business</h3>
              <p className="text-sm text-slate-400">Manage your published services, view incoming customer requests, and send quotations.</p>
            </button>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-[#1E293B] rounded-2xl border border-white/10 overflow-hidden">
          <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5">
            <Wallet className="text-[#ccff00]" size={20} />
            <span className="font-bold text-white">Wallet & TP Coins</span>
          </button>
          <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5">
            <Settings className="text-slate-400" size={20} />
            <span className="font-bold text-white">Account Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 hover:bg-red-500/10 transition-colors text-red-400"
          >
            <LogOut size={20} />
            <span className="font-bold">Sign Out</span>
          </button>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}