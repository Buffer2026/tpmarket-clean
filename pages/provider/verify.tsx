import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Shield, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function TPwecanVerify() {
  const router = useRouter();
  const [tpwecanId, setTpwecanId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Please sign in first'); setLoading(false); return; }

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      if (!profile || !profile.full_name) {
        setError('Your profile is incomplete. Please add your full name first.');
        setLoading(false); return;
      }

      const userName = profile.full_name.trim().toLowerCase();
      const enteredId = tpwecanId.trim().toUpperCase();

      console.log("🔍 DEBUG 1: User Profile Name =", userName);
      console.log("🔍 DEBUG 2: Entered ID =", enteredId);

      const { data: tpwecanMember, error: fetchError } = await supabase
        .from('tpwecan_members')
        .select('tpwecan_id, full_name, status')
        .eq('tpwecan_id', enteredId)
        .single();

      console.log("🔍 DEBUG 3: Database Fetch Error =", fetchError);
      console.log("🔍 DEBUG 4: Database Member Found =", tpwecanMember);

      if (fetchError || !tpwecanMember) {
        setError('Invalid TPwecan ID. This ID does not exist in our records.');
        setLoading(false); return;
      }

      if (tpwecanMember.status !== 'active') {
        setError('This TPwecan ID is not active. Please contact support.');
        setLoading(false); return;
      }

      const tpwecanName = tpwecanMember.full_name.trim().toLowerCase();
      console.log("🔍 DEBUG 5: Database Name =", tpwecanName);

      if (userName !== tpwecanName) {
        setError(`Name mismatch! Tpmarket name: "${profile.full_name}" does NOT match TPwecan name: "${tpwecanMember.full_name}".`);
        setLoading(false); return;
      }

      // If we reach here, it's a 100% match
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ tpwecan_verified: true, tpwecan_id: enteredId, can_publish: true, verified_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => router.push('/provider/dashboard'), 2500);

    } catch (err: any) {
      console.error('Verification error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1E293B] rounded-3xl p-8 border border-white/10 shadow-2xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#ccff00]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-[#ccff00]" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Enter TPwecan ID</h1>
          <p className="text-slate-400 text-sm">We'll verify your identity matches your TPwecan membership.</p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">✅ Verified Successfully!</h2>
            <p className="text-slate-400 text-sm mb-4">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex gap-3 items-start">
                <AlertCircle className="text-red-400 shrink-0" size={20} />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Your TPwecan ID</label>
              <input
                type="text"
                value={tpwecanId}
                onChange={(e) => setTpwecanId(e.target.value)}
                placeholder="e.g. WCN-EB185FDB"
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-[#ccff00] focus:outline-none uppercase"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50">
              {loading ? 'Verifying...' : 'Activate Publishing Access'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}