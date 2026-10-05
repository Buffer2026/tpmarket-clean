import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Mail, User, Phone, ShieldCheck, ShieldAlert } from 'lucide-react';
import PageShell from '../components/PageShell';
import LandingNavbar from '../components/LandingNavbar';
import PasswordInput from '../components/PasswordInput';

type Mode = 'login' | 'signup';
type LoginStep = 'phone' | 'otp' | 'success';

export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');

  // LOGIN (phone + OTP) state
  const [loginStep, setLoginStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);

  // SIGNUP state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSubmitted, setSignupSubmitted] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setLoginStep('phone');
    setPhone('');
    setOtp('');
    setOtpError(false);
    setSignupError('');
    setSignupSubmitted(false);
  }

  function handleSendToken(e: FormEvent) {
    e.preventDefault();
    if (phone.trim() === '') return;
    setOtpError(false);
    setLoginStep('otp');
  }

  function handleVerifyToken(e: FormEvent) {
    e.preventDefault();
    if (otp.trim() === '1234') {
      setOtpError(false);
      setLoginStep('success');
      setTimeout(() => router.push('/dashboard/customer'), 1500);
    } else {
      setOtpError(true);
    }
  }

  function handleSignupSubmit(e: FormEvent) {
    e.preventDefault();
    setSignupError('');
    if (name.trim() === '') {
      setSignupError('Please enter your full name.');
      return;
    }
    if (email.trim() === '' || password.trim() === '') {
      setSignupError('Email and password are required.');
      return;
    }
    setSignupSubmitted(true);
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

          {mode === 'login' ? (
            <>
              {loginStep === 'phone' && (
                <form onSubmit={handleSendToken} className="space-y-4" noValidate>
                  <div>
                    <label className="text-xs font-semibold text-slate mb-1.5 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 XXX XXX XXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
                  >
                    Send Secure Token 📲
                  </button>
                </form>
              )}

              {loginStep === 'otp' && (
                <form onSubmit={handleVerifyToken} className="space-y-4" noValidate>
                  <p className="text-white text-sm font-semibold text-center mb-1">
                    Enter the secure token sent to your phone.
                  </p>
                  <p className="text-slate text-xs text-center mb-2">Sent to {phone}</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 4));
                      setOtpError(false);
                    }}
                    placeholder="1234"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-3xl font-black tracking-[0.5em] text-white placeholder:text-slate/40 focus:outline-none focus:border-lemon/50"
                  />
                  <p className="text-slate/50 text-[10px] text-center">Demo token: 1234</p>

                  {otpError && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                      <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={16} />
                      <p className="text-red-300 text-sm font-semibold">Invalid Token. Access Denied.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
                  >
                    Verify Token
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('phone');
                      setOtp('');
                      setOtpError(false);
                    }}
                    className="w-full text-slate text-xs font-semibold py-1 hover:text-white transition-colors"
                  >
                    ← Change phone number
                  </button>
                </form>
              )}

              {loginStep === 'success' && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-lemon/20 text-lemon flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={26} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Access Granted! ✅</h2>
                  <p className="text-slate text-sm">Redirecting you to your dashboard…</p>
                </div>
              )}
            </>
          ) : signupSubmitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-lemon/20 text-lemon flex items-center justify-center mx-auto mb-4 text-2xl">
                🎉
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Welcome to TPMarket!</h2>
              <p className="text-slate text-sm">This is a demo — real accounts coming soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4" noValidate>
              <div>
                <label className="text-xs font-semibold text-slate mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
                  <input
                    type="text"
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate mb-1.5 block">Password</label>
                <PasswordInput value={password} onChange={setPassword} />
              </div>

              {signupError && (
                <p role="alert" className="text-sm text-yellow font-medium">
                  {signupError}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
              >
                Create Account 🚀
              </button>
            </form>
          )}
        </div>

        <div className="flex gap-6 mt-8 text-sm">
          <Link href="/dashboard/customer" className="text-[#0F172A]/70 hover:text-[#0F172A] font-semibold transition-colors">
            Customer Dashboard →
          </Link>
          <Link href="/dashboard/provider" className="text-[#0F172A]/70 hover:text-[#0F172A] font-semibold transition-colors">
            Provider Dashboard →
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
