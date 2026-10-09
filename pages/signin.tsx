import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import PageShell from '../components/PageShell';
import LandingNavbar from '../components/LandingNavbar';
import { supabase } from '../lib/supabase'; 

export default function SignIn() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  async function handleIdentifySubmit(e: FormEvent) {
    e.preventDefault();
    const value = identifier.trim();
    
    if (value === '') {
      setIdentifierError('Enter your registered email to continue.');
      return;
    }
    
    setIdentifierError('');
    setLoading(true);
    setSuccessMessage('');

    try {
      // This sends the Magic Link
      const { error } = await supabase.auth.signInWithOtp({ 
        email: value,
        options: { 
          shouldCreateUser: true,
          // Redirects to /marketplace on localhost or your live site automatically
          emailRedirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/marketplace` 
            : 'https://tpmarket.ng/marketplace'
        } 
      });

      if (error) {
        setIdentifierError(error.message || 'Failed to send login link.');
      } else {
        setSuccessMessage('Login link sent! Check your email (and spam folder) to sign in.');
      }
    } catch (err: any) {
      setIdentifierError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <Head>
        <title>Sign In — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="flex flex-col items-center justify-center px-6 py-16 relative">
        <div className="w-full max-w-md bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
          
          {successMessage ? (
            // SUCCESS STATE
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-lemon/20 text-lemon flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={26} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check Your Email! ✉️</h2>
              <p className="text-slate text-sm">{successMessage}</p>
              <button 
                onClick={() => { setSuccessMessage(''); setIdentifier(''); }}
                className="text-lemon text-sm font-bold hover:underline mt-4"
              >
                Use a different email
              </button>
            </div>
          ) : (
            // LOGIN FORM
            <form onSubmit={handleIdentifySubmit} className="space-y-5" noValidate>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-slate text-xs font-semibold hover:text-white transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <h1 className="text-2xl font-black text-white text-center">Sign In to tpmarket</h1>
              
              <div>
                <label className="text-xs font-semibold text-slate mb-1.5 block">
                  Enter your registered Email
                </label>
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setIdentifierError('');
                  }}
                  placeholder="you@example.com"
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                />
                {identifierError && <p className="text-red-400 text-xs font-semibold mt-2">{identifierError}</p>}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lemon text-[#0F172A] font-black text-base py-4 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Link...' : 'Send Login Link'}
              </button>

              <p className="text-slate/60 text-[11px] text-center">
                Login required if logged out or after 24 hours.
              </p>
              <p className="text-slate text-xs text-center">
                New here?{' '}
                <Link href="/auth" className="text-lemon font-bold hover:underline">
                  Create an Account
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}