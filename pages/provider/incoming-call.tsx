import Head from 'next/head';
import Link from 'next/link';
import { Phone, X } from 'lucide-react';

const mockJob = {
  customer: 'Amara Okafor',
  style: 'Custom Agbada',
};

export default function IncomingCall() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-between py-16 px-6 relative overflow-hidden">
      <Head>
        <title>Incoming Call — TPMarket AI</title>
      </Head>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-lemon/10 rounded-full blur-[100px]" />
      </div>

      <div className="text-center relative">
        <p className="text-slate text-sm font-bold tracking-wide uppercase mb-2">Incoming Call</p>
        <h1 className="text-2xl font-black">TPMarket AI Assistant</h1>
      </div>

      <div className="flex flex-col items-center relative">
        <div className="w-32 h-32 rounded-full bg-lemon/10 border-4 border-lemon/40 flex items-center justify-center mb-6 animate-pulse">
          <Phone className="text-lemon" size={52} />
        </div>
        <p className="text-lemon font-black text-lg tracking-wide mb-8">Ringing…</p>

        <div className="bg-darkcard rounded-3xl p-6 border border-white/10 w-full max-w-sm text-left">
          <p className="text-slate text-xs font-bold uppercase tracking-wide mb-2">New Job Alert 🔔</p>
          <p className="text-white text-base font-semibold leading-relaxed">
            “You have a new {mockJob.style} job from {mockJob.customer}. Login to view details.”
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 relative">
        <Link
          href="/provider/settings"
          aria-label="Decline"
          className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <X size={26} />
        </Link>
        <Link
          href="/dashboard/provider"
          aria-label="Answer"
          className="w-16 h-16 rounded-full bg-lemon text-[#0F172A] flex items-center justify-center hover:scale-105 hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all"
        >
          <Phone size={26} />
        </Link>
      </div>
    </div>
  );
}
