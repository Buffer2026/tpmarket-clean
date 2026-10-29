import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

export default function UniversalSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState(1);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('');

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            country: country,
            state: state,
          },
          emailRedirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/dashboard` 
            : 'https://tpmarket.ng/dashboard'
        }
      });

      if (error) throw error;
      
      setSuccessMessage(`Verification link sent to ${email}! Check your inbox.`);
      setStep(2);
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/dashboard`
          : 'https://tpmarket.ng/dashboard'
      }
    });
    if (error) alert('Google sign-in error: ' + error.message);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6">
      <Head><title>Sign Up — TPMarket</title></Head>

      <div className="w-full max-w-lg bg-[#1E293B] rounded-3xl p-8 border border-white/10 shadow-2xl">
        {step === 1 ? (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-white mb-2">Join TPMarket</h1>
              <p className="text-slate-400 text-sm">One account for everything. Shop, Sell, and Manage.</p>
            </div>

            {/* Social Sign-In */}
            <div className="space-y-3 mb-6">
              <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 bg-white text-[#0F172A] font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-all">
                Continue with Google
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1E293B] px-2 text-slate-400">Or sign up with email</span></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
              
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
                <input required type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#ccff00] focus:outline-none" />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#ccff00] text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 mt-6">
                {loading ? 'Sending Link...' : 'Sign Up & Verify Email'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-400" size={48} />
            </div>
            <h2 className="text-2xl font-black text-white mb-4">Check Your Email!</h2>
            <p className="text-slate-300 mb-6">{successMessage}</p>
            <button onClick={() => router.push('/')} className="text-[#ccff00] font-bold hover:underline">Return to Homepage</button>
          </div>
        )}
      </div>
    </div>
  );
}