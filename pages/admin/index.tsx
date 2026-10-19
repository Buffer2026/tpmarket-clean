import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import { Users, Package, DollarSign, TrendingUp, Plus, Shield, UserPlus, FileText } from 'lucide-react';

// ️ THIS IS THE EMAIL THAT IS ALLOWED IN
const ADMIN_EMAIL = "cdmcafrica@gmail.com"; 

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [stats, setStats] = useState({ users: 0, listings: 0, revenue: 0 });
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerType, setPartnerType] = useState('lifetime');
  const [commission, setCommission] = useState(10);
  const [visibleMetrics, setVisibleMetrics] = useState({ sales: true, commissions: true, vat: false, tax: false, members: true });

  useEffect(() => {
    async function checkAccessAndLoadData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      // DEBUGGER: This will tell us exactly what email the system sees
      console.log("CURRENT LOGGED IN EMAIL:", user?.email);
      console.log("EXPECTED ADMIN EMAIL:", ADMIN_EMAIL);

      if (!user) {
        router.push('/signin');
        return;
      }

      if (user.email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
        // This alert will tell you EXACTLY why you are being blocked
        alert(`🚫 Access Denied!\n\nYou are currently logged in as: ${user.email}\nBut the Admin Email is: ${ADMIN_EMAIL}\n\nPlease LOG OUT and log back in with the correct admin email.`);
        router.push('/');
        return;
      }

      setIsAuthorized(true);
      await fetchStats();
    }

    checkAccessAndLoadData();
  }, []);

  async function fetchStats() {
    setLoading(true);
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: listingCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { data: txData } = await supabase.from('transactions').select('platform_commission');
    const totalRevenue = txData?.reduce((sum, tx) => sum + (tx.platform_commission || 0), 0) || 0;

    setStats({ users: userCount || 0, listings: listingCount || 0, revenue: totalRevenue });
    setLoading(false);
  }

  async function handleAddPartner(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('partners').insert([{
      partner_name: partnerName,
      partner_type: partnerType,
      commission_percentage: commission,
      visible_metrics: visibleMetrics,
      status: 'active'
    }]);

    if (error) {
      alert('Error adding partner: ' + error.message);
    } else {
      alert('✅ Partner added successfully!');
      setShowPartnerForm(false);
      setPartnerName(''); setPartnerEmail('');
    }
    setLoading(false);
  }

  if (!isAuthorized) {
    return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white font-bold">Verifying Access...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex">
      <Head><title>Super Admin — TPMarket</title></Head>

      <div className="w-64 bg-[#1E293B] border-r border-white/10 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-black text-[#ccff00]">TPMARKET</h1>
          <p className="text-xs text-slate-400 mt-1">Super Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-[#ccff00] text-[#0F172A] font-bold' : 'text-slate-400 hover:bg-white/5'}`}>
            <TrendingUp size={18} /> Overview
          </button>
          <button onClick={() => setActiveTab('partners')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'partners' ? 'bg-[#ccff00] text-[#0F172A] font-bold' : 'text-slate-400 hover:bg-white/5'}`}>
            <UserPlus size={18} /> Partners
          </button>
          <button onClick={() => setActiveTab('referrals')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'referrals' ? 'bg-[#ccff00] text-[#0F172A] font-bold' : 'text-slate-400 hover:bg-white/5'}`}>
            <FileText size={18} /> Referrals
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-2 text-slate-400 hover:text-white text-sm">
            ← Back to Website
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="md:hidden flex justify-between items-center mb-6">
          <h1 className="text-xl font-black text-[#ccff00]">TPMARKET ADMIN</h1>
          <button onClick={() => router.push('/')} className="text-slate-400 text-sm">Exit</button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1E293B] p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl"><Users className="text-blue-400" size={24} /></div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Registered Members</p>
                    <p className="text-3xl font-black text-white">{stats.users}</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#1E293B] p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#ccff00]/20 rounded-xl"><Package className="text-[#ccff00]" size={24} /></div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Active Listings</p>
                    <p className="text-3xl font-black text-white">{stats.listings}</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#1E293B] p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl"><DollarSign className="text-green-400" size={24} /></div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Platform Revenue</p>
                    <p className="text-3xl font-black text-white">₦{stats.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">Partner Management</h2>
              <button onClick={() => setShowPartnerForm(!showPartnerForm)} className="flex items-center gap-2 bg-[#ccff00] text-[#0F172A] font-bold px-4 py-2 rounded-xl hover:scale-105 transition-all">
                <Plus size={18} /> Add New Partner
              </button>
            </div>

            {showPartnerForm && (
              <form onSubmit={handleAddPartner} className="bg-[#1E293B] p-6 rounded-2xl border border-[#ccff00]/30 space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Create Partner Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="Partner Full Name" className="bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                  <input required type="email" value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)} placeholder="Partner Email" className="bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={partnerType} onChange={e => setPartnerType(e.target.value)} className="bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                    <option value="lifetime">Lifetime Partner</option>
                    <option value="temporary">Temporary (Expiring)</option>
                    <option value="jointly_owned">Jointly Owned</option>
                  </select>
                  <input required type="number" value={commission} onChange={e => setCommission(parseFloat(e.target.value))} placeholder="Commission %" className="bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                </div>
                
                <div className="bg-[#0F172A] p-4 rounded-xl border border-white/10">
                  <p className="text-xs font-bold text-[#ccff00] mb-3 uppercase">Visible Metrics for Partner:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.keys(visibleMetrics).map((key) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-white cursor-pointer">
                        <input type="checkbox" checked={visibleMetrics[key as keyof typeof visibleMetrics]} onChange={() => setVisibleMetrics({...visibleMetrics, [key]: !visibleMetrics[key as keyof typeof visibleMetrics]})} className="w-4 h-4 accent-[#ccff00]" />
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-[#ccff00] text-[#0F172A] font-black py-3 rounded-xl hover:scale-[1.02] transition-all">Save Partner</button>
                  <button type="button" onClick={() => setShowPartnerForm(false)} className="flex-1 bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all">Cancel</button>
                </div>
              </form>
            )}

            <div className="bg-[#1E293B] rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#0F172A] text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="p-4">Partner Name</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Commission</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">No partners added yet. Click "Add New Partner" above.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white">Referral Management</h2>
            <div className="bg-[#1E293B] rounded-2xl border border-white/10 p-8 text-center">
              <Shield className="mx-auto text-slate-500 mb-4" size={48} />
              <p className="text-slate-400">Referral tracking is active. Commissions will appear here as users invite others.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}