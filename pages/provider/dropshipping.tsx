import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase'; // Make sure this path matches your setup
import { CheckCircle } from 'lucide-react';

export default function DropshippingActivation() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // The two plans you defined
  const plans = [
    {
      id: '6_months',
      name: '6-Month Activation',
      price: 15000,
      duration: '180 Days of Access',
      features: ['Full Catalog Access', 'Unlimited Product Imports', 'Keep 100% of Profits', 'Direct Bank Payouts'],
      popular: false,
    },
    {
      id: '12_months',
      name: '12-Month Activation',
      price: 28000,
      duration: '365 Days of Access',
      features: ['Everything in 6-Month', 'Save ₦2,000', 'Priority Support', 'Featured Storefront Badge'],
      popular: true,
    },
  ];

  async function handleActivate(planId: string, price: number) {
    setLoading(planId);
    
    // 1. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to activate dropshipping.');
      router.push('/signin');
      return;
    }

    // 2. Calculate expiry date
    const months = planId === '6_months' ? 6 : 12;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);

    // 3. Save to Database (This matches the SQL we just ran!)
    const { error } = await supabase.from('dropship_subscriptions').insert([
      {
        user_id: user.id,
        plan_type: planId,
        amount_paid: price,
        expiry_date: expiryDate.toISOString().split('T')[0],
        status: 'active',
      },
    ]);

    if (error) {
      alert('Error activating: ' + error.message);
    } else {
      setSuccess(true);
      // Redirect to the dropshipping dashboard after 2 seconds
      setTimeout(() => router.push('/provider/dropshipping-dashboard'), 2000);
    }
    
    setLoading(null);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
        <div className="bg-[#1E293B] p-8 rounded-3xl text-center max-w-md border border-[#ccff00]/30">
          <CheckCircle className="text-[#ccff00] mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-black text-white mb-2">Activation Successful! 🎉</h2>
          <p className="text-slate-400">Redirecting you to your Dropshipping Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-20">
      <Head><title>Activate Dropshipping — TP Market</title></Head>
      
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] p-6 text-center border-b border-white/10 pt-20">
        <h1 className="text-3xl font-black mb-2">Global Dropshipping Hub 🌍</h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          Unlock access to verified suppliers. Pay a one-time activation fee and keep <span className="text-[#ccff00] font-bold">100% of your profits</span>.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto p-6 grid md:grid-cols-2 gap-6 mt-8">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative bg-[#1E293B] rounded-3xl p-8 border ${
              plan.popular ? 'border-[#ccff00] shadow-[0_0_30px_rgba(204,255,0,0.1)]' : 'border-white/10'
            } flex flex-col`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ccff00] text-[#0F172A] text-xs font-black px-4 py-1 rounded-full">
                BEST VALUE
              </span>
            )}
            
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-black text-[#ccff00]">₦{plan.price.toLocaleString()}</span>
              <span className="text-slate-400 text-sm">/ {plan.duration}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle size={16} className="text-[#ccff00] shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleActivate(plan.id, plan.price)}
              disabled={loading !== null}
              className={`w-full py-4 rounded-xl font-black text-base transition-all ${
                plan.popular 
                  ? 'bg-[#ccff00] text-[#0F172A] hover:scale-[1.02]' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              } disabled:opacity-50`}
            >
              {loading === plan.id ? 'Processing...' : `Activate for ₦${plan.price.toLocaleString()}`}
            </button>
          </div>
        ))}
      </div>
      
      <p className="text-center text-xs text-slate-500 mt-8">
        Secure payment processing. 0% commission on all your future sales.
      </p>
    </div>
  );
}