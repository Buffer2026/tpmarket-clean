import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';
import { Search, MapPin, Star } from 'lucide-react';

export default function Marketplace() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setProducts(data);
    setLoading(false);
  }

    const filteredProducts = products.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <Head><title>Marketplace — TPMarket</title></Head>

      {/* HEADER & SEARCH */}
      <div className="bg-[#1E293B] p-6 border-b border-white/10 sticky top-0 z-30">
        <h1 className="text-2xl font-black text-white mb-4">Marketplace</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search services, mechanics, parts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#ccff00] focus:outline-none"
          />
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading marketplace...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No products found. Be the first to publish!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => router.push(`/product/${product.id}`)}
                className="bg-[#1E293B] rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:border-[#ccff00]/50 transition-all group"
              >
                {/* PRODUCT IMAGE WITH SELLER PROFILE OVERLAY */}
                <div className="h-48 w-full bg-[#0F172A] relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                  
                  {/* SELLER PROFILE PICTURE OVERLAY */}
                  {product.seller_logo && (
                    <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full border-2 border-[#ccff00] overflow-hidden bg-white shadow-lg">
                      <img src={product.seller_logo} alt="Seller" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 left-3 bg-[#0F172A]/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#ccff00] border border-white/10">
                    {product.category}
                  </div>
                </div>

                {/* PRODUCT DETAILS */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">{product.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <Star size={14} className="text-[#ccff00]" fill="#ccff00" />
                    <span className="text-xs text-slate-300">{product.rating || 5.0} • {product.seller_name || 'Verified Provider'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                    <MapPin size={14} /> {product.location || 'Lagos, Nigeria'}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-xl font-black text-[#ccff00]">₦{product.price?.toLocaleString()}</span>
                    <span className="text-[10px] bg-[#ccff00]/10 text-[#ccff00] px-2 py-1 rounded-full font-bold uppercase">
                      {product.type === 'Buy' ? (product.condition || 'New') : 'Service'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}