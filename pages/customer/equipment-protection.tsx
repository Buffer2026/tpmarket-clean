import { useState, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

const equipmentTypes = ['Car', 'Phone', 'AC', 'Fridge', 'TV', 'Solar', 'Other'];
const MAX_ITEMS = 15;
const FEE = 10000;

interface Item {
  name: string;
  type: string;
}

export default function EquipmentProtection() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState(equipmentTypes[0]);
  const [activated, setActivated] = useState(false);

  function handleAddItem(e: FormEvent) {
    e.preventDefault();
    if (name.trim() === '' || items.length >= MAX_ITEMS) return;
    setItems((prev) => [...prev, { name: name.trim(), type }]);
    setName('');
  }

  function handleActivate() {
    setActivated(true);
  }

  return (
    <PageShell>
      <Head>
        <title>Secure My Equipment — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-xl mx-auto px-6 py-10 relative">
        <Link href="/customer/missions" className="flex items-center gap-1 text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Missions
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">Secure My Equipment 🛡️</h1>
          <p className="text-[#64748B] font-medium">
            Register your equipment for instant response & installment repairs.
          </p>
        </div>

        <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
          <ul className="space-y-2 text-slate text-sm mb-2">
            <li>✅ Register up to {MAX_ITEMS} items (Car, Phone, AC, Fridge, TV, Solar, etc.)</li>
            <li>✅ Get a 90-day guarantee on repairs</li>
            <li>✅ One-time fee of ₦{FEE.toLocaleString()}</li>
            <li>✅ If stolen, your item is published instantly across the network</li>
          </ul>
        </div>

        {activated ? (
          <div className="bg-darkcard rounded-3xl p-8 border border-white/10 text-center">
            <div className="w-14 h-14 rounded-full bg-lemon/20 text-lemon flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={26} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Protected! 🎉</h2>
            <p className="text-slate text-sm">
              {items.length} item{items.length === 1 ? '' : 's'} registered. Your 90-day repair guarantee is now active.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-darkcard rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)] mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-black text-lg">Your Equipment</h2>
                <span className="text-xs font-black px-3 py-1.5 rounded-full bg-lemon/10 text-lemon">
                  {items.length}/{MAX_ITEMS} registered
                </span>
              </div>

              {items.length > 0 && (
                <div className="space-y-2 mb-5">
                  {items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
                      <span className="text-white text-sm font-semibold">{it.name}</span>
                      <span className="text-slate text-xs font-bold">{it.type}</span>
                    </div>
                  ))}
                </div>
              )}

              {items.length < MAX_ITEMS && (
                <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Toyota Camry 2019"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate/60 focus:outline-none focus:border-lemon/50"
                  />
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-sm text-white focus:outline-none focus:border-lemon/50"
                  >
                    {equipmentTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1 bg-white/10 text-white font-bold px-4 py-3 rounded-xl hover:bg-white/20 transition-colors shrink-0"
                  >
                    <Plus size={16} /> Add
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={handleActivate}
              disabled={items.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-lemon text-[#0F172A] font-black py-4 rounded-full hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <CheckCircle2 size={18} /> Activate Protection — Pay ₦{FEE.toLocaleString()}
            </button>
          </>
        )}
      </div>
    </PageShell>
  );
}
