import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // 1. Listen for the auth state change (Official Supabase method for magic links)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        router.push('/marketplace');
      }
    });

    // 2. Fallback: manually check session in case the event doesn't fire immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/marketplace');
      }
    });

    // 3. Clean up the listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0F172A]">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#ccff00] border-t-transparent"></div>
        <p className="mt-4 text-white font-bold">Securing your session...</p>
      </div>
    </div>
  );
}