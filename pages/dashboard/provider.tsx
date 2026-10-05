import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Package, Star, Wallet, Check, X, Clock, Bell, Phone } from 'lucide-react';
import PageShell from '../../components/PageShell';
import LandingNavbar from '../../components/LandingNavbar';
import StatCard from '../../components/StatCard';
import BottomNav from '../../components/BottomNav';
import { useRequireAuth } from '../../hooks/useAuth';

type OrderStatus = 'Pending' | 'Accepted' | 'Declined' | 'Completed';

interface Order {
  id: string;
  customer: string;
  item: string;
  amount: string;
  status: OrderStatus;
}

const initialOrders: Order[] = [
  { id: 'ORD-1042', customer: 'Amara Okafor', item: 'Custom Agbada — Blue Damask', amount: '₦45,000', status: 'Accepted' },
  { id: 'ORD-1050', customer: 'Tobi Adeyemi', item: 'Ankara Two-Piece Set', amount: '₦28,500', status: 'Pending' },
  { id: 'ORD-1048', customer: 'Ifeoma Nnamdi', item: 'Corporate Kaftan', amount: '₦32,000', status: 'Pending' },
];

const statusColor: Record<OrderStatus, string> = {
  Pending: 'text-yellow bg-yellow/10',
  Accepted: 'text-purple bg-purple/10',
  Declined: 'text-slate bg-white/10',
  Completed: 'text-lemon bg-lemon/10',
};

export default function ProviderDashboard() {
  const { checked, logout } = useRequireAuth();
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  function updateStatus(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  const activeCount = orders.filter((o) => o.status === 'Accepted').length;

  if (!checked) return null;

  return (
    <PageShell>
      <Head>
        <title>Provider Dashboard — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-6xl mx-auto px-6 py-10 pb-28 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-2">Welcome back, Kunle Tailors 🧵</h1>
            <p className="text-[#64748B] font-medium">Manage your incoming orders and grow your business.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/customer" className="hidden sm:inline-block text-sm font-bold text-[#0F172A]/70 hover:text-[#0F172A] transition-colors">
              Switch to Customer View →
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-bold text-white bg-darkcard px-4 py-2 rounded-full hover:bg-[#1E293B] transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <StatCard icon={Package} label="Active Orders" value={String(activeCount)} accent="lemon" />
          <StatCard icon={Wallet} label="Earnings This Month" value="₦312,000" accent="yellow" />
          <StatCard icon={Star} label="Rating" value="4.9" accent="purple" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          <Link
            href="/provider/settings"
            className="flex items-center justify-center gap-2 bg-lemon text-[#0F172A] font-black py-3.5 rounded-full hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
          >
            <Bell size={18} /> Notification Settings
          </Link>
          <Link
            href="/provider/incoming-call"
            className="flex items-center justify-center gap-2 bg-lemon text-[#0F172A] font-black py-3.5 rounded-full hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all"
          >
            <Phone size={18} /> View Mock AI Call Alert
          </Link>
        </div>

        <div className="bg-darkcard rounded-3xl p-6 border border-white/10">
          <h2 className="text-lg font-black text-white mb-5">Incoming Orders 📥</h2>
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 rounded-2xl p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{order.item}</p>
                  <p className="text-slate text-sm">
                    {order.customer} · {order.id} · {order.amount}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusColor[order.status]}`}>
                    {order.status}
                  </span>
                  {order.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, 'Accepted')}
                        className="w-9 h-9 rounded-full bg-lemon/20 text-lemon flex items-center justify-center hover:bg-lemon/30 hover:scale-110 transition-all"
                        aria-label={`Accept ${order.id}`}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, 'Declined')}
                        className="w-9 h-9 rounded-full bg-white/10 text-slate flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"
                        aria-label={`Decline ${order.id}`}
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  {order.status === 'Accepted' && (
                    <button
                      onClick={() => updateStatus(order.id, 'Completed')}
                      className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 text-white"
                    >
                      <Clock size={12} /> Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </PageShell>
  );
}
