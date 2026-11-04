import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { Shield, UserPlus, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminAddMember() {
  const router = useRouter();
  const [tpwecanId, setTpwecanId] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  // 🔒 ULTIMATE SECURITY: Only YOU can access this page.
  const ADMIN_EMAIL = 'afecgivers@gmail.com'; 

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/signin');
        return;
      }
      if (user.email !== ADMIN_EMAIL) {
        setAccessDenied(true);
      }
    }
    checkAdmin();
  }, []);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    const cleanId = tpwecanId.trim().toUpperCase();
    const cleanName = fullName.trim();

    if (!cleanId || !cleanName) {
      setMessage('❌ Please fill in both fields.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('tpwecan_members')
      .insert([{ tpwecan_id: cleanId, full_name: cleanName }]);

    if (error) {
      setMessage(`❌ Error: ${error.message}`);
    } else {
      setMessage('✅ Member added successfully!');
      setIsSuccess(true);
      setTpwecanId('');
      setFullName('');
    }
    setLoading(false);
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={64} />
          <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1E293B] rounded-3xl p-8 border border-white/10">
        <div className="text-center mb-6">
          <Shield className="text-[#ccff00] mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-black text-white">Admin Control Panel</h1>
          <p className="text-slate-400 text-sm mt-2">Add new verified TPwecan members.</p>
        </div>

        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block">TPwecan ID</label>
            <input
              type="text"
              value={tpwecanId}
              onChange={(e) => setTpwecanId(e.target.value)}
              placeholder="e.g. WCN-A4EB6A26"
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-4 px-4 text-white uppercase font-mono tracking-wider focus:border-[#ccff00] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Richard Akinjise"
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-4 px-4 text-white focus:border-[#ccff00] focus:outline-none"
              required
            />
          </div>
          
          {message && (
            <div className={`p-3 rounded-xl text-center font-bold text-sm ${isSuccess ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={20} /> Add Member</>}
          </button>
        </form>

        <button onClick={() => router.push('/')} className="w-full mt-4 text-slate-400 text-sm hover:text-white">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}