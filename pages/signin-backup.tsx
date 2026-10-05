import { useState, useRef, useEffect, FormEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';
import PageShell from '../components/PageShell';
import LandingNavbar from '../components/LandingNavbar';
import { supabase } from '../lib/supabase'; 

type Step = 'identify' | 'otp' | 'success';

const RESEND_SECONDS = 60;
const OTP_LENGTH = 6;

function maskIdentifier(value: string) {
  if (value.includes('@')) {
    const [user, domain] = value.split('@');
    if (!domain) return value;
    const visible = user.slice(0, 3);
    return `${visible}***@${domain}`;
  }
  const digits = value.replace(/\D/g, '');
  let local = digits;
  if (local.startsWith('234')) local = local.slice(3);
  else if (local.startsWith('0')) local = local.slice(1);
  const prefix = local.slice(0, 3);
  return prefix ? `+234 ${prefix} *** ****` : value;
}

export default function SignIn() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('identify');
  const [identifier, setIdentifier] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState(false);
  const [otpMessage, setOtpMessage] = useState(''); // New state for error messages
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Timer Logic
  useEffect(() => {
    if (step !== 'otp') return;
    if (resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, resendIn]);

  function resetAll() {
    setStep('identify');
    setIdentifier('');
    setIdentifierError('');
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError(false);
    setOtpMessage('');
    setResendIn(RESEND_SECONDS);
  }

  function formatPhone(phone: string) {
    if (phone.startsWith('+')) return phone;
    return '+234' + phone.replace(/^0/, '');
  }

  // 1. SEND OTP
  async function handleIdentifySubmit(e: FormEvent) {
    e.preventDefault();
    const value = identifier.trim();
    if (value === '') {
      setIdentifierError('Enter your registered phone number or email to continue.');
      return;
    }
    setIdentifierError('');
    setLoading(true);

    try {
      let error;
      if (value.includes('@')) {
        const { error: emailError } = await supabase.auth.signInWithOtp({ 
          email: value,
          options: { shouldCreateUser: true } 
        });
        error = emailError;
      } else {
        const { error: phoneError } = await supabase.auth.signInWithOtp({ 
          phone: formatPhone(value),
          options: { shouldCreateUser: true }
        });
        error = phoneError;
      }

      if (error) {
        setIdentifierError(error.message || 'Failed to send token.');
      } else {
        setOtp(Array(OTP_LENGTH).fill(''));
        setOtpError(false);
        setOtpMessage('');
        setResendIn(RESEND_SECONDS);
        setStep('otp');
      }
    } catch (err: any) {
      setIdentifierError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  // 2. RESEND OTP
  async function handleResend() {
    if (resendIn > 0 || loading) return;
    setLoading(true);
    setOtpMessage('');
    setOtpError(false);
    
    try {
      let error;
      if (identifier.includes('@')) {
        const { error: emailError } = await supabase.auth.signInWithOtp({ email: identifier });
        error = emailError;
      } else {
        const { error: phoneError } = await supabase.auth.signInWithOtp({ phone: formatPhone(identifier) });
        error = phoneError;
      }
      
      if (error) {
        setOtpError(true);
        setOtpMessage(error.message || 'Failed to resend.');
      } else {
        setOtp(Array(OTP_LENGTH).fill(''));
        setResendIn(RESEND_SECONDS);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setOtpError(true);
      setOtpMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  // OTP Input Handlers
  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError(false);
    setOtpMessage('');
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => (next[i] = char));
    setOtp(next);
    setOtpError(false);
    setOtpMessage('');
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  // 3. VERIFY OTP (Fixed to prevent page crash)
  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setOtpError(true);
      setOtpMessage('Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    setOtpError(false);
    setOtpMessage('');

    try {
      let error;
      if (identifier.includes('@')) {
        const { error: emailError } = await supabase.auth.verifyOtp({
          email: identifier,
          token: code,
          type: 'email',
        });
        error = emailError;
      } else {
        const { error: phoneError } = await supabase.auth.verifyOtp({
          phone: formatPhone(identifier),
          token: code,
          type: 'sms',
        });
        error = phoneError;
      }

      if (error) {
        // Catch the error gracefully instead of crashing the page
        setOtpError(true);
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setOtpMessage('Token expired or invalid. Please request a new one.');
        } else {
          setOtpMessage(error.message || 'Incorrect token. Please try again.');
        }
      } else {
        // Success!
        setStep('success');
        setTimeout(() => router.push('/marketplace'), 1500);
      }
    } catch (err: any) {
      setOtpError(true);
      setOtpMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  // 4. GOOGLE LOGIN
  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/marketplace`,
        },
      });
      if (error) {
        setIdentifierError(error.message || 'Google login failed.');
        setLoading(false);
      }
    } catch (err: any) {
      setIdentifierError('An unexpected error occurred.');
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
          
          {/* STEP 1: IDENTIFY */}
          {step === 'identify' && (
            <form onSubmit={handleIdentifySubmit} className="space-y-5" noValidate>
              <h1 className="text-2xl font-black text-white text-center">Sign In to tpmarket</h1>
              <div>
                <label className="text-xs font-semibold text-slate mb-1.5 block">
                  Enter your registered Phone Number or Email
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setIdentifierError('');
                  }}
                  placeholder="Phone number or email"
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
                {loading ? 'Sending...' : 'Send 6-Digit Token'}
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="px-3 text-slate/60 text-xs font-semibold">OR</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white text-[#0F172A] font-bold text-base py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
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

          {/* STEP 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerify} className="space-y-5" noValidate>
              <button
                type="button"
                onClick={() => setStep('identify')}
                className="flex items-center gap-1.5 text-slate text-xs font-semibold hover:text-white transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="text-center">
                <h1 className="text-xl font-black text-white mb-1">Enter Your 6-Digit Token</h1>
                <p className="text-slate text-xs sm:text-sm">Sent to {maskIdentifier(identifier)}</p>
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-black text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-lemon/50"
                  />
                ))}
              </div>

              {otpError && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={16} />
                  <p className="text-red-300 text-sm font-semibold">{otpMessage || 'That token didn&apos;t match. Try again.'}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <p className="text-center text-xs">
                {resendIn > 0 ? (
                  <span className="text-slate/60 font-semibold">Resend Token in 0:{resendIn.toString().padStart(2, '0')}</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResend} 
                    disabled={loading}
                    className="text-lemon font-bold hover:underline disabled:opacity-50"
                  >
                    Resend Token
                  </button>
                )}
              </p>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-lemon/20 text-lemon flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={26} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">You&apos;re in! ✅</h2>
              <p className="text-slate text-sm">Redirecting you to your dashboard…</p>
            </div>
          )}
        </div>

        {step === 'otp' && (
          <button
            type="button"
            onClick={resetAll}
            className="mt-6 text-[#334155] text-xs font-semibold hover:text-[#0F172A] transition-colors"
          >
            Start over
          </button>
        )}
      </div>
    </PageShell>
  );
}