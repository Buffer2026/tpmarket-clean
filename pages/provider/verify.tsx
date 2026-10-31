import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase'; // Adjust path if needed
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';

export default function TPwecanVerify() {
  const router = useRouter();
  const [tpwecanId, setTpwecanId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Get current logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { 
      alert('Please sign in first.'); 
      router.push('/signin');
      return; 
    }

    // 2. Get user's profile name from the database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      setError('Could not load your profile. Please try logging in again.');
      setLoading(false);
      return;
    }

    // 3. SAFETY NET: If name is missing, prompt the user to enter it
    let userName = profile.full_name?.trim().toLowerCase();
    if (!userName || userName === 'unknown user') {
      const newName = window.prompt('To verify, we need your full name. Please enter it EXACTLY as it appears on your TPwecan registration:');
      
      if (!newName || newName.trim() === '') {
        setError('Verification cancelled. Name is required.');
        setLoading(false);
        return;
      }
      
      // Save the corrected name to the database automatically
      const formattedName = newName.trim();
      await supabase.from('profiles').update({ full_name: formattedName }).eq('id', user.id);
      userName = formattedName.toLowerCase();
    }

    const enteredId = tpwecanId.trim().toUpperCase();

    // 4. CHECK TPWECAN DATABASE FOR THE ID
    const { data: member, error: memberError } = await supabase
      .from('tpwecan_members')
      .select('full_name')
      .eq('tpwecan_id', enteredId)
      .single();

    // RUTHLESS CHECK 1: ID MUST EXIST
    if (memberError || !member) {
      setError(`❌ BLOCKED!\nThe ID "${enteredId}" does not exist in our TPwecan database.`);
      setLoading(false);
      return; 
    }

    // RUTHLESS CHECK 2: NAMES MUST MATCH EXACTLY (Case-insensitive)
    const tpwecanName = member.full_name.trim().toLowerCase();
    if (tpwecanName !== userName) {
      setError(`❌ BLOCKED! Name mismatch.\n\nYour Profile Name: "${profile.full_name}"\nTPwecan Registered Name: "${member.full_name}"\n\nPlease ensure both names match exactly, then try again.`);
      setLoading(false);
      return;
    }

    // 5. SUCCESS! UPGRADE USER TO PROVIDER
    await supabase.from('profiles').update({ 
      role: 'provider', 
      tpwecan_verified: true, 
      tpwecan_id: enteredId 
    }).eq('id', user.id);

    alert('✅ SUCCESS! You are now a verified Provider.');
    router.replace('/provider/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1E293B] rounded-3xl p-8 border border-white/10 shadow-2xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 mb-6 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        
        <div className="text-center mb-6">
          <Shield className="text-[#ccff00] mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-black text-white">Provider Verification</h1>
          <p className="text-slate-400 text-sm mt-2">Enter your TPwecan ID. Your profile name must match your TPwecan registration exactly.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={tpwecanId}
            onChange={(e) => {
              setTpwecanId(e.target.value);
              setError(''); // Clear error when typing
            }}
            placeholder="e.g. WCN-A4EB6A26"
            className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-4 px-4 text-white placeholder:text-slate-500 focus:border-[#ccff00] focus:outline-none uppercase font-mono tracking-wider"
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
            className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify TPwecan ID'}
          </button>
        </form>
      </div>
    </div>
  );
}