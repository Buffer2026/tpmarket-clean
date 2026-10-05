import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Users, Coins, TrendingUp, Clock3 } from 'lucide-react';
import GradientOrbs from '../components/GradientOrbs';
import LandingNavbar from '../components/LandingNavbar';
import BentoCard from '../components/BentoCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky via-cyanlight to-white text-[#0F172A] relative overflow-hidden">
      <Head>
        <title>TPMarket — No Cap. Just Guaranteed Products & Services.</title>
      </Head>

      <GradientOrbs />
      <LandingNavbar />

      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center relative">
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-white shadow-sm rounded-full px-5 py-2 text-sm font-bold text-purple mb-8">
          ✨ Trusted Professionals Market
        </div>
        <h1 className="text-6xl md:text-8xl font-black leading-[0.95] mb-6 text-[#0F172A]">
          No Cap. Just{' '}
          <span className="bg-gradient-to-r from-purple to-lemon bg-clip-text text-transparent">
            Guaranteed
          </span>{' '}
          Products &amp; Services.
        </h1>
        <p className="text-[#334155] text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
          Stop getting scammed by fake products and ghosting artisans. tpmarket is the only
          place where your money actually works for you. 🛡️
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/provider/register"
            className="w-full sm:w-auto bg-lemon text-[#0F172A] font-black px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:scale-105 hover:shadow-[0_0_35px_rgba(204,255,0,0.6)] transition-all"
          >
            Become A Seller/ Service Provider (Free)
          </Link>
          <Link
            href="/customer/register"
            className="w-full sm:w-auto bg-white/70 backdrop-blur-xl border-2 border-sky text-[#0F172A] font-black px-8 py-4 rounded-full hover:scale-105 hover:bg-white transition-all"
          >
            I'm A New Customer
          </Link>
        </div>
        <div className="mt-6">
          <Link
            href="/marketplace"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-darkcard text-lemon font-black text-lg px-10 py-5 rounded-full hover:scale-105 hover:shadow-[0_0_35px_rgba(204,255,0,0.35)] transition-all"
          >
            🛒 Browse Marketplace
          </Link>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 pb-24 relative">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-3 text-[#0F172A]">Built Different ✨</h2>
          <p className="text-[#334155] font-medium">Everything you need, none of the cap.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <BentoCard
            emoji="💸"
            title="Your Money Actually Works"
            description="No overpaying for fake spare parts. Every naira goes toward what you actually ordered."
            accent="lemon"
            className="md:col-span-2"
          />
          <BentoCard
            emoji="👻"
            title="No Ghosting"
            description="Verified artisans who can't run away with your money mid-job."
            accent="purple"
          />
          <BentoCard
            emoji="🪙"
            title="Stack TP Coins"
            description="Build credit toward Buy Now, Pay Later on every order you complete."
            accent="lemon"
          />
          <BentoCard
            icon={Clock3}
            emoji="⏱️"
            title="We Pay If They're Late"
            description="Time is money — get compensated automatically when a provider misses the deadline."
            accent="sky"
            className="md:col-span-2"
          />
          <BentoCard
            icon={Coins}
            title="TP Coins Rewards"
            description="Earn coins on every completed order and redeem them for discounts."
            accent="purple"
          />
          <BentoCard
            icon={Zap}
            title="Instant Matching"
            description="Get matched with vetted providers in seconds, not days."
            accent="lemon"
          />
          <BentoCard
            icon={ShieldCheck}
            title="Verified Providers"
            description="Every tailor and vendor is ID-verified and rated by real customers. 🛡️"
            accent="sky"
            className="md:col-span-2"
          />
          <BentoCard
            icon={Users}
            title="Escrow Protected"
            description="Funds are held safely until you confirm delivery. No scams, no stress."
            accent="purple"
          />
          <BentoCard
            icon={TrendingUp}
            title="Track Everything"
            description="Live order status, delivery timelines, and dispute resolution built in."
            accent="lemon"
            className="md:col-span-3"
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 text-center relative">
        <div className="bg-darkcard rounded-3xl p-12 shadow-[0_0_60px_rgba(139,92,246,0.35)] border border-white/10">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">Ready to get started? 🚀</h2>
          <p className="text-slate mb-8">Join TPMarket today and experience guaranteed deals.</p>
          <Link
            href="/customer/register"
            className="inline-flex items-center gap-2 bg-lemon text-[#0F172A] font-black px-8 py-4 rounded-full hover:scale-105 hover:shadow-[0_0_35px_rgba(204,255,0,0.6)] transition-all"
          >
            Create Free Account 🚀
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/60 py-8 text-center text-[#334155] text-sm relative">
        © 2026 TPMarket. Built for the culture. ✨
      </footer>
    </div>
  );
}
