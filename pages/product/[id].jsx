import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase'; // <--- FIXED PATH

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchUserCoins();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*') // <--- SIMPLIFIED to prevent database relationship errors
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setProduct(data);
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
          .from('user_coins') // Make sure this table exists, or remove this function if not
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
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    };
    const existingCart = JSON.parse(localStorage.getItem('tpmarket_cart') || '[]');
    existingCart.push(cartItem);
    localStorage.setItem('tpmarket_cart', JSON.stringify(existingCart));
    alert('✅ Added to cart!');
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
      alert('✅ Offer sent to seller!');
    } catch (error) {
      alert('Error sending offer');
    }
  };

  if (loading) return <div className="min-h-screen bg-sky-100 flex items-center justify-center text-2xl font-bold text-navy-900">Loading Product...</div>;
  if (!product) return <div className="min-h-screen bg-sky-100 flex items-center justify-center text-2xl font-bold text-red-500">Product not found.</div>;

  return (
    <div className="min-h-screen bg-sky-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* PRODUCT HEADER */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0a192f]">{product.name}</h1>
            <p className="text-gray-600 text-lg">{product.model}</p>
          </div>
          <div className="mt-4 md:mt-0 bg-gradient-to-r from-[#ccff00] to-yellow-400 rounded-2xl px-6 py-4 shadow-lg text-center">
            <div className="text-sm font-bold text-[#0a192f]">PRICE</div>
            <div className="text-3xl md:text-4xl font-black text-[#0a192f]">
              {product.price.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setShowNegotiate(true)}
            className="bg-yellow-400 text-[#0a192f] font-bold py-4 rounded-xl hover:bg-yellow-500 transition text-lg"
          >
            💬 Negotiate Price
          </button>
          
          <button
            onClick={addToCart}
            className="bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition text-lg"
          >
            🛒 Add to Cart
          </button>
          
          <button
            onClick={() => router.push(`/checkout/${product.id}`)}
            className="bg-[#ccff00] text-[#0a192f] font-bold py-4 rounded-xl hover:bg-[#b3e600] transition text-lg"
          >
            💳 Pay Now
          </button>
        </div>

        {/* NEGOTIATION MODAL */}
        {showNegotiate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-[#0a192f]">Negotiate Price</h2>
              <p className="text-gray-600 mb-4">Current Price: ₦{product.price.toLocaleString()}</p>
              
              <input
                type="number"
                placeholder="Your Offer Price (₦)"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 mb-4 text-lg"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={submitNegotiation}
                  className="flex-1 bg-[#ccff00] text-[#0a192f] font-bold py-3 rounded-lg hover:bg-[#b3e600]"
                >
                  Send Offer
                </button>
                <button
                  onClick={() => setShowNegotiate(false)}
                  className="flex-1 bg-gray-300 text-[#0a192f] font-bold py-3 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT DETAILS */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-[#0a192f]">Product Details</h2>
          <p className="text-gray-700 text-lg">{product.description || 'No description available.'}</p>
          <div className="mt-4 text-gray-500">📍 Located in: {product.location}</div>
        </div>
      </div>
    </div>
  );
}