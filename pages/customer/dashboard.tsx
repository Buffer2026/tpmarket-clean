import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Search, Shield, Plus, MessageCircle, ChevronDown, ChevronUp, Lock, Briefcase, Download, Check, X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

export default function UnifiedDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isWecanCertified, setIsWecanCertified] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  
  // Accordion State (Only one section open at a time to prevent scrolling)
  const [openSection, setOpenSection] = useState('requests'); 

  // Publish Form States
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCategory, setPCategory] = useState('Mechanics');
  const [pDesc, setPDesc] = useState('');

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // 1. Check TP WECAN Certification
        const { data: profile } = await supabase.from('profiles').select('wecan_certified').eq('id', user.id).single();
        setIsWecanCertified(profile?.wecan_certified || false);

        // 2. Fetch Customer Requests
        const { data: custRequests } = await supabase.from('quote_requests').select('*').eq('customer_id', user.id).order('created_at', { ascending: false });
        if (custRequests) setRequests(custRequests);

        // 3. Fetch Provider Listings (If certified)
        if (profile?.wecan_certified) {
          const { data: listings } = await supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
          if (listings) setMyListings(listings);
        }
      }
    }
    loadData();
  }, []);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!isWecanCertified) return alert("You must be TP WECAN certified to publish.");
    
    const { error } = await supabase.from('products').insert([{
      seller_id: user.id, name: pName, price: parseFloat(pPrice), category: pCategory, description: pDesc,
      seller_name: user.user_metadata?.full_name || user.email, location: 'Lagos, Nigeria'
    }]);

    if (!error) {
      alert('✅ Service Published!');
      setPName(''); setPPrice(''); setPDesc('');
      setShowPublishForm(false);
      // Refresh listings
      const { data } = await supabase.from('products').select('*').eq('seller_id', user.id);
      if (data) setMyListings(data);
    } else {
      alert('Error publishing.');
    }
  }

  const SectionHeader = ({ id, title, icon: Icon, color }: any) => (
    <button 
      onClick={() => toggleSection(id)}
      className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
        openSection === id ? `bg-${color}/10 border-${color}/30` : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}/20 text-${color} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <h3 className="text-white font-black text-lg">{title}</h3>
      </div>
      {openSection === id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
    </button>
  );

  return (
    <PageShell>
      <Head><title>My Dashboard — TPMarket</title></Head>
      <LandingNavbar />

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        {/* WELCOME HEADER */}
        <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-6 rounded-3xl border border-white/10 mb-6">
          <h1 className="text-2xl font-black text-white">Welcome, {user?.user_metadata?.full_name || 'User'} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your requests, equipment, and business.</p>
          {isWecanCertified && (
            <span className="inline-block mt-3 bg-[#ccff00]/20 text-[#ccff00] text-xs font-black px-3 py-1 rounded-full border border-[#ccff00]/30">
              ✅ Certified TP WECAN Provider
            </span>
          )}
        </div>

        {/* SECTION 1: MY REQUESTS (Customer View) */}
        <SectionHeader id="requests" title="My Requests & Quotations" icon={MessageCircle} color="blue" />
        {openSection === 'requests' && (
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-4 space-y-4">
            {requests.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No active requests. <Link href="/marketplace" className="text-[#ccff00] underline">Browse Marketplace</Link></p>
            ) : (
              requests.map((req: any) => (
                <div key={req.id} className="bg-[#0F172A] p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between mb-2">
                    <span className="text-white font-bold text-sm">{req.request_type === 'negotiate' ? '💰 Negotiation' : '📋 Quote Request'}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${req.status === 'quoted' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {req.status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mb-3 italic">"{req.description}"</p>
                  {req.status === 'quoted' && (
                    <div className="bg-[#ccff00]/10 p-3 rounded-lg border border-[#ccff00]/30 flex justify-between items-center">
                      <div>
                        <p className="text-[#ccff00] font-black text-lg">₦{req.quoted_amount?.toLocaleString()}</p>
                        <p className="text-slate-400 text-[10px]">{req.job_duration_days} Days Duration</p>
                      </div>
                      <button className="bg-[#ccff00] text-[#0F172A] text-xs font-black px-4 py-2 rounded-full">Accept</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* SECTION 2: PUBLISH A SERVICE (Provider View - Gated by WECAN) */}
        <SectionHeader id="publish" title="Publish a Service / Provider Hub" icon={Briefcase} color="purple" />
        {openSection === 'publish' && (
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-4">
            {!isWecanCertified ? (
              <div className="text-center py-8">
                <Lock className="mx-auto text-red-400 mb-4" size={48} />
                <h3 className="text-white font-black text-xl mb-2">TP WECAN Certification Required</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                  To maintain trust and quality on TP Market, only certified TP WECAN cooperative members can publish jobs and sell services.
                </p>
                <button className="bg-red-500 text-white font-black py-3 px-8 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                  Register with TP WECAN Cooperative
                </button>
              </div>
            ) : (
              <div>
                {!showPublishForm ? (
                  <button onClick={() => setShowPublishForm(true)} className="w-full flex items-center justify-center gap-2 bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all">
                    <Plus size={20} /> Publish New Service
                  </button>
                ) : (
                  <form onSubmit={handlePublish} className="space-y-4">
                    <input required value={pName} onChange={e => setPName(e.target.value)} placeholder="Service/Product Name" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white" />
                    <input required type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="Price (₦)" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white" />
                    <textarea required value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Description" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white h-24" />
                    <div className="flex gap-3">
                      <button type="submit" className="flex-1 bg-[#ccff00] text-[#0F172A] font-black py-3 rounded-xl">Publish</button>
                      <button type="button" onClick={() => setShowPublishForm(false)} className="flex-1 bg-white/5 text-white font-bold py-3 rounded-xl">Cancel</button>
                    </div>
                  </form>
                )}
                
                {myListings.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-white font-bold text-sm mb-3">My Active Listings ({myListings.length})</h4>
                    <div className="space-y-2">
                      {myListings.map((item: any) => (
                        <div key={item.id} className="bg-[#0F172A] p-3 rounded-xl flex justify-between items-center border border-white/5">
                          <div>
                            <p className="text-white font-bold text-sm">{item.name}</p>
                            <p className="text-slate-400 text-xs">₦{item.price?.toLocaleString()}</p>
                          </div>
                          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Active</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: MY EQUIPMENT (Placeholder for your existing long form) */}
        <SectionHeader id="equipment" title="My Registered Equipment" icon={Shield} color="lemon" />
        {openSection === 'equipment' && (
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-4 text-center py-10">
            <p className="text-slate-400">Your equipment registration form goes here. (Keeps the page clean until needed!)</p>
            <button className="mt-4 bg-white/10 text-white px-6 py-2 rounded-full text-sm">Add Equipment</button>
          </div>
        )}

        {/* SECTION 4: REFERRALS & WALLET */}
        <SectionHeader id="wallet" title="Wallet, TP Coins & Referrals" icon={Search} color="sky" />
        {openSection === 'wallet' && (
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-4 text-center py-10">
            <p className="text-slate-400">Your wallet balance, TP coins, and referral codes go here.</p>
          </div>
        )}

      </div>
    </PageShell>
  );
}