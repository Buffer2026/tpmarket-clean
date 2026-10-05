import { useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShieldCheck, Star, X, ShoppingCart, Wrench, Search } from 'lucide-react';
import PageShell from '../components/PageShell';
import LandingNavbar from '../components/LandingNavbar';
import BottomNav from '../components/BottomNav';
import { isAuthenticated } from '../lib/auth';

interface Listing {
  id: string;
  name: string;
  emoji: string;
  price: string;
  priceValue: number;
  seller: string;
  rating: number;
  reviews: number;
  type: 'Buy' | 'Book';
  category: string;
}

const CATEGORIES = [
  'All Categories',
  'Car Spare Parts',
  'Mechanics',
  'Builders & Construction',
  'Electricians',
  'Tailors & Fashion',
  'Computer & Phone Engineers',
  'Web/App Developers',
  'Solar Equipment & Technicians',
  'Delivery Services',
  'Home Services',
  'Electronics & Appliances',
  'Office Equipment',
  'Hospital Equipment',
];

const SORT_OPTIONS = ['Newest', 'Price (Low-High)', 'Price (High-Low)', 'Popular'] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

interface AdSlide {
  id: string;
  brand: string;
  title: string;
  subtitle: string;
  emoji: string;
  cta: string;
  gradient: string;
}

// Sponsored slots — paid ad placements only.
const AD_SLIDES: AdSlide[] = [
  {
    id: 'ad1',
    brand: 'itel Energy',
    title: 'itel Power Go Pro',
    subtitle: '200W Solar Charging • AC + DC + USB Output',
    emoji: '🔋',
    cta: 'Buy Now',
    gradient: 'from-[#1E3A8A] to-[#0F172A]',
  },
  {
    id: 'ad2',
    brand: 'tpwecan Cooperative',
    title: 'Join tpwecan Today',
    subtitle: 'Save together, grow together — open an account in minutes',
    emoji: '🤝',
    cta: 'Learn More',
    gradient: 'from-[#166534] to-[#0F172A]',
  },
  {
    id: 'ad3',
    brand: 'TP Coins',
    title: 'Refer & Earn Up To ₦5M',
    subtitle: '10% lifetime commission on every referral\'s purchases',
    emoji: '🪙',
    cta: 'Start Referring',
    gradient: 'from-[#78350F] to-[#0F172A]',
  },
];

const listings: Listing[] = [
  { id: '1', name: 'Toyota Brake Pads (Front Set)', emoji: '🛸', price: '₦18,500', priceValue: 18500, seller: 'AutoParts Hub', rating: 4.8, reviews: 132, type: 'Buy', category: 'Car Spare Parts' },
  { id: '2', name: '5KVA Solar Inverter', emoji: '🔋', price: '₦620,000', priceValue: 620000, seller: 'SolarTech NG', rating: 4.9, reviews: 87, type: 'Buy', category: 'Solar Equipment & Technicians' },
  { id: '3', name: 'Mobile Vulcanizer Call-Out', emoji: '🔧', price: 'From ₦2,000', priceValue: 2000, seller: 'Tunde Bakare', rating: 4.6, reviews: 112, type: 'Book', category: 'Mechanics' },
  { id: '4', name: 'Car AC Regassing', emoji: '❄️', price: 'From ₦12,000', priceValue: 12000, seller: 'Kelechi Chidi', rating: 4.7, reviews: 65, type: 'Book', category: 'Mechanics' },
  { id: '5', name: 'Heavy Duty Car Battery', emoji: '🔌', price: '₦45,000', priceValue: 45000, seller: 'AutoParts Hub', rating: 4.7, reviews: 94, type: 'Buy', category: 'Car Spare Parts' },
  { id: '6', name: 'Generator Repair & Servicing', emoji: '🛠️', price: 'From ₦8,000', priceValue: 8000, seller: 'Ifeanyi Obi', rating: 4.9, reviews: 203, type: 'Book', category: 'Mechanics' },
  { id: '7', name: '185/65R15 Tyre (Set of 4)', emoji: '⚙️', price: '₦210,000', priceValue: 210000, seller: 'TyrePoint NG', rating: 4.5, reviews: 58, type: 'Buy', category: 'Car Spare Parts' },
  { id: '8', name: 'Home Deep Cleaning', emoji: '🧹', price: 'From ₦15,000', priceValue: 15000, seller: 'Amaka Nwosu', rating: 4.8, reviews: 67, type: 'Book', category: 'Home Services' },
  { id: '9', name: 'Home Painter (2 Rooms)', emoji: '🎨', price: 'From ₦35,000', priceValue: 35000, seller: 'Segun Adewale', rating: 4.6, reviews: 41, type: 'Book', category: 'Builders & Construction' },
  { id: '10', name: 'Home Electrician Visit', emoji: '💡', price: 'From ₦6,000', priceValue: 6000, seller: 'Chuka Eze', rating: 4.8, reviews: 89, type: 'Book', category: 'Electricians' },
  { id: '11', name: 'Custom Ankara Outfit', emoji: '🧵', price: 'From ₦25,000', priceValue: 25000, seller: 'Zainab Styles', rating: 4.9, reviews: 76, type: 'Book', category: 'Tailors & Fashion' },
  { id: '12', name: 'Phone Screen Repair', emoji: '📱', price: 'From ₦10,000', priceValue: 10000, seller: 'GadgetFix Lagos', rating: 4.7, reviews: 154, type: 'Book', category: 'Computer & Phone Engineers' },
  { id: '13', name: 'Business Website Build', emoji: '💻', price: 'From ₦150,000', priceValue: 150000, seller: 'CodeCraft Studio', rating: 5.0, reviews: 22, type: 'Book', category: 'Web/App Developers' },
  { id: '14', name: 'Bike Delivery (Same-Day)', emoji: '🏍️', price: 'From ₦1,500', priceValue: 1500, seller: 'QuickSend NG', rating: 4.6, reviews: 301, type: 'Book', category: 'Delivery Services' },
  { id: '15', name: 'Office Photocopier (A3)', emoji: '🖨️', price: '₦285,000', priceValue: 285000, seller: 'OfficePro Supplies', rating: 4.4, reviews: 19, type: 'Buy', category: 'Office Equipment' },
  { id: '16', name: 'Standing Fan (18-inch)', emoji: '🌀', price: '₦32,000', priceValue: 32000, seller: 'HomeElectronics NG', rating: 4.5, reviews: 63, type: 'Buy', category: 'Electronics & Appliances' },
  { id: '17', name: 'Hospital Bed (Manual)', emoji: '🏥', price: '₦380,000', priceValue: 380000, seller: 'MedEquip Nigeria', rating: 4.7, reviews: 14, type: 'Buy', category: 'Hospital Equipment' },
];

