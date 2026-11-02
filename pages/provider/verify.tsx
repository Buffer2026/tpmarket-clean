import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Shield, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function TPwecanVerify() {
  const router = useRouter();
  const [tpwecanId, setTpwecanId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkIfAlreadyVerified() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('tpwecan_verified, can_publish, role')
        .eq('id', user.id)
        .single();

      if (data?.tpwecan_verified || data?.can_publish || data?.role === 'provider') {
        router.replace('/provider/dashboard');
      }
    }
    checkIfAlreadyVerified();
  }, [router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Please sign in first.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (!profile?.full_name) {
      const newName = window.prompt('Please enter your full name exactly as registered with TPwecan:');
      if (!newName) {
        setError('Name is required.');
        setLoading(false);
        return;
      }
      await supabase.from('profiles').update({ full_name: newName.trim() }).eq('id', user.id);
      profile.full_name = newName.trim();
    }

    const enteredId = tpwecanId.trim().toUpperCase();
    const userName = profile.full_name.trim().toLowerCase();

    console.log("🕵️‍♂️ DEBUG: Checking database for ID:", enteredId);

    // Check TPwecan database
    const { data: member, error: memberError } = await supabase
      .from('tpwecan_members')
      .select('*') // Selected * to see exactly what the database returns
      .eq('tpwecan_id', enteredId)
      .single();

    console.log("📊 DEBUG: Database Response:", { member, memberError });

    if (memberError || !member) {
      console.log("❌ DEBUG: Blocked because member was not found.");
      setError(`❌ BLOCKED! ID "${enteredId}" not found in TPwecan database.`);
      setLoading(false);
      return;
    }

    const tpwecanName = member.full_name ? member.full_name.trim().toLowerCase() : '';
    if (tpwecanName !== userName) {
      console.log("❌ DEBUG: Blocked because of name mismatch.");
      setError(`❌ BLOCKED! Name mismatch.\n\nYour Name: "${profile.full_name}"\nTPwecan Name: "${member.full_name || 'Unknown'}"`);
      setLoading(false);
      return;
    }

    console.log("✅ DEBUG: Verification successful! Updating profile...");

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        tpwecan_verified: true,
        can_publish: true,
        role: 'provider',
        tpwecan_id: enteredId
      })
      .eq('id', user.id);

    if (updateError) {
      setError('Error saving verification: ' + updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.replace('/provider/dashboard');
    }, 2000);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle className="text-[#ccff00] mx-auto mb-4" size={64} />
          <h1 className="text-2xl font-black text-white mb-2">✅ SUCCESS!</h1>
          <p className="text-slate-400">You are now verified. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1E293B] rounded-3xl p-8 border border-white/10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 mb-6 hover:text-white">
          <ArrowLeft size={16} /> Back
        </button>
        
        <div className="text-center mb-6">
          <Shield className="text-[#ccff00] mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-black text-white">TPwecan Verification</h1>
          <p className="text-slate-400 text-sm mt-2">Enter your TPwecan ID to verify your provider account.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={tpwecanId}
            onChange={(e) => {
              setTpwecanId(e.target.value);
              setError('');
            }}
            placeholder="e.g. WCN-A4EB6A26"
            className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-4 px-4 text-white uppercase font-mono tracking-wider focus:border-[#ccff00] focus:outline-none"
            required
          />
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm font-semibold whitespace-pre-line">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !tpwecanId} 
            className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify ID'}
          </button>
        </form>
      </div>
    </div>
  );
}