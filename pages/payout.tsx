import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';

export default function PayoutSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState('');

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    loadPayoutDetails();
  }, []);

  async function loadPayoutDetails() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/signin'); return; }
    setUserId(user.id);

    // Check if they already have saved bank details
    const { data } = await supabase.from('payout_details').select('*').eq('user_id', user.id).single();
    if (data) {
      setBankName(data.bank_name);
      setAccountNumber(data.account_number);
      setAccountName(data.account_name);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Save or update the bank details
    const { error } = await supabase.from('payout_details').upsert({
      user_id: userId,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      updated_at: new Date()
    });

    if (error) {
      alert('Error saving: ' + error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24">
      <Head><title>Payout Settings — TPMarket</title></Head>

      {/* HEADER */}
      <div className="bg-[#1E293B] p-6 border-b border-white/10 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white"><ArrowLeft size={24} /></button>
        <div>
          <h1 className="text-xl font-black text-white">Payout Settings</h1>
          <p className="text-slate-400 text-xs">Add your bank details to receive funds via Paystack.</p>
        </div>
      </div>

      <div className="p-6 max-w-lg mx-auto">
        {success && (
          <div className="bg-green-500/20 text-green-400 p-4 rounded-xl mb-6 flex items-center gap-2 font-bold">
            <CheckCircle size={20} /> Bank details saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">Bank Name *</label>
            <input required type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. GTBank, Access Bank" className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3.5 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">Account Number *</label>
            <input required type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="0123456789" maxLength={10} className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3.5 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">Account Name *</label>
            <input required type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Name on the account" className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3.5 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={20} /> {loading ? 'Saving...' : 'Save Payout Details'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-[#1E293B] rounded-xl border border-white/5">
          <p className="text-xs text-slate-400 text-center">
            🔒 Your bank details are encrypted and securely stored. Funds are only transferred by our verified third-party fund manager (Paystack) after a successful transaction.
          </p>
        </div>
      </div>
    </div>
  );
}