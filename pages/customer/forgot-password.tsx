import { useState, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email.trim() === '') return;
    setSent(true);
  }

  return (
    <PageShell>
      <Head>
        <title>Forgot Password — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="flex flex-col items-center justify-center px-6 py-16 relative">
        <div className="w-full max-w-md bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] text-center">
          {sent ? (
            <>
              <div className="w-14 h-14 rounded-full bg-lemon/20 text-lemon flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={26} />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Check Your Email 📨</h1>
              <p className="text-slate text-sm">A password reset link has been sent to {email}.</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black text-white mb-2">Forgot Password?</h1>
              <p className="text-slate text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
                <button
                  type="submit"
                  className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          )}
        </div>
        <Link href="/customer/login" className="flex items-center gap-1 text-[#0F172A]/70 hover:text-[#0F172A] font-semibold text-sm mt-8 transition-colors">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </PageShell>
  );
}
