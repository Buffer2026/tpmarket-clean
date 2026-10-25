import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { 
  ShoppingCart, MessageCircle, CreditCard, MapPin, 
  Briefcase, Star, ChevronLeft, X, Check 
} from 'lucide-react';

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [product, setProduct] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [currentImage, setCurrentImage] = useState(0);
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [selectedInstallment, setSelectedInstallment] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchUserCoins();
    }
  }, [id]);

  useEffect(() => {
    if (product && product.images && product.images.length > 1) {
      const slideInterval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % product.images.length);
      }, 4000);
      return () => clearInterval(slideInterval);
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setProduct({
        ...data,
        images: data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=800'],
        seller_name: data.seller_name || "Verified Provider",
        seller_logo: data.seller_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.seller_name || 'Provider')}&background=ccff00&color=0F172A`,
        years_experience: data.years_experience || 0,
        country: data.country || "Nigeria",
        state: data.state || "Lagos State",
        address: data.address || "Address not specified",
        rating: data.rating || 5.0,
        price: data.price || 0
      });
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCoins = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_coins')
          .select('tp_coins')
          .eq('user_id', user.id)
          .single();
        if (data) setUserCoins(data.tp_coins || 0);
      }
    } catch (error) {
      console.log('User not logged in or coins table missing');
    }
  };

  const addToCart = () => {
    if (!product || !product.id) {
      alert('Product information is missing.');
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=800',
      quantity: 1
    };

    try {
      const existingCart = JSON.parse(localStorage.getItem('tpmarket_cart') || '[]');
      const existingIndex = existingCart.findIndex((item) => item.productId === product.id);
      
      if (existingIndex > -1) {
        existingCart[existingIndex].quantity += 1;
      } else {
        existingCart.push(cartItem);
      }
      
      localStorage.setItem('tpmarket_cart', JSON.stringify(existingCart));
      alert('✅ Added to cart successfully!');
    } catch (error) {
      console.error('Cart error:', error);
      alert('Could not add to cart. Please try again.');
    }
  };

  const submitNegotiation = async () => {
    if (!offerPrice) return alert('Please enter a price');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert('Please log in to negotiate');

      await supabase.from('negotiations').insert({
        product_id: product.id,
        buyer_id: user.id,
        seller_id: product.seller_id,
        offered_price: parseFloat(offerPrice),
        original_price: product.price,
        status: 'pending'
      });
      setShowNegotiate(false);
      setOfferPrice('');
      alert('✅ Offer sent to seller!');
    } catch (error) {
      alert('Error sending offer');
    }
  };

  const installmentOptions = [3, 6, 10, 12, 18, 24, 36];

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white font-bold">Loading Product...</div>;
  if (!product) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-red-400 font-bold">Product not found.</div>;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <div className="relative bg-[#1E293B]">
        <div className="relative h-80 w-full overflow-hidden">
          <img src={product.images[currentImage]} alt={product.name} className="w-full h-full object-cover transition-all duration-500" />
          <button onClick={() => router.back()} className="absolute top-4 left-4 bg-black/50 p-2 rounded-full hover:bg-black/70">
            <ChevronLeft size={24} className="text-white" />
          </button>
        </div>
        <div className="flex gap-2 p-3 overflow-x-auto">
          {product.images.slice(0, 4).map((img, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentImage(idx)} 
              className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${currentImage === idx ? 'border-[#ccff00] scale-105' : 'border-transparent opacity-70'}`}
            >
              <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} className="text-[#ccff00]" fill="#ccff00" />
            <span className="font-bold text-white">{product.rating}</span>
            <span className="text-slate-400 text-sm">(Verified Provider)</span>
          </div>
          <div className="bg-gradient-to-r from-[#ccff00] to-yellow-400 rounded-2xl px-6 py-4 shadow-lg text-center inline-block">
            <div className="text-sm font-bold text-[#0F172A]">PRICE</div>
            <div className="text-3xl font-black text-[#0F172A]">₦{(product.price || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-[#1E293B] p-5 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-xl font-bold text-white">Description</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{product.description || 'No description provided.'}</p>
          
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex gap-3 items-start">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-400 text-xs font-black uppercase mb-1">Quality Assurance Notice</p>
              <p className="text-red-200/80 text-sm leading-relaxed">
                All providers must stand by their work. Do not list products or services you cannot back with a 3-month guarantee. Failure to resolve valid customer complaints will lead to account suspension and withheld funds.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-4">
            <img src={product.seller_logo} alt="Seller" className="w-14 h-14 rounded-full border-2 border-[#ccff00]" />
            <div>
              <Link href={`/provider/${product.seller_id}`} className="hover:text-[#ccff00] transition-colors cursor-pointer block">
                <h3 className="font-bold text-white text-lg">{product.seller_name}</h3>
              </Link>
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <Briefcase size={14} className="text-[#ccff00]" /> 
                {product.years_experience} Years Experience
              </div>
            </div>
          </div>
          
          <div className="space-y-2 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MapPin size={16} className="text-[#ccff00]" /> 
              <span>{product.address}, {product.state}, {product.country}</span>
            </div>
          </div>

          <Link href="/quote-request" className="w-full bg-[#1E293B] border border-[#ccff00] text-[#ccff00] font-bold py-3.5 rounded-xl hover:bg-[#ccff00]/10 transition-all flex items-center justify-center gap-2 mt-2">
            📋 Request a Custom Quote
          </Link>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-[#0F172A] border-t border-white/10 p-4 flex gap-3 z-40 max-w-4xl mx-auto">
        <button onClick={addToCart} className="flex-1 bg-[#1E293B] border border-white/10 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95">
          <ShoppingCart size={18} /> Cart
        </button>
        <button onClick={() => setShowNegotiate(true)} className="flex-1 bg-[#1E293B] border border-white/10 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95">
          <MessageCircle size={18} /> Negotiate
        </button>
        <button onClick={() => setShowPaymentModal(true)} className="flex-[1.5] bg-[#ccff00] text-[#0F172A] font-black py-3.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-[#ccff00]/20 active:scale-95">
          <CreditCard size={18} /> Buy Now
        </button>
      </div>

      <BottomNav />

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#1E293B] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white">Choose Payment</h2>
              <button onClick={() => { setShowPaymentModal(false); setSelectedInstallment(null); }}><X className="text-slate-400 hover:text-white" /></button>
            </div>

            <button 
              onClick={() => { alert('Proceeding to Cash Checkout...'); setShowPaymentModal(false); }}
              className="w-full bg-[#0F172A] border-2 border-[#ccff00] p-4 rounded-2xl mb-4 text-left flex justify-between items-center hover:bg-[#0F172A]/80 transition-all"
            >
              <div>
                <p className="font-bold text-white text-lg">💵 Cash Payment</p>
                <p className="text-xs text-slate-400">Pay full amount now</p>
              </div>
              <p className="font-black text-[#ccff00]">₦{(product.price || 0).toLocaleString()}</p>
            </button>

            <p className="text-sm font-bold text-slate-400 mb-3">Or pay in installments:</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {installmentOptions.map((months) => {
                const monthly = ((product.price || 0) / months).toLocaleString(undefined, { maximumFractionDigits: 0 });
                return (
                  <button
                    key={months}
                    onClick={() => setSelectedInstallment(months)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedInstallment === months 
                        ? 'bg-[#ccff00] border-[#ccff00] text-[#0F172A]' 
                        : 'bg-[#0F172A] border-white/10 text-white hover:border-[#ccff00]/50'
                    }`}
                  >
                    <p className="font-black text-lg">{months} Months</p>
                    <p className="text-xs">₦{monthly}/mo</p>
                  </button>
                );
              })}
            </div>

            {selectedInstallment && (
              <button 
                onClick={() => { alert(`Proceeding with ${selectedInstallment} months installment...`); setShowPaymentModal(false); }}
                className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                <Check size={20} /> Proceed with {selectedInstallment} Months Plan
              </button>
            )}
          </div>
        </div>
      )}

      {showNegotiate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] w-full max-w-sm rounded-3xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white">Make an Offer</h2>
              <button onClick={() => setShowNegotiate(false)}><X className="text-slate-400 hover:text-white" /></button>
            </div>
            <p className="text-slate-400 text-sm mb-4">Current Price: ₦{(product.price || 0).toLocaleString()}</p>
            <input 
              type="number" 
              placeholder="Enter your offer price (₦)" 
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3.5 px-4 text-white mb-4 focus:border-[#ccff00] focus:outline-none text-lg"
            />
            <div className="flex gap-3">
              <button onClick={submitNegotiation} className="flex-1 bg-[#ccff00] text-[#0F172A] font-black py-3.5 rounded-xl hover:scale-[1.02] transition-all">
                Send Offer
              </button>
              <button onClick={() => setShowNegotiate(false)} className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-xl hover:bg-white/10 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}