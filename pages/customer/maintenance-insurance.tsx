import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { TrendingDown, ArrowLeft, CheckCircle2 } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

const plans = [
  { key: 'basic', label: 'Basic', monthly: 1500, covers: 'Up to 3 items' },
  { key: 'standard', label: 'Standard', monthly: 2500, covers: 'Up to 8 items' },
  { key: 'premium', label: 'Premium', monthly: 4500, covers: 'Up to 15 items' },
];

export default function MaintenanceInsurance() {
  const [selectedPlan, setSelectedPlan] = useState(plans[1].key);
  const [subscribed, setSubscribed] = useState(false);

  const plan = plans.find((p) => p.key === selectedPlan)!;

  return (
    <PageShell>
      <Head>
        <title>Maintenance Insurance — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-xl mx-auto px-6 py-10 relative">
        <Link href="/customer/missions" className="flex items-center gap-1 text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Missions
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">Cut Down Maintenance Cost 📉</h1>
          <p className="text-[#64748B] font-medium">
            Upgrade your registered equipment to a 3-year maintenance insurance plan.
          </p>
        </div>

        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <ul className="space-y-2 text-slate text-sm">
            <li>✅ Pay a small monthly token instead of large repair bills</li>
            <li>✅ Covers maintenance & spare parts</li>
            <li>✅ Partnered with regulated insurance firms</li>
            <li>✅ Cut your maintenance costs by up to 40% — no getting cheated</li>
          </ul>
        </div>

        {subscribed ? (
          <div className="bg-darkcard rounded-3xl p-8 border border-white/10 text-center">
            <div className="w-14 h-14 rounded-full bg-lemon/20 text-lemon flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={26} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">You're Covered! 🛡️</h2>
            <p className="text-slate text-sm">
              {plan.label} plan active — ₦{plan.monthly.toLocaleString()}/month for 3 years.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {plans.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setSelectedPlan(p.key)}
                  className={`text-left rounded-2xl border-2 p-4 transition-all ${
                    selectedPlan === p.key
                      ? 'border-lemon bg-lemon/10 shadow-[0_0_16px_rgba(204,255,0,0.5)]'
                      : 'border-white/10 bg-darkcard hover:border-white/25'
                  }`}
                >
                  <p className={`font-black text-sm mb-1 ${selectedPlan === p.key ? 'text-lemon' : 'text-white'}`}>{p.label}</p>
                  <p className="text-white font-black text-lg mb-1">₦{p.monthly.toLocaleString()}/mo</p>
                  <p className="text-slate text-xs">{p.covers}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSubscribed(true)}
              className="w-full flex items-center justify-center gap-2 bg-lemon text-[#0F172A] font-black py-4 rounded-full hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all"
            >
              <TrendingDown size={18} /> Subscribe to {plan.label} Plan
            </button>
          </>
        )}
      </div>
    </PageShell>
  );
}
