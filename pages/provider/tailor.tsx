import Head from 'next/head';
import Link from 'next/link';
import { Ruler, Scissors } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';

interface TailorOrder {
  id: string;
  customer: string;
  item: string;
  stage: string;
  progress: number;
  color: 'lemon' | 'purple';
}

const orders: TailorOrder[] = [
  { id: 'ORD-1042', customer: 'Amara Okafor', item: 'Custom Agbada — Blue Damask', stage: 'Stitching', progress: 65, color: 'lemon' },
  { id: 'ORD-1050', customer: 'Tobi Adeyemi', item: 'Ankara Two-Piece Set', stage: 'Measuring', progress: 20, color: 'purple' },
  { id: 'ORD-1048', customer: 'Ifeoma Nnamdi', item: 'Corporate Kaftan', stage: 'Finishing Touches', progress: 90, color: 'lemon' },
];

const barColor: Record<string, string> = {
  lemon: 'bg-lemon',
  purple: 'bg-purple',
};

export default function TailorStudio() {
  return (
    <PageShell>
      <Head>
        <title>Tailor Studio — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-6xl mx-auto px-6 py-10 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">🧵 Tailor Studio</h1>
            <p className="text-[#64748B] font-medium">Track every piece from measurement to delivery.</p>
          </div>
          <Link href="/dashboard/provider" className="hidden sm:inline-block text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {orders.map((order) => (
            <div key={order.id} className="bg-darkcard rounded-3xl p-6 border border-white/10 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-black text-white text-lg">{order.item}</p>
                  <p className="text-slate text-sm">{order.customer} · {order.id}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-lemon/10 text-lemon flex items-center justify-center">
                  <Scissors size={18} />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate font-semibold">{order.stage}</span>
                <span className="text-white font-black">{order.progress}%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor[order.color]} transition-all duration-500`}
                  style={{ width: `${order.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-darkcard rounded-3xl p-6 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple/10 text-purple flex items-center justify-center shrink-0">
            <Ruler size={22} />
          </div>
          <div>
            <p className="font-black text-white">Need to log a new measurement? 📏</p>
            <p className="text-slate text-sm">Keep client sizing on file for faster future orders.</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
