import Head from 'next/head';
import Link from 'next/link';
import PageShell from './PageShell';
import LandingNavbar from './LandingNavbar';

interface CategoryDashboardStubProps {
  emoji: string;
  title: string;
  description: string;
}

export default function CategoryDashboardStub({ emoji, title, description }: CategoryDashboardStubProps) {
  return (
    <PageShell>
      <Head>
        <title>{title} Dashboard — TPMarket</title>
      </Head>
      <LandingNavbar />

      <div className="max-w-xl mx-auto px-6 py-16 text-center relative">
        <div className="w-20 h-20 rounded-full bg-darkcard border-4 border-lemon/40 flex items-center justify-center text-4xl mx-auto mb-5">
          {emoji}
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-3">{title} Dashboard</h1>
        <p className="text-[#64748B] font-medium mb-8">{description}</p>

        <div className="bg-darkcard rounded-3xl p-8 border border-white/10">
          <p className="text-white font-bold mb-2">🚧 Profile setup coming soon</p>
          <p className="text-slate text-sm">
            This is where you'll complete your {title.toLowerCase()} profile, list what you offer, and start receiving jobs.
          </p>
        </div>

        <Link
          href="/provider/category-selection"
          className="inline-block mt-8 text-[#0F172A]/70 hover:text-[#0F172A] font-semibold text-sm transition-colors"
        >
          ← Back to Category Selection
        </Link>
      </div>
    </PageShell>
  );
}
