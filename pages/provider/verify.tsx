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
      // 1. Get current user's info
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in first');
        setLoading(false);
        return;
      }

      // 2. Get user's name from their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.full_name) {
        setError('Your profile is incomplete. Please add your full name first.');
        setLoading(false);
        return;
      }

      const userName = profile.full_name.trim().toLowerCase();

      // 3. Check if TPwecan ID exists in the database
      const { data: tpwecanMember, error: fetchError } = await supabase
        .from('tpwecan_members')
        .select('tpwecan_id, full_name, status')
        .eq('tpwecan_id', tpwecanId.trim().toUpperCase())
        .single();

      if (fetchError || !tpwecanMember) {
        setError('Invalid TPwecan ID. Please check and try again.');
        setLoading(false);
        return;
      }

      // 4. Check if status is active
      if (tpwecanMember.status !== 'active') {
        setError('This TPwecan ID is not active. Please contact support.');
        setLoading(false);
        return;
      }

      // 5. Compare names (case-insensitive)
      const tpwecanName = tpwecanMember.full_name.trim().toLowerCase();
      
      if (userName !== tpwecanName) {
        setError(`Name mismatch! The name on your Tpmarket account (${profile.full_name}) does not match the name on this TPwecan ID (${tpwecanMember.full_name}). Please use the exact same name.`);
        setLoading(false);
        return;
      }

      // 6. Name matches! Auto-approve the user instantly
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          tpwecan_verified: true,
          tpwecan_id: tpwecanId.trim().toUpperCase(),
          can_publish: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 7. Success!
      setSuccess(true);
      setTimeout(() => {
        router.push('/provider/dashboard');
      }, 2500);

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
        
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#ccff00]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-[#ccff00]" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Enter TPwecan ID</h1>
          <p className="text-slate-400 text-sm">
            We'll verify your identity matches your TPwecan membership.
          </p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">✅ Verified Successfully!</h2>
            <p className="text-slate-400 text-sm mb-4">
              Your TPwecan ID has been confirmed. Redirecting to dashboard...
            </p>
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
              <label className="block text-xs font-bold text-slate-400 mb-2">
                Your TPwecan ID
              </label>
              <input
                type="text"
                value={tpwecanId}
                onChange={(e) => setTpwecanId(e.target.value)}
                placeholder="TPW-XXXXX"
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-500 focus:border-[#ccff00] focus:outline-none uppercase"
                required
              />
              <p className="text-xs text-slate-500 mt-2">
                Must match the exact name on your Tpmarket account.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Activate Publishing Access'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}