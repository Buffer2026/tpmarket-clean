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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
      else router.push('/signin');
    });
  }, []);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (tpwecanId.length < 3) {
      setError('Please enter a valid TPwecan ID.');
      return;
    }

    setLoading(true);
    setError('');

    // SIMPLE LOGIC: Just save the ID to the user's profile and mark them verified.
    // No complex table checks or payment confirmations.
    const { error } = await supabase
      .from('profiles')
      .update({
        tpwecan_id: tpwecanId.toUpperCase(),
        tpwecan_verified: true,
        role: 'provider' 
      })
      .eq('id', userId);

    if (error) {
      setError('Error saving your ID. Please try again.');
      setLoading(false);
    } else {
      // Success! Go straight to publish page.
      router.push('/provider/publish');
    }
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
          <h1 className="text-2xl font-black text-white mb-2">Enter TPwecan ID</h1>
          <p className="text-slate-400 text-sm">Enter your ID below to unlock the publishing page.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">Your TPwecan ID</label>
            <input 
              required 
              type="text" 
              value={tpwecanId} 
              onChange={(e) => setTpwecanId(e.target.value.toUpperCase())} 
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
            {loading ? 'Activating...' : 'Activate Publishing Access'}
          </button>
        </form>
      </div>
    </div>
  );
}