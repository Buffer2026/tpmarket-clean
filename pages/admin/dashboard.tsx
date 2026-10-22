import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; 
import BottomNav from '../../components/BottomNav';
import { Plus, Package, TrendingUp, CheckCircle, Edit3 } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false); 
  const [myListings, setMyListings] = useState<any[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Mechanics');
  const [type, setType] = useState<'Buy' | 'Book'>('Book');

  // Fetch user's existing listings when page loads
  useEffect(() => {
    fetchMyListings();
  }, []);

  async function fetchMyListings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setMyListings(data);
  }

  async function handlePublish(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Please sign in first.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('products').insert([
      {
        seller_id: user.id,
        name: name,
        price: parseFloat(price),
        category: category,
        type: type,
        location: 'Lagos, Nigeria', 
      },
    ]);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('✅ Service published successfully!');
      setName(''); setPrice('');
      setShowForm(false); 
      fetchMyListings(); 
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <Head><title>My Dashboard — TPMarket</title></Head>

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-6 border-b border-white/10">
        <h1 className="text-2xl font-black text-white">My Dashboard</h1>
        <p className="text-slate-400 text-sm">Manage your services and track your growth.</p>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/10">
            <Package className="text-[#ccff00] mb-2" size={24} />
            <p className="text-2xl font-black">{myListings.length}</p>
            <p className="text-xs text-slate-400">Active Services</p>
          </div>
          <div className="bg-[#1E293B] p-4 rounded-2xl border border-white/10">
            <TrendingUp className="text-[#ccff00] mb-2" size={24} />
            <p className="text-2xl font-black">₦0</p>
            <p className="text-xs text-slate-400">Total Earnings</p>
          </div>
        </div>

        {/* PUBLISH BUTTON & FORM */}
        {!showForm ? (
          <button 
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-2xl hover:scale-[1.02] transition-all shadow-lg shadow-[#ccff00]/20"
          >
            <Plus size={20} /> Publish New Service
          </button>
        ) : (
          <div className="bg-[#1E293B] p-6 rounded-2xl border border-[#ccff00]/30 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add New Service</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">Cancel</button>
            </div>

            {message && (
              <div className={`p-3 rounded-xl mb-4 text-center font-bold text-sm ${message.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-4">
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Service Name (e.g., AC Repair)" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
              <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price in Naira (e.g., 5000)" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
              
              <div className="grid grid-cols-2 gap-4">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                  <option>Mechanics</option><option>Tailors & Fashion</option><option>Electricians</option><option>Home Services</option><option>Car Spare Parts</option>
                </select>
                <select value={type} onChange={(e) => setType(e.target.value as 'Buy' | 'Book')} className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none">
                  <option value="Book">Book a Service</option><option value="Buy">Sell a Product</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50">
                {loading ? 'Publishing...' : 'Publish to Marketplace'}
              </button>
            </form>
          </div>
        )}

        {/* MY ACTIVE LISTINGS */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-[#ccff00]" /> My Active Services
          </h2>
          
          {myListings.length === 0 ? (
            <p className="text-slate-400 text-center py-8 bg-[#1E293B] rounded-2xl border border-white/5">
              You haven't published any services yet. Click the button above to start!
            </p>
          ) : (
            <div className="space-y-3">
              {myListings.map((item) => (
                <div key={item.id} className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-xs text-slate-400">{item.category} • {item.type}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="font-black text-[#ccff00]">₦{item.price?.toLocaleString()}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">Active</span>
                      {/* EDIT BUTTON LINKING TO THE PUBLISH PAGE */}
                      <Link href={`/provider/publish?id=${item.id}`} className="text-[#ccff00] text-xs font-bold flex items-center gap-1 hover:underline">
                        <Edit3 size={12} /> Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM NAVIGATION */}
      <BottomNav />
    </div>
  );
}