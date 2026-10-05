import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Wallet, Percent, Gift, Users, BarChart3 } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

interface PlatformUser {
  name: string;
  phone: string;
  email: string;
  role: 'Customer' | 'Provider';
  active: boolean;
}

const initialUsers: PlatformUser[] = [
  { name: 'Amara Okafor', phone: '+234 801 234 5678', email: 'amara@example.com', role: 'Customer', active: true },
  { name: 'Kunle Adebayo', phone: '+234 706 335 1745', email: 'kunle@example.com', role: 'Provider', active: true },
  { name: 'Chidinma Eze', phone: '+234 802 111 2222', email: 'chidinma@example.com', role: 'Customer', active: true },
  { name: 'Tunde Bakare', phone: '+234 803 333 4444', email: 'tunde@example.com', role: 'Provider', active: true },
  { name: 'Ifeanyi Obi', phone: '+234 804 555 6666', email: 'ifeanyi@example.com', role: 'Provider', active: true },
  { name: 'Amaka Nwosu', phone: '+234 805 777 8888', email: 'amaka@example.com', role: 'Provider', active: true },
  { name: 'Baba Tunde', phone: '+234 806 999 0000', email: 'babatunde@example.com', role: 'Provider', active: true },
  { name: 'Segun Alabi', phone: '+234 807 111 3333', email: 'segun@example.com', role: 'Provider', active: true },
  { name: 'Ngozi Chukwu', phone: '+234 808 222 4444', email: 'ngozi@example.com', role: 'Provider', active: true },
  { name: 'Tobi Adeyemi', phone: '+234 809 333 5555', email: 'tobi@example.com', role: 'Customer', active: true },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);

  function toggleUser(index: number) {
    setUsers((prev) => prev.map((u, i) => (i === index ? { ...u, active: !u.active } : u)));
  }

  const activeCount = users.filter((u) => u.active).length;

  return (
    <PageShell>
      <Head>
        <title>Admin Dashboard — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-5xl mx-auto px-6 py-10 relative">
        <Link href="/" className="flex items-center gap-1 text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors mb-6">
          <ArrowLeft size={16} /> Back Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">Admin Dashboard 🛡️</h1>
        <p className="text-[#64748B] font-medium mb-8">Platform overview and user management.</p>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-darkcard rounded-3xl p-5 border border-white/10 shadow-[0_0_40px_rgba(204,255,0,0.15)]">
            <div className="w-10 h-10 rounded-xl bg-lemon/10 text-lemon flex items-center justify-center mb-3">
              <Wallet size={18} />
            </div>
            <p className="text-slate text-xs mb-1">Total Income</p>
            <p className="text-white font-black text-xl">₦4,820,000</p>
          </div>
          <div className="bg-darkcard rounded-3xl p-5 border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.2)]">
            <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center mb-3">
              <Percent size={18} />
            </div>
            <p className="text-slate text-xs mb-1">Total Commission</p>
            <p className="text-white font-black text-xl">₦482,000</p>
          </div>
          <div className="bg-darkcard rounded-3xl p-5 border border-white/10 shadow-[0_0_40px_rgba(250,204,21,0.2)]">
            <div className="w-10 h-10 rounded-xl bg-yellow/10 text-yellow flex items-center justify-center mb-3">
              <Gift size={18} />
            </div>
            <p className="text-slate text-xs mb-1">Total Referral Bonus</p>
            <p className="text-white font-black text-xl">₦96,400</p>
          </div>
          <div className="bg-darkcard rounded-3xl p-5 border border-white/10 shadow-[0_0_40px_rgba(135,206,235,0.2)]">
            <div className="w-10 h-10 rounded-xl bg-sky/10 text-sky flex items-center justify-center mb-3">
              <Users size={18} />
            </div>
            <p className="text-slate text-xs mb-1">Active Users</p>
            <p className="text-white font-black text-xl">1,240</p>
          </div>
        </div>

        {/* USER MANAGEMENT */}
        <div className="bg-darkcard rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] p-5 sm:p-6 mb-6">
          <h2 className="text-white font-black text-lg mb-1">User Management 👥</h2>
          <p className="text-slate text-xs mb-5">
            {activeCount} of {users.length} shown users are active. Toggle off to ban a user.
          </p>

          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="text-left text-slate text-[11px] font-bold uppercase tracking-wide">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Access</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.email} className="border-t border-white/10">
                    <td className="py-3 pr-4">
                      <p className="text-white font-bold text-sm">{u.name}</p>
                      <p className="text-slate text-[10px] font-semibold">{u.role}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate text-xs">{u.phone}</td>
                    <td className="py-3 pr-4 text-slate text-xs">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-[10px] font-black px-3 py-1.5 rounded-full ${
                          u.active ? 'bg-lemon/10 text-lemon' : 'bg-white/10 text-slate'
                        }`}
                      >
                        {u.active ? 'Active' : 'Banned/Pending'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => toggleUser(i)}
                        aria-label={`Toggle access for ${u.name}`}
                        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${u.active ? 'bg-lemon' : 'bg-white/15'}`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-[#0F172A] transition-all ${u.active ? 'left-6' : 'left-1'}`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Link
          href="/admin/financials"
          className="flex items-center justify-center gap-2 w-full bg-lemon text-[#0F172A] font-black py-4 rounded-full hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all"
        >
          <BarChart3 size={18} /> View Financials
        </Link>
      </div>
    </PageShell>
  );
}
