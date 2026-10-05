import { useState, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Check, User, Layers, Tag, Wallet, Send, ArrowLeft } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

const steps = ['Quote Accepted', 'Cutting & Sewing', 'Ready for Pickup', 'Delivered'];
const currentStepIndex = 1;

const job = {
  tailor: 'Kunle Adebayo',
  style: 'Senator Suit',
  fabric: 'Senator/Cashmere',
  totalPrice: 50000,
  isInstallment: true,
  amountPaid: 20000,
};

interface ChatMessage {
  sender: 'tailor' | 'customer';
  text: string;
}

const initialMessages: ChatMessage[] = [{ sender: 'tailor', text: 'Hello! I have started cutting your fabric.' }];

function formatNaira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function JobTracking() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (input.trim() === '') return;
    setMessages((prev) => [...prev, { sender: 'customer', text: input.trim() }]);
    setInput('');
  }

  const paidPct = job.isInstallment ? Math.min(100, Math.round((job.amountPaid / job.totalPrice) * 100)) : 100;

  return (
    <PageShell>
      <Head>
        <title>Job Tracking — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-2xl mx-auto px-6 py-10 relative">
        <Link href="/dashboard/customer" className="flex items-center gap-1 text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">Track Your Order 📦</h1>
        <p className="text-[#64748B] font-medium mb-8">{job.style} — with {job.tailor}</p>

        {/* STATUS TRACKER */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <div className="flex items-start">
            {steps.map((step, i) => {
              const isDone = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const isActive = isDone || isCurrent;
              return (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <div
                      className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${i <= currentStepIndex ? 'bg-lemon' : 'bg-white/15'}`}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isActive ? 'bg-lemon text-[#0F172A]' : 'bg-white/10 text-slate'
                    } ${isCurrent ? 'shadow-[0_0_16px_rgba(204,255,0,0.6)] scale-110' : ''}`}
                  >
                    {isDone ? <Check size={16} /> : i + 1}
                  </div>
                  <p className={`text-[10px] sm:text-xs font-bold text-center mt-2 px-1 ${isActive ? 'text-lemon' : 'text-slate'}`}>
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* JOB DETAILS */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <h2 className="text-white font-black text-lg mb-5">Job Details 🧵</h2>
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate text-sm">
                <User size={15} /> Tailor
              </span>
              <span className="text-white font-bold text-sm">{job.tailor}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate text-sm">
                <Layers size={15} /> Style
              </span>
              <span className="text-white font-bold text-sm">{job.style}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate text-sm">
                <Tag size={15} /> Fabric
              </span>
              <span className="text-white font-bold text-sm">{job.fabric}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate text-sm">
                <Wallet size={15} /> Total Price
              </span>
              <span className="text-lemon font-black text-sm">{formatNaira(job.totalPrice)}</span>
            </div>
          </div>

          {job.isInstallment && (
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate font-semibold">
                  Paid: {formatNaira(job.amountPaid)} / {formatNaira(job.totalPrice)}
                </span>
                <span className="text-white font-bold">{paidPct}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-lemon rounded-full" style={{ width: `${paidPct}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* LIVE CHAT */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
          <h2 className="text-white font-black text-lg mb-4">Message {job.tailor} 💬</h2>

          <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.sender === 'customer' ? 'bg-lemon text-[#0F172A] font-semibold' : 'bg-white/10 text-white'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 bg-white/5 border border-white/10 rounded-full py-3 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="w-11 h-11 rounded-full bg-lemon text-[#0F172A] flex items-center justify-center shrink-0 hover:scale-105 hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
