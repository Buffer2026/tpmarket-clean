import Head from 'next/head';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import PageShell from '../components/PageShell';
import LandingNavbar from '../components/LandingNavbar';
import BottomNav from '../components/BottomNav';

export default function Cart() {
  return (
    <PageShell>
      <Head>
        <title>Cart — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-2xl mx-auto px-6 py-16 pb-28 text-center">
        <div className="w-16 h-16 rounded-full bg-darkcard text-lemon flex items-center justify-center mx-auto mb-5">
          <ShoppingCart size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-2">Your Cart is Empty</h1>
        <p className="text-[#64748B] font-medium mb-8">Items you add from the Marketplace will show up here.</p>
        <Link
          href="/marketplace"
          className="inline-block bg-lemon text-[#0F172A] font-black px-8 py-3.5 rounded-full hover:scale-105 hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
        >
          Browse Marketplace
        </Link>
      </div>

      <BottomNav />
    </PageShell>
  );
}
