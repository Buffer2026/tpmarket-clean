import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

interface CategoryOption {
  key: string;
  emoji: string;
  title: string;
  description: string;
  href: string;
}

const categories: CategoryOption[] = [
  {
    key: 'artisan',
    emoji: '🛠️',
    title: 'Artisan',
    description: 'Mechanic, Electrician, Technician, Tailor, Builder, Tiler, Car Painter, etc.',
    href: '/provider/dashboard',
  },
  {
    key: 'sellers',
    emoji: '🛒',
    title: 'Sellers / Dealers',
    description: 'Car Spares, Phone Parts, Accessories, Electrical Materials, Office/Computer Parts, Building Materials, Solar/Electronic Spares.',
    href: '/provider/seller-dashboard',
  },
  {
    key: 'delivery',
    emoji: '🚚',
    title: 'Delivery',
    description: 'Run Errands, Bike, Car, Pickup, Mini Truck, 10-Tyre Truck.',
    href: '/provider/delivery-dashboard',
  },
  {
    key: 'services',
    emoji: '🧹',
    title: 'Services / Hire Me',
    description: 'Cleaner, Fumigation, House Help/Nanny, Caregiver, House Agent, Errands Service.',
    href: '/provider/services-dashboard',
  },
];

export default function CategorySelection() {
  const router = useRouter();
  const [clicked, setClicked] = useState<string | null>(null);

  function handleSelect(cat: CategoryOption) {
    if (clicked) return;
    setClicked(cat.key);
    setTimeout(() => router.push(cat.href), 500);
  }

  return (
    <PageShell>
      <Head>
        <title>Choose Your Category — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-4xl mx-auto px-6 py-10 relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">What Do You Offer? 📂</h1>
          <p className="text-[#64748B] font-medium">Tap a category to set up your profile.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {categories.map((cat) => {
            const isSelected = clicked === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleSelect(cat)}
                className={`text-left bg-darkcard rounded-3xl p-6 sm:p-8 border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-lemon shadow-[0_0_30px_rgba(204,255,0,0.6)] scale-[1.02]'
                    : 'border-white/10 hover:border-white/25 hover:-translate-y-1'
                } shadow-[0_20px_60px_rgba(15,23,42,0.35)]`}
              >
                <h2 className="text-white font-black text-xl mb-2">
                  {cat.emoji} {cat.title}
                </h2>
                <p className="text-slate text-sm leading-relaxed mb-3">{cat.description}</p>
                <p className="text-lemon text-xs font-bold">Tap to continue →</p>
              </button>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
