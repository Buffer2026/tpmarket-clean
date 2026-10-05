import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-xl">
          <Zap className="text-lemon" size={24} />
          <span>
            TP<span className="text-lemon">Market</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate">
          <Link href="/#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/dashboard/customer" className="hover:text-white transition-colors">
            Customer
          </Link>
          <Link href="/dashboard/provider" className="hover:text-white transition-colors">
            Provider
          </Link>
        </div>
        <Link
          href="/auth"
          className="bg-lemon text-navy font-bold px-5 py-2 rounded-full text-sm hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-shadow"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
