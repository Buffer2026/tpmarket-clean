import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Mail, User, Phone, MapPin, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import PageShell from '../components/PageShell';
import LandingNavbar from '../components/LandingNavbar';
import PasswordInput from '../components/PasswordInput';
import { supabase } from '../lib/supabase'; // <-- ADDED THIS

type Mode = 'login' | 'signup';

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signup'); // Default to signup for testing

  // SIGNUP state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('');
  
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSubmitted, setSignupSubmitted] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setSignupError('');
    setSignupSubmitted(false);
  }

  async function handleSignupSubmit(e: FormEvent) {
    e.preventDefault();
    setSignupError('');
    
    if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
      setSignupError('Name, Email, and Password are required.');
      return;
    }

    setSignupLoading(true);

    try {
      // THIS IS THE REAL SUPABASE CALL THAT TRIGGERS THE DATABASE SAVE!
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          // This sends the data to the "Magic Bridge" trigger we built in SQL
          data: {
            full_name: name,
            phone: phone,
            country: country,
            state: state
          }
        }
      });

      if (error) {
        setSignupError(error.message);
      } else {
        setSignupSubmitted(true);
        // Optional: Redirect to verification page after signup
        // setTimeout(() => router.push('/provider/verify'), 2000);
      }
    } catch (err: any) {
      setSignupError('An unexpected error occurred.');
    } finally {
      setSignupLoading(false);
    }
  }

  return (
    <PageShell>
      <Head>
        <title>{mode === 'login' ? 'Secure Check-In' : 'Sign Up'} — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="flex flex-col items-center justify-center px-6 py-16 relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] mb-2">
            {mode === 'login' ? 'Secure Check-In 🔐' : 'Join TPMarket 🚀'}
          </h1>
          <p className="text-[#64748B] font-medium">No cap, just guaranteed deals.</p>
        </div>

        <div className="w-full max-w-md bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
          <div className="grid grid-cols-2 gap-2 bg-white/5 rounded-full p-1 mb-8">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2.5 rounded-full text-sm font-bold transition-colors ${mode === 'login' ? 'bg-lemon text-[#0F172A]' : 'text-slate'}`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2.5 rounded-full text-sm font-bold transition-colors ${mode === 'signup' ? 'bg-lemon text-[#0F172A]' : 'text-slate'}`}
            >
              Sign Up
            </button>
          </div>

          {signupSubmitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-lemon/20 text-lemon flex items-center justify-center mx-auto mb-4 text-2xl">
                🎉
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
              <p className="text-slate text-sm mb-4">Check your email to confirm your account, then verify your TPwecan ID.</p>
              <button 
                onClick={() => router.push('/provider/verify')}
                className="bg-lemon text-[#0F172A] font-black py-3 px-6 rounded-xl hover:scale-[1.02] transition-all"
              >
                Go to ID Verification
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4" noValidate>
              <div>
                <label className="text-xs font-semibold text-slate mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amara Okafor"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate mb-1.5 block">Country</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Nigeria"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate mb-1.5 block">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Lagos"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate mb-1.5 block">Password</label>
                <PasswordInput value={password} onChange={setPassword} />
              </div>

              {signupError && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={16} />
                  <p className="text-red-300 text-sm font-semibold">{signupError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signupLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account 🚀'}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}