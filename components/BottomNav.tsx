import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, ShoppingBag, ShoppingCart, Bell, User } from 'lucide-react';

export default function BottomNav() {
  const router = useRouter();

  // HARDCODED to the exact link that works at the top of your app.
  const accountLink = '/dashboard'; 

  // 5 perfectly spaced tabs for mobile
  const items = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/marketplace', icon: ShoppingBag },
    { label: 'Cart', href: '/cart', icon: ShoppingCart },
    { label: 'Alerts', href: '/notifications', icon: Bell, badge: 3 }, // Shortened to "Alerts" to fit mobile screens perfectly
    { label: 'Account', href: accountLink, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-darkcard border-t border-white/10">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {items.map((item) => {
          const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
                isActive ? 'text-lemon' : 'text-slate hover:text-white'
              }`}
            >
              <span className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {!!item.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {item.badge}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}