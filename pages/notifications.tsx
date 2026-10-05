import Head from 'next/head';
import { Bell, ShieldCheck, Wrench, Gift } from 'lucide-react';
import PageShell from '../components/PageShell';
import LandingNavbar from '../components/LandingNavbar';
import BottomNav from '../components/BottomNav';

interface Notification {
  id: string;
  icon: typeof Bell;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

const notifications: Notification[] = [
  {
    id: '1',
    icon: Wrench,
    title: 'Booking Confirmed',
    detail: 'Your Car AC Regassing with Kelechi Chidi is booked for tomorrow.',
    time: '2h ago',
    unread: true,
  },
  {
    id: '2',
    icon: ShieldCheck,
    title: '90-Day Guarantee Active',
    detail: 'Your Toyota Brake Pads purchase is now covered until Dec 23.',
    time: '1d ago',
    unread: true,
  },
  {
    id: '3',
    icon: Gift,
    title: 'TP Coins Earned',
    detail: 'You earned 50 TP Coins from a successful referral.',
    time: '3d ago',
    unread: true,
  },
  {
    id: '4',
    icon: Bell,
    title: 'Welcome to tpmarket',
    detail: 'Complete your profile to unlock the full marketplace experience.',
    time: '1w ago',
    unread: false,
  },
];

export default function Notifications() {
  return (
    <PageShell>
      <Head>
        <title>Notifications — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-2xl mx-auto px-6 py-10 pb-28">
        <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-6">Notifications 🔔</h1>

        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="flex items-start gap-3 bg-darkcard rounded-2xl p-4 border border-white/10"
              >
                <span className="w-10 h-10 rounded-full bg-lemon/10 text-lemon flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-sm">{n.title}</p>
                    {n.unread && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                  </div>
                  <p className="text-slate text-xs mt-0.5">{n.detail}</p>
                  <p className="text-slate/50 text-[10px] mt-1.5">{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </PageShell>
  );
}
