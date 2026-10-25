import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShoppingCart, Trash2, Plus, Minus, ChevronLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  // Load cart from localStorage on page load
  useEffect(() => {
    const savedCart = localStorage.getItem('tpmarket_cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      calculateTotal(parsedCart);
    }
  }, []);

  const calculateTotal = (items: CartItem[]) => {
    const newTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem('tpmarket_cart', JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('tpmarket_cart', JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  const clearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      setCartItems([]);
      localStorage.removeItem('tpmarket_cart');
      setTotal(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <Head>
        <title>My Cart — TPMarket</title>
      </Head>

      {/* HEADER */}
      <div className="bg-[#1E293B] p-6 border-b border-white/10 sticky top-0 z-30 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <ChevronLeft size={24} className="text-white" />
        </button>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ShoppingCart className="text-[#ccff00]" /> My Cart 
          <span className="text-sm font-bold text-slate-400">({cartItems.length} items)</span>
        </h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {cartItems.length === 0 ? (
          // EMPTY STATE
          <div className="text-center py-20 bg-[#1E293B] rounded-2xl border border-white/10">
            <div className="w-20 h-20 rounded-full bg-white/5 text-[#ccff00] flex items-center justify-center mx-auto mb-5">
              <ShoppingCart size={32} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Your Cart is Empty</h2>
            <p className="text-slate-400 font-medium mb-8">Items you add from the Marketplace will show up here.</p>
            <Link
              href="/marketplace"
              className="inline-block bg-[#ccff00] text-[#0F172A] font-black px-8 py-3.5 rounded-xl hover:scale-105 hover:shadow-[0_0_25px_rgba(204,255,0,0.3)] transition-all"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          // CART ITEMS LIST
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="bg-[#1E293B] rounded-2xl border border-white/10 p-4 flex gap-4">
                {/* Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#0F172A] shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-2 mb-1">{item.name}</h3>
                    <p className="text-[#ccff00] font-black text-lg">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 bg-[#0F172A] rounded-lg p-1 border border-white/10">
                      <button 
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-300"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-white w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-300"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* CART SUMMARY */}
            <div className="bg-[#1E293B] rounded-2xl border border-white/10 p-6 mt-6 space-y-4">
              <div className="flex justify-between items-center text-slate-400">
                <span>Subtotal</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Platform Fee (5%)</span>
                <span>₦{(total * 0.05).toLocaleString()}</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="text-xl font-black text-white">Total</span>
                <span className="text-2xl font-black text-[#ccff00]">₦{(total * 1.05).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={clearCart}
                  className="bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-xl hover:bg-white/10 transition-all"
                >
                  Clear Cart
                </button>
                <button 
                  onClick={() => alert('Proceeding to Checkout with Paystack...')}
                  className="bg-[#ccff00] text-[#0F172A] font-black py-3.5 rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-[#ccff00]/20"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}