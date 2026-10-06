import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase'

export default function CheckoutPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [processing, setProcessing] = useState(false);
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
        .select('*')
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
          .from('user_coins')
          .select('tp_coins')
          .eq('user_id', user.id)
          .single();
        if (data) setUserCoins(data.tp_coins || 0);
      }
    } catch (error) {
      console.log('User not logged in');
    }
  };

  const calculateInstallmentPlans = () => {
    if (!product) return [];
    const plans = [];
    const durations = [2, 3, 6, 12, 18, 24];
    
    durations.forEach(months => {
      const monthlyPayment = product.price / months;
      const minCoinsRequired = monthlyPayment * 0.1; 
      const interest = months > 6 ? 0.05 : 0; 
      const totalWithInterest = product.price * (1 + interest);
      
      if (userCoins >= minCoinsRequired) {
        plans.push({
          months,
          monthlyPayment: (totalWithInterest / months).toFixed(2),
          totalAmount: totalWithInterest.toFixed(2),
          coinsRequired: minCoinsRequired.toFixed(0),
          interest: interest * 100
        });
      }
    });
    return plans;
  };

  const processPayment = async () => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to complete checkout');
        setProcessing(false);
        return;
      }

      if (paymentMethod === 'cash') {
        alert(`Redirecting to Paystack for full payment of ₦${product.price.toLocaleString()}...`);
        // Here you will integrate Paystack API later
      } else if (selectedPlan) {
        await supabase.from('installment_plans').insert({
          user_id: user.id,
          product_id: product.id,
          total_amount: product.price,
          months: selectedPlan.months,
          monthly_payment: selectedPlan.monthlyPayment,
          coins_used: selectedPlan.coinsRequired,
          status: 'active',
          start_date: new Date(),
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        alert('✅ Installment plan activated! First payment due in 30 days.');
        router.push('/dashboard/orders'); // Adjust this route to your actual orders page
      }
    } catch (error) {
      alert('Error processing payment: ' + error.message);
    }
    setProcessing(false);
  };

  if (loading) return <div className="min-h-screen bg-sky-100 flex items-center justify-center text-2xl font-bold">Loading Checkout...</div>;
  if (!product) return <div className="min-h-screen bg-sky-100 flex items-center justify-center text-2xl font-bold text-red-500">Product not found.</div>;

  return (
    <div className="min-h-screen bg-sky-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-[#0a192f] mb-6">Checkout</h1>
        
        {/* PRODUCT SUMMARY */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg flex items-center gap-4">
          <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
          <div>
            <h3 className="font-bold text-xl text-[#0a192f]">{product.name}</h3>
            <p className="text-gray-600">{product.model}</p>
            <p className="text-2xl font-black text-[#ccff00]">{product.price.toLocaleString()}</p>
          </div>
        </div>

        {/* PAYMENT METHOD SELECTION */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-[#0a192f]">Payment Method</h2>
          
          <div className="space-y-4">
            {/* CASH PAYMENT */}
            <div 
              onClick={() => setPaymentMethod('cash')}
              className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                paymentMethod === 'cash' ? 'border-[#ccff00] bg-yellow-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0a192f]">💵 Pay in Full</h3>
                  <p className="text-gray-600">One-time payment</p>
                </div>
                <div className="text-2xl font-black text-[#0a192f]">₦{product.price.toLocaleString()}</div>
              </div>
            </div>

            {/* INSTALLMENT PAYMENT */}
            <div 
              onClick={() => setPaymentMethod('installment')}
              className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                paymentMethod === 'installment' ? 'border-[#ccff00] bg-yellow-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-[#0a192f]"> Pay in Installments</h3>
                  <p className="text-gray-600">Split payment over time</p>
                  <p className="text-sm text-blue-600 mt-1">Your Coins: {userCoins} TP Coins</p>
                </div>
              </div>

              {paymentMethod === 'installment' && (
                <div className="space-y-3 mt-4">
                  {calculateInstallmentPlans().map((plan) => (
                    <div
                      key={plan.months}
                      onClick={() => setSelectedPlan(plan)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        selectedPlan?.months === plan.months 
                          ? 'border-[#ccff00] bg-yellow-50' 
                          : 'border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-[#0a192f]">{plan.months} Months</div>
                          <div className="text-sm text-gray-600">₦{plan.monthlyPayment}/month</div>
                          <div className="text-xs text-gray-500">Coins needed: {plan.coinsRequired}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#0a192f]">Total: ₦{plan.totalAmount}</div>
                          {plan.interest > 0 && (
                            <div className="text-xs text-red-500">+{plan.interest}% interest</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {calculateInstallmentPlans().length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      <p>No installment plans available.</p>
                      <p className="text-sm">You need more TP Coins to qualify.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PAY BUTTON */}
        <button
          onClick={processPayment}
          disabled={processing || (paymentMethod === 'installment' && !selectedPlan)}
          className="w-full bg-[#ccff00] text-[#0a192f] font-black text-xl py-4 rounded-xl hover:bg-[#b3e600] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {processing ? 'Processing...' : `Pay ₦${paymentMethod === 'installment' && selectedPlan ? selectedPlan.monthlyPayment : product.price.toLocaleString()}`}
        </button>

        {/* GUARANTEE */}
        <div className="mt-6 bg-[#0a192f] text-white rounded-2xl p-6 text-center">
          <div className="text-2xl font-black text-[#ccff00] mb-2">90-DAY TP IRONCLAD GUARANTEE</div>
          <p className="text-sm">Your payment is held safely until you confirm delivery.</p>
        </div>
      </div>
    </div>
  );
}