import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

interface MissionCard {
  key: string;
  emoji: string;
  title: string;
  description: string;
  href: string;
}

const missions: MissionCard[] = [
  {
    key: 'artisan',
    emoji: '🛠️',
    title: "I'm in need of an Artisan",
    description: 'Mechanic, Tailor, Electrician, Car Painter, Computer Engineer, etc.',
    href: '/marketplace',
  },
  {
    key: 'seller',
    emoji: '🛒',
    title: "I'm in need of a Seller/Dealer",
    description: 'Car Spares, Building Materials, Phone/Computer/Solar Spares, etc.',
    href: '/customer/request/seller',
  },
  {
    key: 'delivery',
    emoji: '🚚',
    title: "I'm in need of a Delivery Agent",
    description: 'Bike, Errand Boy, Car, Mini Truck, 10-Tyre Truck, etc.',
    href: '/customer/request/delivery',
  },
  {
    key: 'services',
    emoji: '🧹',
    title: "I'm in need of Services/Hiring",
    description: 'Cleaner, Worker, Fumigation, House Help, Nanny, House Agent, Caregiver.',
    href: '/customer/request/services',
  },
  {
    key: 'secure-equipment',
    emoji: '🛡️',
    title: 'Secure My Equipments',
    description:
      'Register equipment for instant response & installment repairs. Register 15 items to get a 90-day guarantee on repairs (Car, Phone, AC, Fridge, TV, Solar, etc.) for just ₦10,000. Published instantly if stolen!',
    href: '/customer/equipment-protection',
  },
  {
    key: 'maintenance',
    emoji: '📉',
    title: 'Cut Down Maintenance Cost',
    description:
      'Upgrade registered equipment to a 3-year maintenance insurance. Pay a monthly token to cover maintenance & spare parts (partnered with regulated insurance firms). Cut your costs by 40% without getting cheated!',
    href: '/customer/maintenance-insurance',
  },
];

export default function CustomerMissions() {
  const router = useRouter();
  const [clicked, setClicked] = useState<string | null>(null);

  function handleSelect(m: MissionCard) {
    if (clicked) return;
    setClicked(m.key);
    setTimeout(() => router.push(m.href), 450);
  }

  return (
    <PageShell>
      <Head>
        <title>Your Missions — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-5xl mx-auto px-6 py-10 relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">What Do You Need Today? 🎯</h1>
          <p className="text-[#64748B] font-medium">Pick a mission to get started — zero cap, guaranteed help.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {missions.map((m) => {
            const isSelected = clicked === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => handleSelect(m)}
                className={`text-left bg-darkcard rounded-3xl p-6 sm:p-7 border-2 transition-all ${
                  isSelected
                    ? 'border-lemon shadow-[0_0_30px_rgba(204,255,0,0.6)] scale-[1.02]'
                    : 'border-white/10 hover:border-white/25 hover:-translate-y-1'
                } shadow-[0_20px_60px_rgba(15,23,42,0.35)]`}
              >
                <h2 className="text-white font-black text-lg mb-2">
                  {m.emoji} {m.title}
                </h2>
                <p className="text-slate text-sm leading-relaxed">{m.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
