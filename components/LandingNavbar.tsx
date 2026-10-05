import { useState } from 'react';
import Link from 'next/link';
import { Zap, Menu, X } from 'lucide-react';

const mobileLinks = [
  { href: '/', label: 'Home' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/artisan/tailor', label: 'Tailor Storefront' },
  { href: '/artisan/profile', label: 'Artisan Demo' },
  { href: '/dashboard/customer', label: 'Dashboard' },
];

export default function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/40 backdrop-blur-xl border-b border-white/60">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-xl text-[#0F172A]"
          onClick={() => setMenuOpen(false)}
        >
          <Zap className="text-purple" size={24} fill="currentColor" />
          <span>
            TP<span className="text-purple">Market</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[#0F172A]/70">
          <Link href="/#features" className="hover:text-[#0F172A] transition-colors">
            Features
          </Link>
          <Link href="/marketplace" className="hover:text-[#0F172A] transition-colors">
            Marketplace
          </Link>
          <Link href="/dashboard/customer" className="hover:text-[#0F172A] transition-colors">
            Customer
          </Link>
          <Link href="/dashboard/provider" className="hover:text-[#0F172A] transition-colors">
            Provider
          </Link>
          <Link href="/provider/tailor" className="hover:text-[#0F172A] transition-colors">
            Tailor Studio
          </Link>
          <Link href="/artisan/tailor" className="hover:text-[#0F172A] transition-colors">
            Tailor Storefront
          </Link>
          <Link href="/artisan/profile" className="hover:text-[#0F172A] transition-colors">
            Artisan Demo
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="hidden sm:inline-block text-[#0F172A]/70 font-bold text-sm hover:text-[#0F172A] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth"
            className="hidden sm:inline-block bg-lemon text-[#0F172A] font-black px-5 py-2.5 rounded-full text-sm hover:scale-105 hover:shadow-[0_0_25px_rgba(204,255,0,0.6)] transition-all"
          >
            Get Started 🚀
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden w-11 h-11 rounded-full bg-white/70 border border-white flex items-center justify-center text-[#0F172A] hover:bg-white transition-colors"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-gradient-to-b from-sky via-cyanlight to-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/60">
            <Link
              href="/"
              className="flex items-center gap-2 font-black text-xl text-[#0F172A]"
              onClick={() => setMenuOpen(false)}
            >
              <Zap className="text-purple" size={24} fill="currentColor" />
              <span>
                TP<span className="text-purple">Market</span>
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="w-11 h-11 rounded-full bg-darkcard text-lemon flex items-center justify-center hover:scale-105 transition-all"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 px-6 py-12">
            {mobileLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="w-full max-w-xs text-center bg-darkcard text-white font-black text-lg py-4 rounded-full border border-white/10 hover:border-lemon/50 hover:-translate-y-0.5 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/signin"
              onClick={() => setMenuOpen(false)}
              className="w-full max-w-xs text-center border border-white/10 text-white font-black text-lg py-4 rounded-full hover:border-lemon/50 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              onClick={() => setMenuOpen(false)}
              className="w-full max-w-xs text-center bg-lemon text-[#0F172A] font-black text-lg py-4 rounded-full mt-2 hover:scale-105 hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] transition-all"
            >
              Get Started 🚀
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
