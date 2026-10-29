import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function TpwecanVerify() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [tpwecanId, setTpwecanId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is logged in when page loads
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      } else {
        router.push('/signin');
      }
    });
  }, []);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Check if the TPwecan ID exists in the database and has been paid
    const { data, error: dbError } = await supabase
      .from('tpwecan_users')
      .select('*')
      .eq('tpwecan_id', tpwecanId.toUpperCase())
      .eq('payment_status', 'paid')
      .single();

    if (dbError || !data) {
      setError('Invalid TPwecan ID or payment not confirmed. Please join TPwecan first.');
      setLoading(false);
      return;
    }

    // 2. If valid, update the user's profile to mark them as verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tpwecan_id: tpwecanId.toUpperCase(),
        tpwecan_verified: true,
        role: 'provider' // Automatically upgrade their role
      })
      .eq('id', userId);

    if (updateError) {
      setError('Error verifying profile. Please try again.');
    } else {
      // 3. Success! Redirect them to the publish page
      router.push('/provider/publish');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6">
      <Head><title>Verify TPwecan ID — TPMarket</title></Head>
      
      <div className="w-full max-w-md bg-[#1E293B] rounded-3xl p-8 border border-white/10 shadow-2xl">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 hover:text-white mb-6 text-sm">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#ccff00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-[#ccff00]" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">TPwecan Verification Required</h1>
          <p className="text-slate-400 text-sm">To publish products or services, you must be a verified TPwecan cooperative member.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">Enter your TPwecan ID</label>
            <input 
              required 
              type="text" 
              value={tpwecanId} 
              onChange={(e) => setTpwecanId(e.target.value)} 
              placeholder="TPW-XXXXX" 
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3.5 px-4 text-white focus:border-[#ccff00] focus:outline-none uppercase tracking-wider" 
            />
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center font-bold">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Unlock Publishing'}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-6">
          Don't have a TPwecan ID?{' '}
          <a href="/tpwecan/register" className="text-[#ccff00] hover:underline font-bold">Join TPwecan Cooperative</a>
        </p>
      </div>
    </div>
  );
}