import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Wallet, Percent, Gift, Calculator, CalendarClock } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

interface Installment {
  name: string;
  totalCost: number;
  paid: number;
  nextDue: string;
}

const installments: Installment[] = [
  { name: 'Amara Okafor', totalCost: 120000, paid: 60000, nextDue: 'Oct 20, 2026' },
  { name: 'Chidinma Eze', totalCost: 200000, paid: 50000, nextDue: 'Oct 15, 2026' },
  { name: 'Ifeoma Nnamdi', totalCost: 95000, paid: 30000, nextDue: 'Oct 28, 2026' },
  { name: 'Tobi Adeyemi', totalCost: 85000, paid: 85000, nextDue: 'Paid in Full' },
];

function formatNaira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function AdminFinancials() {
  const [amount, setAmount] = useState('100000');
  const [taxPercent, setTaxPercent] = useState('7.5');
  const [result, setResult] = useState<{ tax: number; total: number } | null>(null);

  function handleCalculate() {
    const amt = parseFloat(amount) || 0;
    const pct = parseFloat(taxPercent) || 0;
    const tax = amt * (pct / 100);
    setResult({ tax, total: amt + tax });
  }

  return (
    <PageShell>
      <Head>
        <title>Financials — Admin — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-3xl mx-auto px-6 py-10 relative">
        <Link href="/admin/dashboard" className="flex items-center gap-1 text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Admin Dashboard
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">Financials 💰</h1>
        <p className="text-[#64748B] font-medium mb-8">Platform income, tax tools, and installment tracking.</p>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-darkcard rounded-3xl p-5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-lemon/10 text-lemon flex items-center justify-center mb-3">
              <Wallet size={18} />
            </div>
            <p className="text-slate text-xs mb-1">Total Income</p>
            <p className="text-white font-black text-xl">₦4,820,000</p>
          </div>
          <div className="bg-darkcard rounded-3xl p-5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center mb-3">
              <Percent size={18} />
            </div>
            <p className="text-slate text-xs mb-1">Total Commission</p>
            <p className="text-white font-black text-xl">₦482,000</p>
          </div>
          <div className="bg-darkcard rounded-3xl p-5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-yellow/10 text-yellow flex items-center justify-center mb-3">
              <Gift size={18} />
            </div>
            <p className="text-slate text-xs mb-1">Total Referral Bonus</p>
            <p className="text-white font-black text-xl">₦96,400</p>
          </div>
        </div>

        {/* TAX / VAT CALCULATOR */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <h2 className="flex items-center gap-2 text-white font-black text-lg mb-5">
            <Calculator className="text-lemon" size={20} /> Tax & VAT Calculator
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-slate text-xs font-semibold mb-1.5 block">Amount (₦)</label>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-lg font-black text-white focus:outline-none focus:border-lemon/50"
              />
            </div>
            <div>
              <label className="text-slate text-xs font-semibold mb-1.5 block">Tax %</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-lg font-black text-white focus:outline-none focus:border-lemon/50"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full bg-lemon text-[#0F172A] font-black py-4 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all mb-5"
          >
            <Calculator size={18} /> Calculate
          </button>

          {result && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-slate text-[10px] font-bold uppercase tracking-wide mb-1">Tax Amount</p>
                <p className="text-lemon font-black text-lg">{formatNaira(Math.round(result.tax))}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-slate text-[10px] font-bold uppercase tracking-wide mb-1">Total (incl. Tax)</p>
                <p className="text-white font-black text-lg">{formatNaira(Math.round(result.total))}</p>
              </div>
            </div>
          )}
        </div>

        {/* INSTALLMENT MANAGEMENT */}
        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <h2 className="flex items-center gap-2 text-white font-black text-lg mb-5">
            <CalendarClock className="text-purple" size={20} /> Installment Management
          </h2>

          <div className="space-y-3">
            {installments.map((inst) => {
              const pct = Math.min(100, Math.round((inst.paid / inst.totalCost) * 100));
              const isPaidOff = inst.paid >= inst.totalCost;
              return (
                <div key={inst.name} className="bg-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-bold text-sm">{inst.name}</p>
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full ${
                        isPaidOff ? 'bg-lemon/10 text-lemon' : 'bg-yellow/10 text-yellow'
                      }`}
                    >
                      {inst.nextDue}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate mb-2">
                    <span>
                      Paid {formatNaira(inst.paid)} of {formatNaira(inst.totalCost)}
                    </span>
                    <span className="font-bold">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPaidOff ? 'bg-lemon' : 'bg-purple'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Link
          href="/admin/dashboard"
          className="flex items-center justify-center gap-2 w-full bg-white/10 text-white font-black py-4 rounded-full hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={18} /> Back to Admin
        </Link>
      </div>
    </PageShell>
  );
}