export default function Marketplace() {
  const router = useRouter();
  const [showGate, setShowGate] = useState(false);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState<SortOption>('Newest');
  const [adSlide, setAdSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAdSlide((i) => (i + 1) % AD_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  function handleAction(listing: Listing) {
    if (isAuthenticated()) {
      if (listing.category === 'Tailors & Fashion') {
        router.push('/artisan/tailor-profile');
        return;
      }
      router.push(listing.type === 'Buy' ? `/checkout?item=${listing.id}` : `/chat?item=${listing.id}`);
      return;
    }
    setSelected(listing);
    setShowGate(true);
  }

  function closeGate() {
    setShowGate(false);
    setSelected(null);
  }

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = listings.filter((item) => {
      const matchesCategory = category === 'All Categories' || item.category === category;
      const matchesSearch =
        query === '' ||
        item.name.toLowerCase().includes(query) ||
        item.seller.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'Price (Low-High)') {
      result = [...result].sort((a, b) => a.priceValue - b.priceValue);
    } else if (sortBy === 'Price (High-Low)') {
      result = [...result].sort((a, b) => b.priceValue - a.priceValue);
    } else if (sortBy === 'Popular') {
      result = [...result].sort((a, b) => b.reviews - a.reviews);
    }
    // 'Newest' keeps the original listing order

    return result;
  }, [search, category, sortBy]);

  return (
    <PageShell>
      <Head>
        <title>Marketplace — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-6xl mx-auto px-6 py-10 pb-28 relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] mb-2">Marketplace 🛒</h1>
          <p className="text-[#64748B] font-medium">Genuine parts and verified services, every purchase 90-Day Guaranteed.</p>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-darkcard rounded-2xl border border-white/10 p-2 mb-5 shadow-[0_10px_30px_rgba(15,23,42,0.25)]">
          <Search className="text-slate ml-3 shrink-0" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for products, services, artisans..."
            className="w-full bg-transparent py-3 px-1 text-sm sm:text-base text-white placeholder:text-slate/60 focus:outline-none"
          />
          <button
            type="button"
            aria-label="Search"
            className="shrink-0 bg-lemon text-[#0F172A] font-black p-3 sm:px-5 rounded-xl hover:scale-105 hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Sponsored ad carousel — paid placements only */}
        <div className="relative overflow-hidden rounded-3xl mb-8 shadow-[0_15px_40px_rgba(15,23,42,0.3)]">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${adSlide * 100}%)` }}
          >
            {AD_SLIDES.map((ad) => (
              <button
                key={ad.id}
                type="button"
                onClick={() => setCategory('All Categories')}
                className={`shrink-0 w-full text-left bg-gradient-to-br ${ad.gradient} px-6 sm:px-10 py-8 sm:py-12 flex items-center justify-between gap-4 hover:brightness-110 transition-all`}
              >
                <div>
                  <span className="inline-block bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full mb-3">
                    Sponsored · {ad.brand}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black text-white mb-2 leading-tight">{ad.title}</h3>
                  <p className="text-white/70 text-xs sm:text-sm font-medium mb-4 max-w-xs">{ad.subtitle}</p>
                  <span className="inline-block bg-lemon text-[#0F172A] font-black text-xs sm:text-sm px-5 py-2.5 rounded-full">
                    {ad.cta}
                  </span>
                </div>
                <div className="text-6xl sm:text-8xl shrink-0 opacity-90">{ad.emoji}</div>
              </button>
            ))}
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {AD_SLIDES.map((ad, i) => (
              <button
                key={ad.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setAdSlide(i)}
                className={`h-1.5 rounded-full transition-all ${i === adSlide ? 'w-6 bg-lemon' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* Category filter + sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 whitespace-nowrap text-xs sm:text-sm font-bold px-4 py-2 rounded-full border transition-all ${
                  category === cat
                    ? 'bg-lemon text-[#0F172A] border-lemon'
                    : 'bg-darkcard text-white/80 border-white/10 hover:border-lemon/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs sm:text-sm">
            <label htmlFor="sort" className="text-[#334155] font-bold">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-darkcard text-white font-bold border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-lemon/50"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="text-center text-[#64748B] font-medium py-16">
            No matches found. Try a different search or category.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {visible.map((item) => (
              <div
                key={item.id}
                className="bg-darkcard rounded-3xl overflow-hidden border border-white/10 hover:scale-105 hover:shadow-[0_20px_50px_rgba(15,23,42,0.35)] transition-all duration-300 flex flex-col"
              >
                <div className="h-24 sm:h-28 bg-gradient-to-br from-sky/30 to-lemon/10 flex items-center justify-center text-4xl sm:text-5xl">
                  {item.emoji}
                </div>
                <div className="p-4 flex flex-col grow">
                  <p className="text-[10px] font-bold text-lemon/80 uppercase tracking-wide mb-1">{item.category}</p>
                  <div className="flex items-start gap-1 mb-1">
                    <p className="font-black text-white text-sm sm:text-base leading-snug">{item.name}</p>
                    <ShieldCheck className="text-lemon shrink-0 mt-0.5" size={14} />
                  </div>
                  <p className="flex items-center gap-1 text-xs font-bold text-yellow mb-1">
                    <Star size={11} fill="currentColor" /> {item.rating} ({item.reviews})
                  </p>
                  <p className="text-slate text-xs mb-1">{item.seller}</p>
                  <p className="text-lemon font-black text-sm mb-4">{item.price}</p>
                  <button
                    type="button"
                    onClick={() => handleAction(item)}
                    className="mt-auto flex items-center justify-center gap-1.5 bg-lemon text-[#0F172A] font-black text-xs sm:text-sm px-3 py-2.5 rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all"
                  >
                    {item.type === 'Buy' ? <ShoppingCart size={14} /> : <Wrench size={14} />}
                    {item.type === 'Buy' ? 'Buy' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Large sponsored banner — paid placement only */}
        <div className="mt-10 bg-darkcard rounded-3xl overflow-hidden border border-white/10 relative">
          <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 sm:px-14 py-10 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <span className="inline-block bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full mb-3">
                Sponsored
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                Get the 24/7 Emergency Badge on Your Profile
              </h3>
              <p className="text-slate text-sm max-w-md">
                Verified artisans who go 24/7 get priority placement across the marketplace.
              </p>
            </div>
            <span className="shrink-0 bg-lemon text-[#0F172A] font-black text-sm px-6 py-3.5 rounded-full">
              Upgrade Profile
            </span>
          </div>
        </div>
      </div>

      {showGate && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-[#0F172A]/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-darkcard rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.5)] relative">
            <button
              type="button"
              onClick={closeGate}
              aria-label="Close"
              className="absolute top-4 right-4 text-slate hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 rounded-full bg-lemon/10 text-lemon flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={26} />
            </div>

            <h2 className="text-lg font-black text-white text-center mb-2">Almost there!</h2>
            <p className="text-slate text-sm text-center mb-6">
              Please Sign In or Register to complete your purchase and get the 90-Day Guarantee.
            </p>

            <div className="space-y-3">
              <Link
                href="/signin"
                className="block text-center bg-lemon text-[#0F172A] font-black py-3.5 rounded-xl hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/customer/register"
                className="block text-center bg-white/5 border border-white/10 text-white font-black py-3.5 rounded-xl hover:border-lemon/50 hover:bg-white/10 transition-all"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </PageShell>
  );
}
