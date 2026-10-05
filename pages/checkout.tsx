import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShieldCheck } from 'lucide-react';
import PageShell from '../components/PageShell';
import LandingNavbar from '../components/LandingNavbar';
import BottomNav from '../components/BottomNav';
import { useRequireAuth } from '../hooks/useAuth';

export default function Checkout() {
  const { checked } = useRequireAuth();
  const router = useRouter();
  const itemId = typeof router.query.item === 'string' ? router.query.item : null;

  if (!checked) return null;

  return (
    <PageShell>
      <Head>
        <title>Checkout — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-lg mx-auto px-6 py-16 pb-28 text-center">
        <div className="w-16 h-16 rounded-full bg-darkcard text-lemon flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-2">Checkout</h1>
        <p className="text-[#64748B] font-medium mb-8">
          {itemId ? `Completing your purchase for item #${itemId}.` : 'Review your order below.'} Covered by the
          90-Day Guarantee.
        </p>
        <div className="bg-darkcard rounded-3xl p-6 border border-white/10 text-left text-white/80 text-sm">
          Checkout flow coming soon — payment, delivery details, and order confirmation will go here.
        </div>
      </div>

      <BottomNav />
    </PageShell>
  );
}
