import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ShieldCheck } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

export default function CustomerOtp() {
  const router = useRouter();
  const phone = typeof router.query.phone === 'string' && router.query.phone ? router.query.phone : 'your phone number';
  const [otp, setOtp] = useState('');

  function handleVerify() {
    router.push('/customer/missions');
  }

  return (
    <PageShell>
      <Head>
        <title>Verify Phone — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="flex flex-col items-center justify-center px-6 py-16 relative">
        <div className="w-full max-w-md bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] text-center">
          <div className="w-14 h-14 rounded-full bg-lemon/10 text-lemon flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={26} />
          </div>

          <h1 className="text-2xl font-black text-white mb-2">Verify Your Number 📲</h1>
          <p className="text-slate text-sm mb-1">We sent a secure token to your phone number.</p>
          <p className="text-slate/60 text-xs mb-8">{phone}</p>

          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-3xl font-black tracking-[0.5em] text-white placeholder:text-slate/30 focus:outline-none focus:border-lemon/50 mb-6"
          />

          <button
            onClick={handleVerify}
            disabled={otp.length !== 4}
            className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            Verify & Enter Dashboard
          </button>
        </div>
      </div>
    </PageShell>
  );
}
