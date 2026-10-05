import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, CreditCard, CheckCircle2 } from 'lucide-react';
import PageShell from '../../../components/PageShell';
import LandingNavbar from '../../../components/LandingNavbar';

const AMOUNT = 10000;

export default function SecureMaintenancePayment() {
  const [paid, setPaid] = useState(false);

  return (
    <PageShell>
      <Head>
        <title>Secure Maintenance Payment — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-md mx-auto px-6 py-16 relative">
        <Link href="/customer/dashboard" className="flex items-center gap-1 text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] text-center">
          {paid ? (
            <>
              <div className="w-16 h-16 rounded-full bg-lemon/20 text-lemon flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={30} />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Secured Maintenance Activated! 🛡️</h1>
              <p className="text-slate text-sm mb-8">
                You can now register up to 15 pieces of equipment for instant response and installment repairs, with a
                90-day guarantee on every repair.
              </p>
              <Link
                href="/customer/dashboard"
                className="inline-block bg-lemon text-[#0F172A] font-black px-8 py-3.5 rounded-full hover:scale-105 hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
              >
                Go to Dashboard →
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-lemon/10 text-lemon flex items-center justify-center mx-auto mb-5">
                <ShieldCheck size={30} />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Secured Maintenance 🛡️</h1>
              <p className="text-slate text-sm mb-6">
                Register up to 15 items and unlock a 90-day guarantee on repairs, instant response, and installment
                repair options — for a one-time fee.
              </p>

              <div className="bg-white/5 rounded-2xl p-5 mb-6">
                <p className="text-slate text-xs font-bold uppercase tracking-wide mb-1">Amount Due</p>
                <p className="text-white font-black text-4xl">₦{AMOUNT.toLocaleString()}</p>
              </div>

              <button
                onClick={() => setPaid(true)}
                className="w-full flex items-center justify-center gap-2 bg-lemon text-[#0F172A] font-black py-4 rounded-full hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all"
              >
                <CreditCard size={18} /> Confirm Payment — ₦{AMOUNT.toLocaleString()}
              </button>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
