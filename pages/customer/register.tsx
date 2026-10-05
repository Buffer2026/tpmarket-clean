import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { User, Mail, Phone, Globe, MapPin, Gift } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';
import PasswordInput from '../../components/PasswordInput';

const countries = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Other'];
const states = [
  'Lagos',
  'Abuja (FCT)',
  'Ogun',
  'Oyo',
  'Rivers',
  'Kano',
  'Kaduna',
  'Enugu',
  'Delta',
  'Edo',
  'Other',
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.5C29.5 35.3 26.9 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.9 39.7 16.4 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.5 5.9l6.5 5.5C39.5 37.4 44 31.2 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

export default function CustomerRegister() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('Lagos');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreed, setAgreed] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push({ pathname: '/customer/otp', query: { phone } });
  }

  return (
    <PageShell>
      <Head>
        <title>Customer Sign Up — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="flex flex-col items-center justify-center px-6 py-16 relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] mb-2">Become Tp Market Valuable Customer</h1>
          <p className="text-[#64748B] font-medium">90 days guarantee on everything you paid for here!</p>
        </div>

        <div className="w-full max-w-md bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white text-[#0F172A] font-bold py-3.5 rounded-xl mb-6 hover:bg-white/90 transition-colors"
          >
            <GoogleIcon /> Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-slate text-xs font-semibold">OR</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate mb-1.5 block">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={16} />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-2 text-sm text-white focus:outline-none focus:border-lemon/50"
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate mb-1.5 block">State</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={16} />
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-2 text-sm text-white focus:outline-none focus:border-lemon/50"
                  >
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 XXX XXX XXXX"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate mb-1.5 block">Password</label>
              <PasswordInput required />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate mb-1.5 block">Referral Code (Optional)</label>
              <div className="relative">
                <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="e.g. AMARA123"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                />
              </div>
              <p className="text-slate text-[11px] mt-1.5">Have a referral code? Enter it here to earn bonus Credit Coins!</p>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#CCFF00] cursor-pointer"
              />
              <span className="text-slate text-xs leading-relaxed">I agree to Terms and Conditions</span>
            </label>

            <button
              type="submit"
              disabled={!agreed}
              className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              Create Account
            </button>
          </form>
        </div>

        <Link
          href="/customer/login"
          className="block text-center w-full max-w-md bg-white/70 backdrop-blur-xl border-2 border-sky text-[#0F172A] font-black py-3.5 rounded-full mt-6 hover:scale-[1.02] hover:bg-white transition-all"
        >
          I'm a Customer - Login
        </Link>
      </div>
    </PageShell>
  );
}
