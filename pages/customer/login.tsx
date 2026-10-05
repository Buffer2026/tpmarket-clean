import { useState, useEffect, useRef, FormEvent, KeyboardEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { User, ShieldCheck } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

type Step = 'identify' | 'token';
const RESEND_SECONDS = 60;

export default function CustomerLogin() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('identify');
  const [identifier, setIdentifier] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== 'token') return;
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

  function handleSendToken(e: FormEvent) {
    e.preventDefault();
    if (identifier.trim() === '') return;
    setDigits(Array(6).fill(''));
    setCountdown(RESEND_SECONDS);
    setStep('token');
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }

  function handleResend() {
    if (countdown > 0) return;
    setDigits(Array(6).fill(''));
    setCountdown(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
  }

  function handleDigitChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleDigitKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (digits.some((d) => d === '')) return;
    router.push('/customer/dashboard');
  }

  return (
    <PageShell>
      <Head>
        <title>Sign In — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="flex flex-col items-center justify-center px-6 py-16 relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] mb-2">Welcome Back to tpmarket</h1>
          <p className="text-[#64748B] font-medium">No passwords. Just a secure access token.</p>
        </div>

        <div className="w-full max-w-md bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] overflow-hidden">
          <div
            className="transition-all duration-300 ease-out"
            style={{ opacity: 1 }}
          >
            {step === 'identify' ? (
              <form onSubmit={handleSendToken} className="space-y-5" key="identify">
                <div>
                  <label className="text-xs font-semibold text-slate mb-1.5 block">
                    Enter your registered Phone Number or Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="+234 XXX XXX XXXX or you@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-lemon text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
                >
                  Send Access Token
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5" key="token">
                <div className="text-center">
                  <ShieldCheck className="text-lemon mx-auto mb-3" size={26} />
                  <h2 className="text-xl font-black text-white mb-1">Enter Access Token</h2>
                  <p className="text-slate text-xs">We sent a 6-digit token to your registered phone/email.</p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleDigitChange(i, e)}
                      onKeyDown={(e) => handleDigitKeyDown(i, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-lemon/50"
                    />
                  ))}
                </div>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-slate text-xs font-semibold">Resend Token in {countdown}s</p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-lemon text-xs font-bold hover:underline"
                    >
                      Resend Token
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={digits.some((d) => d === '')}
                  className="w-full bg-lemon text-[#0F172A] font-black py-4 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  Verify & Access Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setStep('identify')}
                  className="w-full text-slate text-xs font-semibold py-1 hover:text-white transition-colors"
                >
                  ← Change phone/email
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-[#0F172A]/70 text-sm mt-8">
          Don't have an account?{' '}
          <Link href="/customer/register" className="font-bold text-[#0F172A] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
