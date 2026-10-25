import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ShoppingBag, ShoppingCart, Bell, Heart, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function BottomNav() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Hardcoded to the working dashboard link
  const accountLink = '/provider/dashboard'; 

  // Fetch the REAL number of unread notifications
  useEffect(() => {
    async function getUnreadCount() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        
        setUnreadCount(count || 0);
      }
    }
    getUnreadCount();
  }, []);

  const items = [
    { label: 'Shop', href: '/marketplace', icon: ShoppingBag },
    { label: 'Cart', href: '/cart', icon: ShoppingCart },
    { label: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount }, // Now uses real count!
    { label: 'Wishlist', href: '/wishlist', icon: Heart },
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
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {/* Only show badge if count is greater than 0 */}
                {item.badge > 0 && (
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