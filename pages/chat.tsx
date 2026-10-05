import Head from 'next/head';
import { useRouter } from 'next/router';
import { MessageCircle } from 'lucide-react';
import PageShell from '../components/PageShell';
import LandingNavbar from '../components/LandingNavbar';
import BottomNav from '../components/BottomNav';
import { useRequireAuth } from '../hooks/useAuth';

export default function Chat() {
  const { checked } = useRequireAuth();
  const router = useRouter();
  const itemId = typeof router.query.item === 'string' ? router.query.item : null;

  if (!checked) return null;

  return (
    <PageShell>
      <Head>
        <title>Chat — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-lg mx-auto px-6 py-16 pb-28 text-center">
        <div className="w-16 h-16 rounded-full bg-darkcard text-lemon flex items-center justify-center mx-auto mb-5">
          <MessageCircle size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-2">Connect with the Provider</h1>
        <p className="text-[#64748B] font-medium mb-8">
          {itemId ? `Starting a chat about listing #${itemId}.` : 'Start a conversation to book this service.'}
        </p>
        <div className="bg-darkcard rounded-3xl p-6 border border-white/10 text-left text-white/80 text-sm">
          Chat coming soon — you'll be able to message the artisan directly here.
        </div>
      </div>

      <BottomNav />
    </PageShell>
  );
}
