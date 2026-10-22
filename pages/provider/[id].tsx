import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { MapPin, Facebook, Youtube, Globe, ShoppingBag, Star } from 'lucide-react';

export default function ProviderProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [provider, setProvider] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProviderData();
    }
  }, [id]);

  async function fetchProviderData() {
    setLoading(true);
    
    // 1. Fetch Provider's Profile Info (Socials & Location)
    // Note: We query the 'profiles' table. If you don't have one, it will safely fallback.
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    // 2. Fetch All Products/Services by this Provider
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', id)
      .order('created_at', { ascending: false });

    // Combine data with safe fallbacks
    setProvider({
      full_name: profileData?.full_name || 'Verified Provider',
      country: profileData?.country || 'Nigeria',
      state: profileData?.state || 'Lagos',
      google_maps_address: profileData?.google_maps_address || '',
      facebook_url: profileData?.facebook_url || '',
      youtube_url: profileData?.youtube_url || '',
      tiktok_url: profileData?.tiktok_url || '',
      x_url: profileData?.x_url || '',
    });

    setProducts(productsData || []);
    setLoading(false);
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white font-bold">Loading Provider...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-6 border-b border-white/10">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white mb-4 flex items-center gap-1 text-sm">
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#ccff00] flex items-center justify-center text-[#0F172A] font-black text-2xl">
            {provider.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{provider.full_name}</h1>
            <div className="flex items-center gap-1 text-[#ccff00] text-sm">
              <Star size={14} fill="#ccff00" /> 5.0 <span className="text-slate-400 ml-1">(Verified Artisan)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6 max-w-4xl mx-auto">
        
        {/* LOCATION SECTION (NO PHONE NUMBER) */}
        <div className="bg-[#1E293B] p-5 rounded-2xl border border-white/10 space-y-3">
          <h2 className="text-[#ccff00] font-bold text-sm uppercase tracking-wide flex items-center gap-2">
            <MapPin size={16} /> Location Details
          </h2>
          <p className="text-white text-lg font-bold">{provider.state}, {provider.country}</p>
          
          {provider.google_maps_address ? (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.google_maps_address)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-[#0F172A] border border-[#ccff00]/30 text-[#ccff00] font-bold py-3 rounded-xl text-center hover:bg-[#ccff00]/10 transition-all"
            >
              🗺️ View on Google Maps
            </a>
          ) : (
            <p className="text-slate-400 text-sm italic">Exact map address not provided.</p>
          )}
        </div>

        {/* SOCIAL MEDIA SECTION */}
        {(provider.facebook_url || provider.youtube_url || provider.tiktok_url || provider.x_url) && (
          <div className="bg-[#1E293B] p-5 rounded-2xl border border-white/10 space-y-3">
            <h2 className="text-[#ccff00] font-bold text-sm uppercase tracking-wide flex items-center gap-2">
              <Globe size={16} /> Connect on Social Media
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {provider.facebook_url && (
                <a href={provider.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-600/20 text-blue-400 p-3 rounded-xl font-bold hover:bg-blue-600/30 transition-all">
                  <Facebook size={18} /> Facebook
                </a>
              )}
              {provider.youtube_url && (
                <a href={provider.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-red-600/20 text-red-400 p-3 rounded-xl font-bold hover:bg-red-600/30 transition-all">
                  <Youtube size={18} /> YouTube
                </a>
              )}
              {provider.tiktok_url && (
                <a href={provider.tiktok_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-pink-600/20 text-pink-400 p-3 rounded-xl font-bold hover:bg-pink-600/30 transition-all">
                  🎵 TikTok
                </a>
              )}
              {provider.x_url && (
                <a href={provider.x_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-gray-600/20 text-white p-3 rounded-xl font-bold hover:bg-gray-600/30 transition-all">
                  <Globe size={18} /> X (Twitter)
                </a>
              )}
            </div>
          </div>
        )}

        {/* PROVIDER'S PRODUCTS & SERVICES */}
        <div>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#ccff00]" /> Active Listings
          </h2>
          
          {products.length === 0 ? (
            <div className="bg-[#1E293B] p-8 rounded-2xl border border-white/10 text-center">
              <p className="text-slate-400">This provider hasn't published any services yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((item) => (
                <Link href={`/product/${item.id}`} key={item.id} className="bg-[#1E293B] p-4 rounded-2xl border border-white/10 hover:border-[#ccff00]/50 transition-all block">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg line-clamp-1">{item.name}</h3>
                    <span className="text-[10px] bg-[#ccff00]/10 text-[#ccff00] px-2 py-1 rounded-full font-bold uppercase">{item.type}</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3 line-clamp-2">{item.description || 'No description provided.'}</p>
                  <p className="text-[#ccff00] font-black text-xl">₦{item.price?.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* REQUEST A QUOTE BUTTON */}
        <Link href="/quote-request" className="block w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl text-center text-lg hover:scale-[1.02] transition-all shadow-lg shadow-[#ccff00]/20">
          📋 Request a Custom Quote
        </Link>

      </div>
      <BottomNav />
    </div>
  );
}