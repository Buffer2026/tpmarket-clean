import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Layers, Tag, MessageSquareText, Wallet, CalendarDays, Send, CheckCircle2 } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';
import AvatarPreview, { baseline } from '../../components/AvatarPreview';

const request = {
  customer: 'Amara Okafor',
  style: 'Senator Suit',
  fabric: 'Senator/Cashmere',
  description:
    'I need this for a wedding in December. Please make the shoulders slightly looser and add gold buttons.',
};

const customerMeasurements = { ...baseline.man, chest: 106, waist: 84, shoulder: 50 };

export default function ReviewQuote() {
  const [totalPrice, setTotalPrice] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [installmentsAllowed, setInstallmentsAllowed] = useState(true);
  const [sent, setSent] = useState(false);

  return (
    <PageShell>
      <Head>
        <title>Review Quote — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-2xl mx-auto px-6 py-10 relative">
        <Link href="/dashboard/provider" className="flex items-center gap-1 text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">Review Quote Request 🧵</h1>
        <p className="text-[#64748B] font-medium mb-8">From {request.customer}</p>

        {/* CUSTOMER REQUEST SUMMARY */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <h2 className="text-white font-black text-lg mb-5">Customer Request 📋</h2>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6">
            <div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="text-lemon shrink-0" size={16} />
                  <p className="text-white text-sm">
                    <span className="text-slate">Style:</span> <span className="font-bold">{request.style}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="text-purple shrink-0" size={16} />
                  <p className="text-white text-sm">
                    <span className="text-slate">Fabric:</span> <span className="font-bold">{request.fabric}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white/5 border border-white/10 rounded-2xl p-3">
                <MessageSquareText className="text-sky shrink-0 mt-0.5" size={16} />
                <p className="text-slate text-sm italic">“{request.description}”</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate text-[10px] font-bold uppercase tracking-wide mb-2">Customer's Measurements</p>
              <div className="w-32 mx-auto">
                <AvatarPreview gender="man" view="front" measurements={customerMeasurements} />
              </div>
            </div>
          </div>
        </div>

        {/* TAILOR PRICING */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <h2 className="text-white font-black text-lg mb-5">Set Your Price 💰</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-slate text-xs font-semibold mb-1.5 block">Total Price (₦)</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
                <input
                  type="number"
                  min={0}
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  placeholder="85000"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-lg font-black text-white placeholder:text-slate/40 focus:outline-none focus:border-lemon/50"
                />
              </div>
            </div>
            <div>
              <label className="text-slate text-xs font-semibold mb-1.5 block">Delivery Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" size={18} />
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-lemon/50 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4">
            <div>
              <p className="text-white font-bold text-sm">Allow Customer to pay in Installments</p>
              <p className="text-slate text-xs">Customer can split payment instead of paying in full upfront.</p>
            </div>
            <button
              type="button"
              onClick={() => setInstallmentsAllowed((v) => !v)}
              aria-label="Toggle installments"
              className={`relative w-14 h-8 rounded-full shrink-0 transition-colors ${installmentsAllowed ? 'bg-lemon' : 'bg-white/15'}`}
            >
              <span className={`absolute top-1 w-6 h-6 rounded-full bg-[#0F172A] transition-all ${installmentsAllowed ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* ACTION */}
        {sent ? (
          <div className="bg-darkcard rounded-3xl p-8 border border-white/10 text-center">
            <div className="w-14 h-14 rounded-full bg-lemon/20 text-lemon flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={26} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Quote Sent! 📩</h2>
            <p className="text-slate text-sm">{request.customer} will be notified to review and pay.</p>
          </div>
        ) : (
          <button
            onClick={() => setSent(true)}
            disabled={!totalPrice || !deliveryDate}
            className="w-full bg-lemon text-[#0F172A] font-black py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <Send size={18} /> Send Quote to Customer 📩
          </button>
        )}
      </div>
    </PageShell>
  );
}
