import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';
import { ShoppingBag, Wrench, Truck, Briefcase, CreditCard, ShieldCheck, Settings, Plus, Globe, Plane, Bot } from 'lucide-react';

export default function UniversalDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/signin');
      return;
    }
    setUser(user);

    // Fetch or create profile
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
    } else {
      const { data: newProfile } = await supabase.from('profiles').insert([{ id: user.id, full_name: user.email }]).select().single();
      setProfile(newProfile);
    }
    setLoading(false);
  }

  // FIXED: Now routes verified users directly to the secure Provider Dashboard
  function handleSellClick() {
    if (profile?.tpwecan_verified) {
      router.push('/provider/dashboard');
    } else {
      router.push('/tpwecan-verify');
    }
  }

  // Don't render buttons until profile is loaded to prevent errors
  if (loading || !profile) {
    return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading your dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <Head><title>My Dashboard — TPMarket</title></Head>

      {/* HEADER */}
      <div className="bg-[#1E293B] p-6 border-b border-white/10">
        <h1 className="text-2xl font-black text-white">Welcome, {profile?.full_name || 'User'}!</h1>
        <p className="text-slate-400 text-sm">Manage your entire TPMarket experience.</p>
        {profile?.tpwecan_verified && (
          <div className="mt-3 inline-flex items-center gap-1 bg-[#ccff00]/20 text-[#ccff00] px-3 py-1 rounded-full text-xs font-bold">
            <ShieldCheck size={14} /> Certified TPwecan Provider
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        
        <h2 className="text-lg font-bold text-white mb-2">What do you want to do today?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          
          {/* 1. Shop / Buy */}
          <button onClick={() => router.push('/marketplace')} className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all text-left">
            <ShoppingBag className="text-[#ccff00] mb-3" size={28} />
            <h3 className="font-bold text-white">Shop & Buy</h3>
            <p className="text-xs text-slate-400 mt-1">Browse marketplace</p>
          </button>

          {/* 2. Sell / Publish (GATED - FIXED) */}
          <button onClick={handleSellClick} className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all text-left">
            <Wrench className="text-[#ccff00] mb-3" size={28} />
            <h3 className="font-bold text-white">{profile?.tpwecan_verified ? 'Publish Service' : 'Register TPwecan ID'}</h3>
            <p className="text-xs text-slate-400 mt-1">{profile?.tpwecan_verified ? 'Go to secure dashboard' : 'Unlock selling'}</p>
          </button>

          {/* 3. Register Equipment (NEW!) */}
          <Link href="/equipment-register" className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all text-left block">
            <Plus className="text-[#ccff00] mb-3" size={28} />
            <h3 className="font-bold text-white">Register Equipment</h3>
            <p className="text-xs text-slate-400 mt-1">Add your first item</p>
          </Link>

          {/* 4. My Equipment */}
          <button onClick={() => router.push('/equipment/dashboard')} className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all text-left">
            <Settings className="text-[#ccff00] mb-3" size={28} />
            <h3 className="font-bold text-white">My Equipment</h3>
            <p className="text-xs text-slate-400 mt-1">Track maintenance</p>
          </button>

          {/* 5. Delivery Jobs */}
          <button onClick={() => router.push('/delivery/dashboard')} className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all text-left">
            <Truck className="text-[#ccff00] mb-3" size={28} />
            <h3 className="font-bold text-white">Delivery Jobs</h3>
            <p className="text-xs text-slate-400 mt-1">Earn on the go</p>
          </button>

          {/* 6. Job Seeker */}
          <button onClick={() => router.push('/jobs/dashboard')} className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all text-left">
            <Briefcase className="text-[#ccff00] mb-3" size={28} />
            <h3 className="font-bold text-white">Find Work</h3>
            <p className="text-xs text-slate-400 mt-1">Browse job posts</p>
          </button>

          {/* 7. Payout Settings */}
          <button onClick={() => router.push('/dashboard/payout')} className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all text-left">
            <CreditCard className="text-[#ccff00] mb-3" size={28} />
            <h3 className="font-bold text-white">Payout Settings</h3>
            <p className="text-xs text-slate-400 mt-1">Add bank details</p>
          </button>

          {/* 8. Global Dropshipping (NEW!) */}
          <Link href="/provider/dropshipping" className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all text-left block">
            <Globe className="text-[#ccff00] mb-3" size={28} />
            <h3 className="font-bold text-white">Global Dropshipping</h3>
            <p className="text-xs text-slate-400 mt-1">Sell without inventory</p>
          </Link>

          {/* 9. Export from Nigeria (NEW!) */}
          <Link href="/provider/export" className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all text-left block">
            <Plane className="text-[#ccff00] mb-3" size={28} />
            <h3 className="font-bold text-white">Export from Nigeria</h3>
            <p className="text-xs text-slate-400 mt-1">Reach global buyers</p>
          </Link>

          {/* 10. TP AI Assist (NEW!) */}
          <Link href="/ai-assist" className="relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-4 rounded-2xl border border-[#ccff00]/30 hover:border-[#ccff00] hover:scale-[1.02] transition-all text-left block overflow-hidden group">
            <div className="absolute top-0 right-0 bg-[#ccff00] text-[#0F172A] text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
              AI POWERED
            </div>
            <Bot className="text-[#ccff00] mb-3 group-hover:animate-pulse" size={28} />
            <h3 className="font-bold text-white">TP AI Assist</h3>
            <p className="text-xs text-slate-400 mt-1">Diagnose & Find Parts</p>
          </Link>

        </div>
      </div>
      <BottomNav />
    </div>
  );
}