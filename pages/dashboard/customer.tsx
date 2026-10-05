import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Coins, Package, CheckCircle2, Clock, ChevronRight, Copy, MessageCircle, Check, Gift } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';
import StatCard from '../../components/StatCard';
import BottomNav from '../../components/BottomNav';
import { useRequireAuth } from '../../hooks/useAuth';

const referralLink = 'tpmarket.com/ref/AMARA123';

const orders = [
  { id: 'ORD-1042', item: 'Custom Agbada — Blue Damask', provider: 'Kunle Tailors', status: 'In Progress', eta: '2 days' },
  { id: 'ORD-1039', item: 'Wedding Aso-Ebi Set (x4)', provider: 'Chidinma Styles', status: 'Awaiting Pickup', eta: 'Ready' },
  { id: 'ORD-1031', item: 'Native Senator Wear', provider: 'Baba Tunde Fashion', status: 'Completed', eta: 'Delivered' },
];

const statusColor: Record<string, string> = {
  'In Progress': 'text-yellow bg-yellow/10',
  'Awaiting Pickup': 'text-purple bg-purple/10',
  Completed: 'text-lemon bg-lemon/10',
};

export default function CustomerDashboard() {
  const { checked, logout } = useRequireAuth();
  const [copied, setCopied] = useState(false);

  function handleCopyLink() {
    navigator.clipboard?.writeText(`https://${referralLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const whatsappText = encodeURIComponent(`Join me on TPMarket! Use my link to sign up: https://${referralLink}`);

  if (!checked) return null;

  return (
    <PageShell>
      <Head>
        <title>Customer Dashboard — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-6xl mx-auto px-6 py-10 pb-28 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">Welcome back, Amara 👋</h1>
            <p className="text-[#64748B] font-medium">Here's what's happening with your orders today.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/provider" className="hidden sm:inline-block text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors">
              Switch to Provider View →
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-bold text-white bg-darkcard px-4 py-2 rounded-full hover:bg-[#1E293B] transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* CREDIT COINS HERO */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_0_50px_rgba(250,204,21,0.2)] mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow/10 text-yellow flex items-center justify-center shrink-0">
              <Coins size={28} />
            </div>
            <div>
              <p className="text-slate text-xs font-bold uppercase tracking-wide">Credit Coins Balance</p>
              <p className="text-white font-black text-4xl">2,480</p>
            </div>
          </div>
        </div>

        {/* REFERRAL SECTION */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 mb-10">
          <h2 className="flex items-center gap-2 text-white font-black text-lg mb-1">
            <Gift className="text-purple" size={20} /> Invite Friends & Earn Coins!
          </h2>
          <p className="text-slate text-xs mb-5">Earn 50 Credit Coins for every friend who joins!</p>

          <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 mb-4">
            <p className="text-slate text-[10px] font-bold uppercase tracking-wide mb-1">Your Referral Link</p>
            <p className="text-white font-black text-sm truncate">{referralLink}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 bg-lemon text-[#0F172A] font-black py-3.5 rounded-full hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-black py-3.5 rounded-full hover:scale-[1.02] transition-all"
            >
              <MessageCircle size={18} /> Share to WhatsApp
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <StatCard icon={Coins} label="TP Coins" value="2,480" accent="yellow" />
          <StatCard icon={Package} label="Active Orders" value="2" accent="lemon" />
          <StatCard icon={CheckCircle2} label="Completed Jobs" value="17" accent="purple" />
        </div>

        <div className="bg-darkcard rounded-3xl p-6 border border-white/10">
          <h2 className="text-lg font-black text-white mb-5">Recent Activity 📦</h2>
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-4 bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{order.item}</p>
                  <p className="text-slate text-sm">
                    {order.provider} · {order.id}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusColor[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="hidden sm:flex items-center gap-1 text-slate text-xs">
                    <Clock size={14} /> {order.eta}
                  </span>
                  <ChevronRight className="text-slate" size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </PageShell>
  );
}
