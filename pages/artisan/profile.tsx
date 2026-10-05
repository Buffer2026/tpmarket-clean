import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  ShieldCheck,
  Ruler,
  CreditCard,
  ArrowLeft,
  Wallet,
  Landmark,
  PlayCircle,
} from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';
import MediaUploader, { MediaFile } from '../../components/MediaUploader';
import MediaLightbox from '../../components/MediaLightbox';

type Step = 'profile' | 'quote-form' | 'job-status' | 'final' | 'paid';
type PaymentMethod = 'card' | 'bank' | 'wallet';

const artisan = {
  name: 'Emeka Okoro',
  title: 'Carpenter Certified',
  rank: 'Week 7',
  specializations: ['Wood Work', 'Kitchen Cabinet', 'Decoration'],
  experience: '16 years',
  rating: 4.9,
};

const stepOrder: Step[] = ['profile', 'quote-form', 'job-status', 'final', 'paid'];

function MiniGallery({ files, onOpen }: { files: MediaFile[]; onOpen: (f: MediaFile) => void }) {
  if (files.length === 0) return null;
  return (
    <div className="grid grid-cols-4 gap-2">
      {files.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => f.ready && onOpen(f)}
          className="relative aspect-square rounded-xl overflow-hidden bg-white/10"
        >
          {f.type === 'image' ? (
            <img src={f.url} alt={f.file.name} className="w-full h-full object-cover" />
          ) : (
            <video src={f.url} muted className="w-full h-full object-cover" />
          )}
          {f.type === 'video' && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/20">
              <PlayCircle className="text-white" size={18} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function ArtisanProfile() {
  const [step, setStep] = useState<Step>('profile');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [customerMedia, setCustomerMedia] = useState<MediaFile[]>([]);
  const [providerMedia, setProviderMedia] = useState<MediaFile[]>([]);
  const [lightboxFile, setLightboxFile] = useState<MediaFile | null>(null);

  const currentIndex = stepOrder.indexOf(step);

  function goTo(next: Step) {
    setStep(next);
  }

  function handleBack() {
    const prevIndex = Math.max(0, currentIndex - 1);
    goTo(stepOrder[prevIndex]);
  }

  function handleSendRequest() {
    setStep('job-status');
  }

  function handleConfirmPayment() {
    setShowPaymentModal(false);
    setStep('paid');
  }

  return (
    <PageShell>
      <Head>
        <title>Artisan Profile — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-2xl mx-auto px-6 py-10 relative">
        {step !== 'profile' && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <div className="flex items-center justify-center gap-2 mb-8">
          {stepOrder.slice(0, 4).map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${i <= currentIndex ? 'bg-lemon w-8' : 'bg-white/40 w-4'}`}
            />
          ))}
        </div>

        {step === 'profile' && (
          <div className="bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] text-center">
            <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-lemon/40 flex items-center justify-center text-4xl mx-auto mb-4">
              🧑🏾‍🔧
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-white">{artisan.title}</h1>
              <ShieldCheck className="text-lemon" size={22} />
            </div>
            <p className="text-slate text-sm mb-6">
              {artisan.name} · ⭐ {artisan.rating}
            </p>

            <div className="grid grid-cols-1 gap-3 text-left mb-8">
              <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-slate text-sm font-semibold">🏆 Rank</span>
                <span className="text-white font-black">{artisan.rank}</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <span className="text-slate text-sm font-semibold block mb-2">🪚 Area of Specialization</span>
                <div className="flex flex-wrap gap-2">
                  {artisan.specializations.map((spec) => (
                    <span key={spec} className="text-xs font-bold px-3 py-1.5 rounded-full bg-purple/10 text-purple">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-slate text-sm font-semibold">📅 Experience</span>
                <span className="text-white font-black">{artisan.experience}</span>
              </div>
            </div>

            <button
              onClick={() => goTo('quote-form')}
              className="w-full bg-lemon text-[#0F172A] font-black py-4 rounded-full hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all"
            >
              Connect with me Now! 🔥
            </button>
          </div>
        )}

        {step === 'quote-form' && (
          <div className="bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
            <h2 className="text-2xl font-black text-white mb-2 text-center">Request a Quote 📝</h2>
            <p className="text-slate text-sm text-center mb-6">
              Describe what you want and wait for the provider to reply...
            </p>
            <textarea
              value={quoteMessage}
              onChange={(e) => setQuoteMessage(e.target.value)}
              rows={5}
              placeholder="e.g. I need a custom kitchen cabinet, 3m x 2m, oak finish..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50 mb-6 resize-none"
            />

            <h3 className="text-white font-black text-sm mb-3">Show the provider what you need 📸</h3>
            <MediaUploader
              buttonLabel="Upload Photos/Video (1 min max)"
              helperText="Help providers understand your job better"
              onOpenLightbox={setLightboxFile}
              onChange={setCustomerMedia}
            />

            <button
              onClick={handleSendRequest}
              className="w-full bg-lemon text-[#0F172A] font-black py-4 rounded-full hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all mt-6"
            >
              Send Request 🚀
            </button>
          </div>
        )}

        {step === 'job-status' && (
          <div className="space-y-5">
            <div className="bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] text-center">
              <span className="inline-block text-xs font-black px-4 py-2 rounded-full bg-yellow/10 text-yellow mb-6">
                Unsealed Job 📦
              </span>
              <div className="w-16 h-16 rounded-full bg-purple/10 text-purple flex items-center justify-center mx-auto mb-5">
                <Ruler size={28} />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">
                {artisan.name.split(' ')[0]} wants to take measurements first 📏
              </h2>
              <p className="text-slate text-sm max-w-sm mx-auto">
                This job is still unsealed — the final price will be sent to you right after measurement is done.
                You'll get a notification the moment your quote is ready.
              </p>
              {customerMedia.length > 0 && (
                <div className="mt-6 text-left">
                  <p className="text-slate text-xs font-bold mb-2">📎 Attached by you</p>
                  <MiniGallery files={customerMedia} onOpen={setLightboxFile} />
                </div>
              )}
            </div>

            <div className="bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
              <p className="text-xs font-black text-purple uppercase tracking-wide mb-4">
                🔧 Demo: Provider's Send-Quote Screen
              </p>
              <h3 className="text-white font-black text-sm mb-3">Show your work samples 🎥</h3>
              <MediaUploader
                buttonLabel="Upload Portfolio Samples"
                helperText="Build trust by showing your past work"
                exampleText='e.g. "Upload a video of a similar cabinet you built"'
                onOpenLightbox={setLightboxFile}
                onChange={setProviderMedia}
              />
              <button
                onClick={() => goTo('final')}
                className="w-full bg-lemon text-[#0F172A] font-black py-4 rounded-full hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all mt-6"
              >
                Send Final Quote 📤
              </button>
            </div>
          </div>
        )}

        {step === 'final' && (
          <div className="bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] text-center">
            <span className="inline-block text-xs font-black px-4 py-2 rounded-full bg-lemon/10 text-lemon mb-6">
              Quote Ready ✅
            </span>
            <p className="text-slate text-sm font-semibold mb-1">Final Price</p>
            <p className="text-5xl font-black text-white mb-6">₦85,000</p>

            {providerMedia.length > 0 && (
              <div className="text-left mb-6">
                <p className="text-slate text-xs font-bold mb-2">📷 Work samples from {artisan.name}</p>
                <MiniGallery files={providerMedia} onOpen={setLightboxFile} />
              </div>
            )}

            <div className="bg-white/5 rounded-2xl p-4 text-left text-sm text-slate mb-8">
              Measurement complete for your kitchen cabinet job. Price includes materials, labor, and delivery.
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full bg-lemon text-[#0F172A] font-black py-4 rounded-full hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all"
            >
              Deal Sealed 🤝 & Pay
            </button>
          </div>
        )}

        {step === 'paid' && (
          <div className="bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] text-center">
            <div className="w-16 h-16 rounded-full bg-lemon/10 text-lemon flex items-center justify-center mx-auto mb-5 text-3xl">
              🎉
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Payment Successful!</h2>
            <p className="text-slate text-sm mb-8">
              Your job with {artisan.name} is officially sealed 🤝. Funds are held in escrow until delivery.
            </p>
            <Link
              href="/dashboard/customer"
              className="inline-block bg-lemon text-[#0F172A] font-black px-8 py-3.5 rounded-full hover:scale-105 hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
            >
              Go to Dashboard →
            </Link>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm bg-darkcard rounded-3xl p-6 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <h3 className="text-xl font-black text-white mb-1 text-center">Confirm Payment</h3>
            <p className="text-slate text-sm text-center mb-6">₦85,000 to {artisan.name}</p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full flex items-center gap-3 rounded-2xl p-4 border transition-all ${
                  paymentMethod === 'card' ? 'border-lemon bg-lemon/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <CreditCard className="text-lemon" size={20} />
                <span className="text-white font-semibold text-sm">Debit / Credit Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('bank')}
                className={`w-full flex items-center gap-3 rounded-2xl p-4 border transition-all ${
                  paymentMethod === 'bank' ? 'border-lemon bg-lemon/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <Landmark className="text-purple" size={20} />
                <span className="text-white font-semibold text-sm">Bank Transfer</span>
              </button>
              <button
                onClick={() => setPaymentMethod('wallet')}
                className={`w-full flex items-center gap-3 rounded-2xl p-4 border transition-all ${
                  paymentMethod === 'wallet' ? 'border-lemon bg-lemon/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <Wallet className="text-sky" size={20} />
                <span className="text-white font-semibold text-sm">TP Wallet Balance</span>
              </button>
            </div>

            <button
              onClick={handleConfirmPayment}
              className="w-full bg-lemon text-[#0F172A] font-black py-3.5 rounded-full hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.6)] transition-all mb-3"
            >
              Confirm Payment ₦85,000
            </button>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full text-slate text-sm font-semibold py-2 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <MediaLightbox file={lightboxFile} onClose={() => setLightboxFile(null)} />
    </PageShell>
  );
}
