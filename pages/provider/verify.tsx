import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Shield, ArrowLeft } from 'lucide-react';

export default function TPwecanVerify() {
  const router = useRouter();
  const [tpwecanId, setTpwecanId] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Please sign in'); setLoading(false); return; }

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    if (!profile?.full_name) { alert('Profile name missing'); setLoading(false); return; }

    const enteredId = tpwecanId.trim().toUpperCase();
    const userName = profile.full_name.trim().toLowerCase();

    // 1. CHECK DATABASE FOR ID
    const { data: member, error } = await supabase
      .from('tpwecan_members')
      .select('full_name')
      .eq('tpwecan_id', enteredId)
      .single();

    // RUTHLESS CHECK 1: ID MUST EXIST
    if (error || !member) {
      alert(`❌ BLOCKED! The ID "${enteredId}" does not exist in our database.`);
      setLoading(false);
      return; 
    }

    // RUTHLESS CHECK 2: NAMES MUST MATCH
    if (member.full_name.trim().toLowerCase() !== userName) {
      alert(`❌ BLOCKED! Name mismatch.\nYour Profile: "${profile.full_name}"\nTPwecan Name: "${member.full_name}"`);
      setLoading(false);
      return;
    }

    // IF WE GET HERE, IT IS A PERFECT MATCH
    await supabase.from('profiles').update({ 
      can_publish: true, 
      tpwecan_verified: true, 
      tpwecan_id: enteredId 
    }).eq('id', user.id);

    alert('✅ SUCCESS! You are now verified.');
    router.replace('/provider/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1E293B] rounded-3xl p-8 border border-white/10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 mb-6">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-center mb-6">
          <Shield className="text-[#ccff00] mx-auto mb-4" size={40} />
          <h1 className="text-2xl font-black text-white">Enter TPwecan ID</h1>
        </div>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={tpwecanId}
            onChange={(e) => setTpwecanId(e.target.value)}
            placeholder="e.g. WCN-EB185FDB"
            className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white uppercase"
            required
          />
          <button type="submit" disabled={loading} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl">
            {loading ? 'Checking...' : 'Verify ID'}
          </button>
        </form>
      </div>
    </div>
  );
}